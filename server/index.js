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

app.get('/api/index', (req, res) => {
  let { order } = req.query

  if (!order || !['asc', 'desc'].includes(order)) {
    order = 'desc'
  }

  const kinds = db.prepare(`
    SELECT DISTINCT kind
    FROM items
  `).all().map(it => it.kind)

  const entries = db.prepare(`
    SELECT itemId, kind, date
    FROM dates
    ORDER BY date ${order}
  `).all()

  res.json({ kinds, entries })
})

app.get('/api/items', (req, res) => {
  const idsParam = req.query.ids

  if (!idsParam) {
    return res.status(400).json({ error: "Param 'ids' is required" })
  }

  // Split idsParam by comma into numbers, validate as we go:
  const ids = []

  for (let idStr of idsParam.split(',')) {
    const id = parseInt(idStr)
    if (id > 0) {
      ids.push(id) // positive and not NaN
    } else {
      return res.status(400).json({ error: `Invalid id '${idStr}'` }) 
    }
  }

  const query = `
    SELECT 
      items.id, items.kind, items.title, items.createdDate, items.updatedDate,
      CASE items.kind
        WHEN 'task' THEN json_object(
          'dueDate', taskItems.dueDate,
          'doneDate', taskItems.doneDate
        )
        ELSE json_object()
      END AS extras
    FROM items
      JOIN taskItems on taskItems.itemId=items.id AND items.kind='task'
    WHERE
      items.id IN (${ids.map(it => '?').join(',')})
  `
  
  try {
    const items = db.prepare(query)
      .all(...ids)
      .map(it => {
        Object.assign(it, JSON.parse(it.extras))
        delete it.extras
        return it
      })

    res.json({ items })

  } catch (error) {
    console.error('[api]:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/items', (req, res) => {
  const { title, kind = 'note' } = req.body

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' })
  }

  if (!['note', 'task'].includes(kind)) {
    return res.status(400).json({ error: 'Kind must be note or task' })
  }

  const now = new Date().toISOString()

  try {
    const result = db.transaction(() => {
      const insertItem = db.prepare('INSERT INTO items (kind, title) VALUES (?, ?)')
      const itemResult = insertItem.run(kind, title.trim())
      
      const insertTimestamp = db.prepare('INSERT INTO timestamps (item_id, kind, datetime) VALUES (?, ?, ?)')
      insertTimestamp.run(itemResult.lastInsertRowid, 'created', now)
      insertTimestamp.run(itemResult.lastInsertRowid, 'updated', now)
      
      // If it's a task, create the task-specific data
      if (kind === 'task') {
        const insertTask = db.prepare('INSERT INTO items_task (itemId) VALUES (?)')
        insertTask.run(itemResult.lastInsertRowid)
      }
      
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