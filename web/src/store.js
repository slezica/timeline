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
  loading: boolean,
  error: string | null,
  ready: boolean
}} AsyncState */

/** 
  @template T
  @typedef {AsyncState & {
    loading: boolean,
    error: string | null,
    ready: boolean
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
  const a = {
    loading: (state) => {
      state.loading = true
      state.error = null
    },

    ready: (state, extra) => {
      state.loading = false
      state.ready = true
      state.error = null
      Object.assign(state, extra)
    },

    error: (state, error) => {
      console.error(error) // TODO
      state.loading = false
      state.error = JSON.parse(JSON.stringify(error))
    },
  }

  const s = {
    asyncState: (extra) => ({
      ...extra,
      loading: false,
      error: null,
      ready: false,
    }),

    asyncAction: (extra) => ({
      ...extra,
      loading: false,
      error: null,
      ready: true,
    })
  }

  // Store factory (member functions defined below):
  const createState = () => ({
    ready: false,
    initialize: initializeStore,

    records: s.asyncState({
      byId  : {},
      fetch : fetchRecords,
      save  : saveRecord,
      delete: deleteRecord
    }),

    timeline: s.asyncState({
      refs  : [],
      fetch : fetchTimeline,
      search: searchTimeline
    }),

    shelf: s.asyncState({
      refs   : [],
      fetch  : () => fetchCollection('shelf'),
      replace: (refs) => replaceCollection('shelf', refs)
    }),

    desk: s.asyncState({
      refs   : [],
      fetch  : () => fetchCollection('desk'),
      replace: (refs) => replaceCollection('desk', refs)
    }),

    importFile: s.asyncAction(importFile),
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
    set(state => { a.loading(state.records) })

    try {
      const byDateQ = await db.allDocs()

      const byId = {}
      for (let row of byDateQ.rows) {
        if (!row.type == 'record') { continue }

        if (!validateRecord(row.doc)) {
          console.warn(validateRecord.errors)
        }

        // ID Lookup:
        byId[row.doc._id] = row.doc

        // Full-text search:
        const searchDoc = { id: row.doc._id, ...row.doc }
        miniSearch.has(searchDoc.id) ? miniSearch.replace(searchDoc) : miniSearch.add(searchDoc)
      }

      set(state => { a.ready(state.records, { byId }) })

    } catch (err) {
      set(state => { a.error(state.records, err) })
    }
  })

  const fetchTimeline = debounce(500, async () => {
    set(state => { a.loading(state.timeline) })

    try {
      const byDateQ = await db.query('index/byDate', { include_docs: true })

      const refs = []
      for (let row of byDateQ.rows) {
        const entry = { id: row.doc._id, kind: row.doc.kind, event: row.value.event, date: row.key }

        // Sorted index:
        refs.unshift(entry)
      }

      set(state => { a.ready(state.timeline, { refs }) })

    } catch (err) {
      set(state => { a.error(state.timeline, err) })
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
    set(state => { a.loading(state[id]) })

    try {
      const collection = await db.get(id)
      set(state => { a.ready(state[id], { refs: collection.refs }) })

    } catch (err) {
      set(state => { a.error(state[id], err) })
    }
  }

  const replaceCollection = async (id, refs) => {
    set(state => a.ready(state[id], { refs }))

    const collection = await db.get(id)
    collection.refs = refs
    await db.put(collection)
  }

  const saveRecord = async (record) => {
    set(state => { a.loading(state.saveRecord) })

    try {
      record._id ??= genId()

      const putQ = await db.put(record) // TODO actually check `.ok`
      record._rev = putQ.rev

      set(state => { a.ready(state.saveRecord, { record }) })

    } catch (err) {
      set(state => { a.error(state.saveRecord, err) })
    }

    return record
  }

  const deleteRecord = async (record) => {
    set(state => { a.loading(state.deleteRecord) })

    try {
      const deletedRecord = { ...record, deleted: true }

      const putQ = await db.put(deletedRecord)
      deletedRecord._rev = putQ.rev

      set(state => { a.ready(state.deleteRecord, { record: deletedRecord }) })

      return deletedRecord

    } catch (err) {
      set(state => { a.error(state.deleteRecord, err) })
    }
  }

  const importFile = async (file) => {
    set(state => {
      a.loading(state.importFile)
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
      set(state => a.ready(state.importFile))

    } catch (err) {
      set(state => { a.error(state.importFile, err) })
    }
  }

  return createState()
}))
