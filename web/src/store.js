import * as zs from 'zustand'
import MiniSearch from 'minisearch'
import { db, initializeDb } from './database'
import { scheduled } from './utils'
import { validateItem } from '../schema'


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

    shelf: {
      inOrder: [],
      ready: false,
      error: null,
      loading: false,

      fetch: fetchShelf,
      replace: replaceShelf
    },

    createItem: {
      result: null,
      error: null,
      loading: false,
      run: createItem
    },

    updateItem: {
      result: null,
      error: null,
      loading: false,
      run: updateItem
    },
  })

  const initializeStore = async () => {
    await initializeDb()

    db.changes({ since: 'now', live: true, include_docs: true, timeout: false })
      .on('change', () => get().index.fetch()) // scheduled

    get().index.fetch()
    get().shelf.fetch()
  }

  const fetchIndex = scheduled(async () => {
    const { set } = scope('index')

    set({ loading: true })

    try {
      const byDateQ = await db.query('index/byDate', { include_docs: true })

      const inOrder = []
      const byId = {}

      for (let row of byDateQ.rows) {
        const doc = { id: row.doc._id, ...row.doc }
        const entry = { id: row.doc._id, kind: row.doc.kind, event: row.value.event, date: row.key }

        // Sorted index:
        inOrder.push(entry)

        // ID Lookup:
        byId[doc.id] = doc

        // Full-text search:
        miniSearch.has(doc.id) ? miniSearch.replace(doc) : miniSearch.add(doc)
      }

      inOrder.reverse() // TODO query desc or sort in-place

      set({ inOrder, byId, error: null, ready: true, loading: false })

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

  const fetchShelf = async () => {
    const { set } = scope('shelf')

    set({ loading: true })

    try {
      const shelf = await db.get('shelf')
      set({ loading: false, error: null, ready: true, inOrder: shelf.refs })

    } catch (err) {
      console.error(err)
      set({ loading: false, error: JSON.parse(JSON.stringify(error)) })
    }
  }

  const replaceShelf = async (inOrder) => {
    const { set } = scope('shelf')

    set({ inOrder })

    const shelf = await db.get('shelf')
    shelf.refs = inOrder
    await db.put(shelf)
  }

  const createItem = async (item) => {
    const { set } = scope('createItem')

    set({ loading: false, error: null, result: null })

    try {
      item._id = crypto.randomUUID()
      item.type = 'item'

      if (!validateItem(item)) {
        throw new Error(`Validation failed: ${JSON.stringify(validateItem.errors)}`)
      }

      const putQ = await db.put(item) // TODO actually check `.ok`
      item._rev = putQ.rev

      set({ loading: false, error: null, result: item })
      await fetchIndex()

    } catch (err) {
      console.error(err)
      set({ loading: false, error: JSON.parse(JSON.stringify(err)), result: null })
    }
  }

  const updateItem = async (item) => {
    const { set } = scope('updateItem')

    set({ result: null, error: null, loading: true })

    try {
      if (!validateItem(item)) {
        throw new Error(`Validation failed: ${JSON.stringify(validateItem.errors)}`)
      }

      const putQ = await db.put(item)
      item._rev = putQ.rev
      set({ loading: false, error: null, result: item })

    } catch (err) {
      console.error(err)
      set({ loading: false, error: JSON.parse(JSON.stringify(err)), result: null })
    }
  }

  return createStore()
})
