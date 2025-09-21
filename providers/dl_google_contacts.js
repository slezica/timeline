#!/usr/bin/env node

import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'


const METHOD = 'dl_google_contacts.js'
const VERSION = 1
const OUTPUT_PATH = 'google_contacts.json'
const TOKEN_PATH = 'token.json'
const CREDENTIALS_PATH = 'credentials.json'

const SCOPES = ['https://www.googleapis.com/auth/contacts.readonly']


async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH))
  const { client_secret, client_id, redirect_uris } = credentials.web
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  // Check if we have a saved token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH)
    oAuth2Client.setCredentials(JSON.parse(token))
    return oAuth2Client
  }

  // Generate new token
  return await getNewToken(oAuth2Client)
}


async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })

  console.log('Authorize this app by visiting this url:', authUrl)
  console.log('Enter the code from that page here:')

  const code = await new Promise((resolve) => {
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (data) => {
      resolve(data.trim())
    })
  })

  try {
    const { tokens } = await oAuth2Client.getToken(code)
    oAuth2Client.setCredentials(tokens)

    // Store the token for future use
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
    console.log('Token stored to', TOKEN_PATH)

    return oAuth2Client
  } catch (error) {
    console.error('Error retrieving access token:', error)
    process.exit(1)
  }
}

async function downloadContacts(auth) {
  const service = google.people({ version: 'v1', auth })

  try {
    const response = await service.people.connections.list({
      resourceName: 'people/me',
      pageSize: 1000,
      personFields: 'names,emailAddresses,phoneNumbers,organizations,addresses,birthdays,metadata,photos'
    })

    const connections = response.data.connections || []
    console.log(`Found ${connections.length} contacts`)

    // Convert to line-separated JSON format
    const outputPath = 'google_contacts.json'

    const contacts = []
    for (let connection of connections) {
      const contact = transformContact(connection) // null if invalid or uninteresting
      if (contact) {
        contacts.push(contact)
      }
    }

    const output = {
      download: {
        method: METHOD,
        version: VERSION,
        date: new Date().toISOString(),
      },
      items: contacts 
    }

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
    console.log(`Contacts written to ${outputPath}`)

  } catch (error) {
    console.error('Error downloading contacts:', error)
  }
}

function transformContact(person) {
  const contact = {
    _id: person.resourceName?.replace('people/', 'g') || crypto.randomUUID(),
    type: 'item',
    kind: 'contact',
    body: '',
    refs: []
  }

  // Extract Google metadata timestamps
  if (person.metadata?.sources?.length) {
    const dates = person.metadata.sources
      .map(it => it.updateTime)
      .filter(it => !!it)
      .sort()
    
    // Google provides these as RFC3339 timestamps
    contact.createdDate = dates[0]
    contact.updatedDate = dates[dates.length - 1]

  } else {
    contact.createdDate = new Date().toISOString()
    contact.updatedDate = contact.createdDate
  }

  // Extract name:
  contact.title = person.names?.[0]?.displayName ?? null
  if (!contact.title) {
    return null
  }

  // Extract email (one):
  contact.email = person.emailAddresses?.[0]?.value ?? null

  // Extract phone numbers
  contact.phones = []
  for (let phone of person.phoneNumbers ?? []) {
    contact.phones.push({ type: phone.type || 'main', number: phone.canonicalForm || phone.value })
  }

  // Extract addresses:
  // contact.places = []
  // for (let address of person.addresses ?? []) {
  //   contact.places.push({ type: address.type || 'home', address: address.formattedValue })
  // }

  // Skip this contact if we have no meaningful data:
  if (!contact.email && !contact.phones.length /* && !contact.places.length */) {
    return null
  }

  // Extract organization:
  if (person.organizations?.[0]) {
    contact.organization = person.organizations[0].name
  }

  // Extract birthday:
  const bd = person.birthdays?.[0]?.date
  if (bd && bd.year && bd.month && bd.day) {
    contact.birthday = new Date(bd.year, bd.month - 1, bd.day).toISOString()
  } else {
    contact.birthday = null
  }

  // Extract primary photo:
  if (person.photos?.length) {
    const index = person.photos.findIndex(photo => photo.metadata?.primary === true)
    contact.picture = person.photos[index == -1 ? 0 : index].url
  }

  return contact
}

async function main() {
  // Check if credentials exist
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`Credentials file not found: ${CREDENTIALS_PATH}`)
    console.log('Please download your OAuth2 credentials from Google Cloud Console')
    process.exit(1)
  }

  try {
    // Start authorization flow
    const auth = await authorize()

    // Download contacts
    await downloadContacts(auth)

  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}