const express = require('express')

const app = express()
const port = 3000
const AUTH_PASSWORD = 'temp123'

app.use(express.json())

const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization

  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic')
    return res.status(401).json({ error: 'Authentication required' })
  }

  const credentials = Buffer.from(auth.slice(6), 'base64').toString('ascii')
  const [username, password] = credentials.split(':')

  if (password !== AUTH_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  next()
}

app.use(basicAuth)

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})