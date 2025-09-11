import express from 'express'
import cookieParser from 'cookie-parser'
import { createTestDb } from './test-db.js'

export function createTestServer() {
  const testDb = createTestDb()
  const app = express()
  const AUTH_PASSWORD = 'temp123'

  const clientConnections = new Map()

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  app.post('/login', (req, res) => {
    const { password } = req.body

    if (password !== AUTH_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    const sessionId = generateSessionId()
    res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })

    res.json({ message: 'Login successful', sessionId })
  })

  app.post('/logout', (req, res) => {
    const { sessionId } = req.cookies

    if (sessionId && clientConnections.has(sessionId)) {
      clientConnections.delete(sessionId)
    }

    res.clearCookie('sessionId')
    res.json({ message: 'Logout successful' })
  })

  app.get('/api/items', (req, res) => {
    let { sort, order, start, limit = '20' } = req.query

    sort = (sort != null)
      ? sort.toString().toLowerCase()
      : 'created'

    order = (['asc', 'desc'].includes(order?.toLowerCase()))
      ? order
      : 'desc'

    limit = (limit != null)
      ? Math.min(parseInt(limit) || 100, 100)
      : 25

    let query = `
      SELECT 
        items.id, items.kind, items.title,
        COALESCE(
          (SELECT datetime FROM timestamps WHERE item_id = items.id AND kind = ? LIMIT 1),
          (SELECT datetime FROM timestamps WHERE item_id = items.id AND kind = 'created' LIMIT 1)
        ) as datetime
      FROM items`
    
    const params = [sort]

    if (start != null) {
      query += ` WHERE datetime ${order == 'asc' ? '>=' : '<='} ?`
      params.push(start)
    }

    query += ` ORDER BY datetime ${order}, items.id ${order} LIMIT ?`
    params.push(limit)
    
    try {
      const items = testDb.prepare(query).all(...params)
      res.json({ items })

    } catch (error) {
      console.error('[api]:', error)
      res.status(500).json({ error: error.message })
    }
  })

  return { app, db: testDb }
}

export function makeRequest(app, method, path, options = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, 'localhost', () => {
      const port = server.address().port
      const url = `http://localhost:${port}${path}`

      const fetchOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      }

      if (options.body) {
        if (options.form) {
          fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded'
          fetchOptions.body = new URLSearchParams(options.body).toString()
        } else {
          fetchOptions.body = JSON.stringify(options.body)
        }
      }

      if (options.cookies) {
        fetchOptions.headers['Cookie'] = options.cookies
      }

      fetch(url, fetchOptions)
        .then(async (response) => {
          const data = await response.json().catch(() => null)
          const cookies = response.headers.get('set-cookie')
          
          server.close(() => {
            resolve({
              status: response.status,
              data,
              cookies,
              headers: response.headers
            })
          })
        })
        .catch((error) => {
          server.close(() => reject(error))
        })
    })
  })
}