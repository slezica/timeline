import PouchDB from 'pouchdb'
import { validateDoc, validateItem } from '../schema'
import { genId } from './utils'

const pouchDb = new PouchDB('test')
const couchDb = new PouchDB('http://admin:admin2@localhost:5984/timeline')

let emit // shut up, linter

const migrations = [
  ["Create indices design doc", async () => {

    function mapKind(doc) {
      if (doc.type != 'item') { return }
      emit(doc.kind, doc._id)
    }

    function mapDate(doc) {
      if (doc.type != 'item') { return }

      for (let key in doc) {
        if (key.endsWith('Date') && doc[key] != null) {
          // Only emit task-specific date events for tasks
          if ((key === 'dueDate' || key === 'doneDate') && doc.kind !== 'task') {
            continue
          }
          emit(doc[key], { id: doc._id, kind: doc.kind, event: key.slice(0, -4), date: doc[key] })
        }
      }
    }

    const index = {
      _id: '_design/index',
      views: {
        byKind: {
          map: mapKind.toString()
        },

        byDate: {
          map: mapDate.toString()
        }
      }
    }

    await db.put(index)
  }],

  ["Add body to items", async () => {
    const allDocsQ = await db.allDocs({ include_docs: true })

    const docs = []
    for (let row of allDocsQ.rows) {
      if (row?.doc?.type != 'item') { continue }
      row.doc.body ??= ''
      docs.push(row.doc)
    }

    await db.bulkDocs(docs)
  }],

  ["Add references to items", async () => {
    const index = await db.get('_design/index')
    const allDocsQ = await db.allDocs({ include_docs: true })

    const docs = []
    for (let row of allDocsQ.rows) {
      if (row?.doc?.type != 'item') { continue }
      row.doc.refs ??= []
      docs.push(row.doc)
    }

    await db.bulkDocs(docs)

    function mapRefs(doc) {
      if (doc.type != 'item') { return }

      for (let ref of doc.refs) {
        emit(ref.id, doc)
      }
    }

    index.views.byRef = { map: mapRefs }
  }],

  ["Add basic collections", async () => {
    const collections = [
      { _id: 'desk', type: 'collection', refs: [] },
      { _id: 'shelf', type: 'collection', refs: [] },
    ]

    await db.bulkDocs(collections)
  }],
  //
  // ["Add desk", async () => {
  //   const shelf = {
  //     _id: 'desk',
  //     type: 'desk',
  //     refs: []
  //   }
  //
  //   await db.put(shelf)
  // }]
]


export async function initializeDb() {
  console.log('[db]', "Initializing")

  let status
  try {
    status = await db.get('status')

  } catch (err) {
    if (err.status != 404) throw err

    status = {
      _id: 'status',
      type: 'status',
      migration: -1
    }

    const statusCreated = await db.put(status)
    status._rev = statusCreated.rev
  }

  for (let i = status.migration + 1; i < migrations.length; i++) {
    const [ name, f ] = migrations[i]

    console.log('[db]', "Applying migration:", name)
    await f()

    status.migration += 1

    const statusUpdated = await db.put(status)
    status._rev = statusUpdated.rev
  }

  console.log('[db]', "Starting sync")
  pouchDb.sync(couchDb, { live: true, retry: true })

  console.log('[db]', "Initialized")
}



function validOrNull(doc) {
  if (validateDoc(doc)) {
    return doc
  } else {
    console.error(validateDoc.errors)
    return null
  }
}


function validOrThrow(doc) {
  if (validateDoc(doc)) {
    return doc
  } else {
    const docStr = JSON.stringify(doc, null, 2)
    const errStr = JSON.stringify(validateDoc.errors)

    console.error(validateDoc.errors)
    throw new Error(`Validation error,\n${docStr},\n${errStr}`)
  }
}


export const db = {
  get: async (...args) => {
    return validOrNull(await pouchDb.get(...args))
  },

  query: async (...args) => {
    const result = await pouchDb.query(...args)
    result.rows = result.rows.filter(validOrNull)

    return result
  },

  allDocs: async (...args) => {
    const result = await pouchDb.allDocs(...args)
    result.rows = result.rows.filter(validOrNull)

    return result
  },

  put: async (doc, ...args) => {
    validOrThrow(doc)
    return await pouchDb.put(doc, ...args)
  },

  bulkDocs: async (docs, ...args) => {
    return await pouchDb.bulkDocs(docs.filter(validOrNull), ...args)
  },

  changes: (...args) => {
    return pouchDb.changes(...args)
  },

  destroy: async (...args) => {
    return await pouchDb.destroy(...args)
  },
}

window.db = db

