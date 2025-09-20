#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import nano from 'nano'

const DRY_RUN = true
const COUCH_URL = 'http://admin:admin@localhost:5984'
const DB_NAME = 'timeline'

async function connectToCouch() {
  const couch = nano(COUCH_URL)

  try {
    // Try to get database info
    await couch.db.get(DB_NAME)
    console.log(`Connected to database: ${DB_NAME}`)
    return couch.db.use(DB_NAME)
  } catch (error) {
    if (error.statusCode === 404) {
      console.log(`Database ${DB_NAME} not found, creating...`)
      await couch.db.create(DB_NAME)
      return couch.db.use(DB_NAME)
    }
    throw error
  }
}

async function loadJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content)
}

async function getExistingIds(db, ids) {
  try {
    const response = await db.fetch({ keys: ids })
    const existingIds = new Set()

    response.rows.forEach(row => {
      if (!row.error) {
        existingIds.add(row.id)
      }
    })

    return existingIds
  } catch (error) {
    console.error('Error checking existing IDs:', error)
    return new Set()
  }
}

async function handleItems(db, items) {
  if (!items.length) {
    console.log('No items to save')
    return
  }

  console.log(`Processing ${items.length} items...`)

  // Get all IDs from the items
  const itemIds = items.map(item => item._id)

  // Check which IDs already exist
  const existingIds = await getExistingIds(db, itemIds)

  // Filter out items that already exist
  const newItems = items.filter(item => !existingIds.has(item._id))

  console.log(`Found ${existingIds.size} existing items, ${newItems.length} new items to save`)

  if (newItems.length === 0) {
    console.log('All items already exist in database')
    return
  }

  if (DRY_RUN) {
    await printDocs(db, newItems)
  } else {
    await saveDocs(db, newItems)
  }
}

async function printDocs(db, docs) {
  console.log('DRY RUN')
  console.log(docs)
}

async function saveDocs(db, docs) {
    // Save new items in bulk
  try {
    const response = await db.bulk({ docs: newItems })

    const successful = response.filter(r => r.ok).length
    const failed = response.filter(r => !r.ok)

    console.log(`Successfully saved ${successful} items`)

    if (failed.length > 0) {
      console.log(`Failed to save ${failed.length} items:`)
      failed.forEach(f => console.log(`  ${f.id}: ${f.error} - ${f.reason}`))
    }

  } catch (error) {
    console.error('Error during bulk save:', error)
  }
}


async function main() {
  const filePath = process.argv[2]

  if (!filePath) {
    console.error('Usage: node couch_save.js <json-file>')
    console.error('Example: node couch_save.js google_contacts.json')
    process.exit(1)
  }

  try {
    console.log('CouchDB Import Tool')
    console.log('===================')

    // Load the JSON file
    console.log(`Loading file: ${filePath}`)
    const data = await loadJsonFile(filePath)

    // Validate structure
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid file format: missing data array')
    }

    console.log(`File contains ${data.data.length} items of kind: ${data.kind}`)
    console.log(`Downloaded via: ${data.download?.method} v${data.download?.version}`)
    console.log(`Download date: ${data.download?.date}`)

    // Connect to CouchDB
    const db = await connectToCouch()

    // Save items
    await handleItems(db, data.data)

    console.log('Import completed successfully')

  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}