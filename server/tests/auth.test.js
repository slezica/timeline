import { test } from 'node:test'
import assert from 'node:assert'
import { createTestServer, makeRequest } from './test-utils.js'

test('POST /login - valid password', async () => {
  const { app } = createTestServer()
  
  const response = await makeRequest(app, 'POST', '/login', {
    body: { password: 'temp123' },
    form: true
  })

  assert.strictEqual(response.status, 200)
  assert.strictEqual(response.data.message, 'Login successful')
  assert.ok(response.data.sessionId)
  assert.ok(response.cookies.includes('sessionId='))
})

test('POST /login - invalid password', async () => {
  const { app } = createTestServer()
  
  const response = await makeRequest(app, 'POST', '/login', {
    body: { password: 'wrong' },
    form: true
  })

  assert.strictEqual(response.status, 401)
  assert.strictEqual(response.data.error, 'Invalid password')
})

test('POST /logout - clears session', async () => {
  const { app } = createTestServer()
  
  // First login
  const loginResponse = await makeRequest(app, 'POST', '/login', {
    body: { password: 'temp123' },
    form: true
  })
  
  const sessionCookie = loginResponse.cookies.split(';')[0]
  
  // Then logout
  const logoutResponse = await makeRequest(app, 'POST', '/logout', {
    cookies: sessionCookie
  })

  assert.strictEqual(logoutResponse.status, 200)
  assert.strictEqual(logoutResponse.data.message, 'Logout successful')
  assert.ok(logoutResponse.cookies.includes('sessionId=;'))
})