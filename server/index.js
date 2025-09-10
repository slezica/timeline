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
  const { sort = 'createdAt', order = 'desc', start, limit = '20' } = req.query
  const limitNum = Math.min(parseInt(limit) || 20, 100)

  const validSortFields = ['createdAt', 'updatedAt', 'title']
  const validOrders = ['asc', 'desc']

  const sortField = validSortFields.includes(sort) ? sort : 'createdAt'
  const sortOrder = validOrders.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc'

  let query = `SELECT id, kind, title, createdAt, updatedAt FROM items`
  const params = []

  if (start) {
    if (sortOrder === 'asc') {
      query += ` WHERE ${sortField} >= ?`
    } else {
      query += ` WHERE ${sortField} <= ?`
    }
    params.push(start)
  }

  query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}, id ${sortOrder.toUpperCase()} LIMIT ?`
  params.push(limitNum)

  try {
    const stmt = db.prepare(query)
    const items = stmt.all(...params)

    const hasMore = items.length === limitNum
    const nextStart = items.length > 0 ? items[items.length - 1][sortField] : null

    res.json({
      items,
      hasMore,
      nextStart
    })
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})