import * as zs from 'zustand'
import { immer } from 'zustand/middleware/immer'
import MiniSearch from 'minisearch'
import { db, initializeDb } from './database'
import { debounce, genId } from './utils'
import { validateRecord } from './schema'


/**
  @typedef {import('./schema').Phone} Phone
  @typedef {import('./schema').Ref} Ref
  @typedef {import('./schema').BaseDoc} BaseDoc
  @typedef {import('./schema').BaseRecord} BaseRecord
  @typedef {import('./schema').Task} Task
  @typedef {import('./schema').Note} Note
  @typedef {import('./schema').Contact} Contact
  @typedef {import('./schema').Record} Record
  @typedef {import('./schema').Status} Status
  @typedef {import('./schema').Collection} Collection
  @typedef {import('./schema').Doc} Doc
*/

/** @typedef {{
  ready: boolean,
  error: string | null,
  loading: boolean
}} AsyncState */

/** @template T
  @typedef {AsyncState & {
  result: T | null,
  run: (...args: any[]) => Promise<T>
}} AsyncAction */

/**
  @typedef {{
    ready: boolean,
    initialize: () => Promise<void>,

    records: AsyncState & {
      byId: Record<string, Record>,
      fetch: () => Promise<void>
    },

    timeline: AsyncState & {
      refs: Array<{id: string, kind: string, event: string, date: string}>,
      fetch: () => Promise<void>,
      search: (query?: string, options?: any) => Promise<Array<{id: string, kind: string, event: string, date: string}>>
    },

    shelf: AsyncState & {
      refs: Ref[],
      fetch: () => Promise<void>,
      replace: (refs: Ref[]) => Promise<void>
    },

    desk: AsyncState & {
      refs: Ref[],
      fetch: () => Promise<void>,
      replace: (refs: Ref[]) => Promise<void>
    },

    saveRecord: AsyncAction<Record>,
    deleteRecord: AsyncAction<Record>,
    importFile: AsyncAction<Record[]>
  }} StoreState
*/


const miniSearch = new MiniSearch({
  fields: ['title', 'body', 'createdDate', 'dueDate', 'doneDate'],
  storeFields: ['id'],
  processTerm: (term) => term.toLowerCase()
})
window.miniSearch = miniSearch


/**
  @type {import('zustand').UseBoundStore<import('zustand').StoreApi<StoreState>>}
*/
export const useStore = zs.create(immer((set, get) => {

  // Store factory (member functions defined below):
  const createState = () => ({
    ready: false,
    initialize: initializeStore,

    records: {
      ready: false, error: null, loading: false,
      byId: {},

      fetch: fetchRecords
    },

    timeline: {
      ready: false, error: null, loading: false,
      refs: [],

      fetch: fetchTimeline,
      search: searchTimeline
    },

    shelf: {
      ready: false, error: null, loading: false, 
      refs: [],
      fetch: () => fetchCollection('shelf'),
      replace: (refs) => replaceCollection('shelf', refs)
    },

    desk: {
      ready: false, error: null, loading: false, 
      refs: [],
      fetch: () => fetchCollection('desk'),
      replace: (refs) => replaceCollection('desk', refs)
    },

    saveRecord: { loading: false, error: null, result: null, run: saveRecord },
    deleteRecord: { loading: false, error: null, result: null, run: deleteRecord },
    importFile: { loading: false, error: null, result: null, run: importFile },
  })

  const initializeStore = async () => {
    await initializeDb()

    db.changes({ since: 'now', live: true, include_docs: true, timeout: false })
      .on('change', () => {
        fetchRecords()
        fetchTimeline()
      }) // scheduled

    await fetchRecords()
    await fetchCollection('desk')
    await fetchCollection('shelf')
    await fetchTimeline()

    set(state => {
      state.ready = true
    })
  }

  const fetchRecords = debounce(500, async () => {
    set(state => {
      state.records.loading = true
    })

    try {
      const byDateQ = await db.query('index/byDate', { include_docs: true })

      const byId = {}
      for (let row of byDateQ.rows) {
        if (!validateRecord(row.doc)) {
          console.warn(validateRecord.errors)
        }

        // ID Lookup:
        byId[row.doc._id] = row.doc

        // Full-text search:
        const searchDoc = { id: row.doc._id, ...row.doc }
        miniSearch.has(searchDoc.id) ? miniSearch.replace(searchDoc) : miniSearch.add(searchDoc)
      }

      set(state => {
        state.records.loading = false
        state.records.error = null
        state.records.ready = true
        state.records.byId = byId
      })

    } catch (err) {
      console.error(err)
      set(state => {
        state.records.error = JSON.stringify(err)
      })
    }
  })

  const fetchTimeline = debounce(500, async () => {
    set(state => {
      state.timeline.loading = true
    })

    try {
      const byDateQ = await db.query('index/byDate', { include_docs: true })

      const refs = []
      for (let row of byDateQ.rows) {
        const entry = { id: row.doc._id, kind: row.doc.kind, event: row.value.event, date: row.key }

        // Sorted index:
        refs.unshift(entry)
      }

      set(state => {
        state.timeline.loading = false
        state.timeline.error = null
        state.timeline.ready = true
        state.timeline.refs = refs
      })

    } catch (err) {
      console.error(err)
      set(state => {
        state.timeline.error = JSON.stringify(err)
      })
    }
  })

  const searchTimeline = async (query="", options) => {
    if (query) {
      const results = miniSearch.search(query, options)

      const ids = new Set()
      for (let result of results) {
        ids.add(result.id)
      }

      return get().timeline.refs.filter(it => ids.has(it.id))

    } else {
      return get().timeline.refs
    }
  }

  const fetchCollection = async (id) => {
    set(state => {
      state[id].loading = true
    })

    try {
      const collection = await db.get(id)
      set(state => {
        state[id].loading = false
        state[id].error = null
        state[id].ready = true
        state[id].refs = collection.refs
      })

    } catch (err) {
      console.error(err)
      set(state => {
        state[id].loading = false
        state[id].error = JSON.parse(JSON.stringify(err))
      })
    }
  }

  const replaceCollection = async (id, refs) => {
    set(state => {
      state[id].refs = refs
    })

    const collection = await db.get(id)
    collection.refs = refs
    await db.put(collection)
  }

  const saveRecord = async (record) => {
    set(state => {
      state.saveRecord.loading = false
      state.saveRecord.error = null
      state.saveRecord.result = null
    })

    try {
      record._id ??= genId()

      const putQ = await db.put(record) // TODO actually check `.ok`
      record._rev = putQ.rev

      set(state => {
        state.saveRecord.loading = false
        state.saveRecord.error = null
        state.saveRecord.result = record
      })

    } catch (err) {
      console.error(err)
      set(state => {
        state.saveRecord.loading = false
        state.saveRecord.error = JSON.parse(JSON.stringify(err))
        state.saveRecord.result = null
      })
    }

    return record
  }

  const deleteRecord = async (record) => {
    set(state => {
      state.deleteRecord.loading = true
      state.deleteRecord.error = null
      state.deleteRecord.result = null
    })

    try {
      const updatedRecord = {
        ...record,
        deleted: true
      }

      const putQ = await db.put(updatedRecord)
      updatedRecord._rev = putQ.rev

      set(state => {
        state.deleteRecord.loading = false
        state.deleteRecord.error = null
        state.deleteRecord.result = updatedRecord
      })

      return updatedRecord

    } catch (err) {
      console.error(err)
      set(state => {
        state.deleteRecord.loading = false
        state.deleteRecord.error = JSON.parse(JSON.stringify(err))
        state.deleteRecord.result = null
      })
    }
  }

  const importFile = async (file) => {
    set(state => {
      state.importFile.result = null
      state.importFile.error = null
      state.importFile.loading = true
    })

    const fileContent = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })

    const data = JSON.parse(fileContent)

    try {
      await db.bulkDocs(data.records)
      set(state => {
        state.importFile.loading = false
        state.importFile.error = null
        state.importFile.result = data.records
      })

    } catch (err) {
      console.error(err)
      set(state => {
        state.importFile.loading = false
        state.importFile.error = JSON.parse(JSON.stringify(err))
        state.importFile.result = null
      })
    }
  }

  return createState()
}))
