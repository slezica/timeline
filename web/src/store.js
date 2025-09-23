import * as zs from 'zustand'
import MiniSearch from 'minisearch'
import { db, initializeDb } from './database'
import { genId, scheduled } from './utils'


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

    items: {
      ready: false, error: null, loading: false,
      byId: {},

      fetch: fetchItems
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

    saveItem: { loading: false, error: null, result: null, run: saveItem },
    deleteItem: { loading: false, error: null, result: null, run: deleteItem },
    importFile: { loading: false, error: null, result: null, run: importFile },
  })

  const initializeStore = async () => {
    await initializeDb()

    db.changes({ since: 'now', live: true, include_docs: true, timeout: false })
      .on('change', () => {
        fetchItems()
        fetchTimeline()
      }) // scheduled

    await fetchItems()
    await fetchCollection('desk')
    await fetchCollection('shelf')
    await fetchTimeline()

    set({ ready: true })
  }

  const fetchItems = scheduled(async () => {
    const { set } = scope('items')

    set({ loading: true })

    try {
      const byDateQ = await db.query('index/byDate', { include_docs: true })

      const byId = {}
      for (let row of byDateQ.rows) {
        // ID Lookup:
        byId[row.doc._id] = row.doc

        // Full-text search:
        const searchDoc = { id: row.doc._id, ...row.doc }
        miniSearch.has(searchDoc.id) ? miniSearch.replace(searchDoc) : miniSearch.add(searchDoc)
      }

      set({ loading: false, error: null, ready: true, byId })

    } catch (err) {
      console.error(err)
      set({ error: JSON.stringify(err) })
    }
  })

  const fetchTimeline = scheduled(async () => {
    const { set } = scope('timeline')

    set({ loading: true })

    try {
      const byDateQ = await db.query('index/byDate', { include_docs: true })

      const refs = []
      for (let row of byDateQ.rows) {
        const entry = { id: row.doc._id, kind: row.doc.kind, event: row.value.event, date: row.key }

        // Sorted index:
        refs.unshift(entry)
      }

      set({ loading: false, error: null, ready: true, refs })

    } catch (err) {
      console.error(err)
      set({ error: JSON.stringify(err) })
    }
  })

  const searchTimeline = async (query="", options) => {
    const { get } = scope('timeline')

    if (query) {
      const results = miniSearch.search(query, options)

      const ids = new Set()
      for (let result of results) {
        ids.add(result.id)
      }

      return get().refs.filter(it => ids.has(it.id))

    } else {
      return get().refs
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
      fetchItems()
      fetchTimeline()

    } catch (err) {
      console.error(err)
      set({ loading: false, error: JSON.parse(JSON.stringify(err)), result: null })
    }

    return item
  }

  const deleteItem = async (item) => {
    const { set } = scope('deleteItem')

    set({ loading: true, error: null, result: null })

    try {
      const updatedItem = {
        ...item,
        deleted: true
      }

      const putQ = await db.put(updatedItem)
      updatedItem._rev = putQ.rev

      set({ loading: false, error: null, result: updatedItem })
      fetchItems()
      fetchTimeline()

    } catch (err) {
      console.error(err)
      set({ loading: false, error: JSON.parse(JSON.stringify(err)), result: null })
    }

    return updatedItem
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
