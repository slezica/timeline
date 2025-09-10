import express from 'express'
import cookieParser from 'cookie-parser'
import db from './database.js'

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})