import PouchDB from 'pouchdb'

export const db = new PouchDB('test')
export const remoteDb = new PouchDB('http://admin:admin2@localhost:5984/timeline')
window.db = db


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

  ["Add shelf", async () => {
    const shelf = {
      _id: 'shelf',
      type: 'shelf',
      refs: []
    }

    await db.put(shelf)
  }]
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
  db.sync(remoteDb, { live: true, retry: true })

  console.log('[db]', "Initialized")
}


