import * as zs from 'zustand'
import MiniSearch from 'minisearch'
import { db, initializeDb } from './database'
import { genId, scheduled } from './utils'
import { collectionSchema } from '../schema'


const miniSearch = new MiniSearch({
  fields: ['title', 'body', 'createdDate', 'dueDate', 'doneDate'],
  storeFields: ['id'],
  processTerm: (term) => term.toLowerCase()
})
window.miniSearch = miniSearch


export const useStore = zs.create((set, get) => {
  const scope = (key) => ({
    ctx: () => get(),
    get: () => get()[key],
    set: (partial, replace) => set(state => {
      const prev = state[key]
      const next = (typeof partial === 'function') ? partial(prev) : partial
      const comb = replace ? next : { ...prev, ...next }

      return { [key]: comb }
    })
  })

  // Store factory (member functions defined below):
  const createStore = () => ({
    ready: false,
    initialize: initializeStore,

    index: {
      ready: false, error: null, loading: false,
      byId: {},
      inOrder: [],

      fetch: fetchIndex,
      search: searchIndex
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

    saveItem: { loading: false, error: null, result: null, run: saveItem },
    importFile: { loading: false, error: null, result: null, run: importFile },
  })

  const initializeStore = async () => {
    await initializeDb()

    db.changes({ since: 'now', live: true, include_docs: true, timeout: false })
      .on('change', () => get().index.fetch()) // scheduled

    await get().desk.fetch()
    await get().shelf.fetch()
    await get().index.fetch()

    set({ ready: true })
  }

  const fetchIndex = scheduled(async () => {
    const { set } = scope('index')

    set({ loading: true })

    try {
      const byDateQ = await db.query('index/byDate', { include_docs: true })

      const inOrder = []
      const byId = {}

      for (let row of byDateQ.rows) {
        const entry = { id: row.doc._id, kind: row.doc.kind, event: row.value.event, date: row.key }

        // Sorted index:
        inOrder.push(entry)

        // ID Lookup:
        byId[row.doc._id] = row.doc

        // Full-text search:
        const searchDoc = { id: row.doc._id, ...row.doc }
        miniSearch.has(searchDoc.id) ? miniSearch.replace(searchDoc) : miniSearch.add(searchDoc)
      }

      inOrder.reverse() // TODO query desc or sort in-place

      set({ loading: false, error: null, ready: true, inOrder, byId })

    } catch (err) {
      console.error(err)
      set({ error: JSON.stringify(err) })
    }
  })

  const searchIndex = async (query="", options) => {
    const { get } = scope('index')

    if (query) {
      const results = miniSearch.search(query, options)

      const ids = new Set()
      for (let result of results) {
        ids.add(result.id)
      }

      return get().inOrder.filter(it => ids.has(it.id))

    } else {
      return get().inOrder
    }
  }

  const fetchCollection = async (id) => {
    const { set } = scope(id)

    set({ loading: true })

    try {
      const collection = await db.get(id)
      set({ loading: false, error: null, ready: true, refs: collection.refs })

    } catch (err) {
      console.error(err)
      set({ loading: false, error: JSON.parse(JSON.stringify(err)) })
    }
  }

  const replaceCollection = async (id, refs) => {
    const { set } = scope(id)
    set({ refs })

    const collection = await db.get(id)
    collection.refs = refs
    await db.put(collection)
  }

  const saveItem = async (item) => {
    const { set } = scope('createItem')

    set({ loading: false, error: null, result: null })

    try {
      item._id ??= genId()

      const putQ = await db.put(item) // TODO actually check `.ok`
      item._rev = putQ.rev

      set({ loading: false, error: null, result: item })
      await fetchIndex()

    } catch (err) {
      console.error(err)
      set({ loading: false, error: JSON.parse(JSON.stringify(err)), result: null })
    }

    return item
  }

  const importFile = async (file) => {
    const { set } = scope('importFile')

    set({ result: null, error: null, loading: true })

    const fileContent = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })

    const data = JSON.parse(fileContent)

    try {
      await db.bulkDocs(data.items)
      set({ loading: false, error: null, result: data.items })

    } catch (err) {
      console.error(err)
      set({ loading: false, error: JSON.parse(JSON.stringify(err)), result: null })
    }
  }

  return createStore()
})
