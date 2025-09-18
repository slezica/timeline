import * as zs from 'zustand'
import MiniSearch from 'minisearch'
import { db, initializeDb } from './database'
import { scheduled } from './utils'


const miniSearch = new MiniSearch({
  fields: ['title', 'body', 'createdDate', 'dueDate', 'doneDate'],
  storeFields: ['id'],
  processTerm: (term) => term.toLowerCase()
})
window.miniSearch = miniSearch
window.miniSearch.temp = 'jaja'


export const useStore = zs.create((set, get) => {
  // Store factory (member functions defined below):
  const createStore = () => ({
    initialize: initializeStore,

    index: {
      inOrder: [],
      byId: {},
      ready: false,
      error: null,
      loading: false,

      fetch: fetchIndex,
      search: searchIndex
    },

    createItem: {
      result: null,
      error: null,
      loading: false,
      run: createItem
    },
  })

  const initializeStore = async () => {
    await initializeDb()

    db.changes({ since: 'now', live: true, include_docs: true, timeout: false })
      .on('change', fetchIndex) // scheduled

    fetchIndex()
  }

  const fetchIndex = scheduled(async () => {
    set(s => ({
      index: { ...s.index, loading: true }
    }))

    try {
      const byDateQ = await db.query('index/byDate', { include_docs: true })

      const inOrder = []
      const byId = {}

      for (let row of byDateQ.rows) {
        const doc = { id: row.doc._id, ...row.doc }
        const entry = { id: row.doc._id, kind: row.doc.kind, date: row.key }

        // Sorted index:
        inOrder.push(entry)

        // ID Lookup:
        byId[doc.id] = doc

        // Full-text search:
        miniSearch.has(doc.id) ? miniSearch.replace(doc) : miniSearch.add(doc)
      }

      inOrder.reverse() // TODO query desc or sort in-place

      set(s => ({
        index: { ...s.index, inOrder, byId, error: null, ready: true, loading: false }
      }))

    } catch (err) {
      console.error(err)
      set(s => ({
        index: { ...s.index, error: JSON.stringify(err), loading: false }
      }))
    } 
  })

  const searchIndex = async (query="", options) => {
    if (query) {
      const results = miniSearch.search(query, options)

      const ids = new Set()
      for (let result of results) {
        ids.add(result.id)
      }

      return get().index.inOrder.filter(it => ids.has(it.id))

    } else {
      return get().index.inOrder
    }
  }

  const createItem = async (item) => {
    set(s => ({
      createItem: { ...s.createItem, result: null, error: null, loading: true }
    }))

    try {
      item._id = crypto.randomUUID()
      item.type = 'item'

      const putQ = await db.put(item) // TODO actually check `.ok`
      item._rev = putQ.rev

      set(s => ({
        createItem: { ...s.createItem, result: item, error: null, loading: false }
      }))

      await fetchIndex()

    } catch (err) {
      console.error(err)
      set(s => ({
        createItem: { ...s.createItem, result: item, error: JSON.stringify(err), loading: false }
      }))
    }
  }

  return createStore()
})
