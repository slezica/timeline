import express from 'express'
import cookieParser from 'cookie-parser'

import { db } from './database.js'

const app = express()
const port = 3000
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

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' })
})

app.get('/api/items', (req, res) => {
  let { sort, order, start, limit = '20' } = req.query

  sort = (sort != null)
    ? sort.toString().toLowerCase()
    : 'created'

  order = (['asc', 'desc'].includes(order.toLowerCase()))
    ? order
    : 'desc'

  limit = (limit != null)
    ? Math.min(parseInt(limit) || 100, 100)
    : 25

  const total = db.prepare('SELECT count(1) FROM items').get()

  let query = `
    SELECT 
      items.id, items.kind, items.title,
      COALESCE(
        (SELECT datetime FROM timestamps WHERE item_id = items.id AND kind = ? LIMIT 1),
        (SELECT datetime FROM timestamps WHERE item_id = items.id AND kind = 'created' LIMIT 1)
      ) as timestamp
    FROM items
  `
  
  const params = [sort]

  if (start != null) {
    query += ` WHERE timestamp ${order == 'asc' ? '>=' : '<='} ?`
    params.push(start)
  }

  query += ` ORDER BY timestamp ${order}, items.id ${order} LIMIT ?`
  params.push(limit)
  
  try {
    const items = db.prepare(query).all(...params)
    res.json({ items, total })

  } catch (error) {
    console.error('[api]:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/items', (req, res) => {
  const { title } = req.body

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' })
  }

  const now = new Date().toISOString()

  try {
    const result = db.transaction(() => {
      const insertItem = db.prepare('INSERT INTO items (kind, title) VALUES (?, ?)')
      const itemResult = insertItem.run('item', title.trim())
      
      const insertTimestamp = db.prepare('INSERT INTO timestamps (item_id, kind, datetime) VALUES (?, ?, ?)')
      insertTimestamp.run(itemResult.lastInsertRowid, 'created', now)
      insertTimestamp.run(itemResult.lastInsertRowid, 'updated', now)
      
      return itemResult.lastInsertRowid
    })()

    const newItem = db.prepare(`
      SELECT 
        items.id, items.kind, items.title,
        (SELECT datetime FROM timestamps WHERE item_id = items.id AND kind = 'created' LIMIT 1) as datetime
      FROM items WHERE id = ?
    `).get(result)

    res.status(201).json({ item: newItem })

  } catch (error) {
    console.error('[api]:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})