import * as zs from 'zustand'
import { db, initializeDb } from './database'
import { throttle } from './utils'


export const useStore = zs.create((set, get) => ({
  index: {
    list: [],
    error: null,
    ready: false,
    loading: false,
    pending: false,

    fetch: async () => {
      set(s => ({
        index: { ...s.index, loading: true }
      }))

      try {
        const latestDateQ = await db.query('index/byDate')
        const ids = latestDateQ.rows.map(it => it.value)
        ids.reverse()

        set(s => ({
          index: { ...s.index, list: ids, error: null, ready: true, loading: false }
        }))

      } catch (err) {
        console.error(err)
        set(s => ({
          index: { ...s.index, error: JSON.stringify(err), loading: false }
        }))
      } 
    },

    async startFetcher() {
      while (true) {
        if (get().index.pending) {
          set(s => ({
            index: { ...s.index, pending: false },
          }))

          console.log(get())
          await get().index.fetch()
        }

        await new Promise(r => setTimeout(r, 50))
      }
    }
  },

  items: {
    dict: {},
    error: null,
    ready: false,
    loading: false,

    fetch: throttle(async () => {
      set(s => ({
        items: { ...s.items, loading: true }
      }))

      try {
        const latestDateQ = await db.query('index/byDate', { include_docs: true })

        const dict = {}
        for (let row of latestDateQ.rows) {
          dict[row.doc._id] = row.doc
        }

        set(s => ({
          items: { ...s.items, dict, error: null, ready: true, loading: false }
        }))

      } catch (err) {
        console.error(err)
        set(s => ({
          index: { ...s.index, error: JSON.stringify(err), loading: false }
        }))
      } 
    }, 100)
  },

  createItem: {
    result: null,
    error: null,
    loading: false,

    run: async (item) => {
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

        get().index.fetch()

      } catch (err) {
        console.error(err)
        set(s => ({
          createItem: { ...s.createItem, result: item, error: JSON.stringify(err), loading: false }
        }))
      }
    }
  },

  initialize: async () => {
    await initializeDb()

    get().index.startFetcher()
    const changes = db.changes({ since: 'now', live: true, include_docs: true, timeout: false })

    changes.on('change', ch => {
      const doc = ch.doc
      if (!doc || doc.type != 'item') return
      // TODO batch?

      set(s => {
        const item = doc
        const next = { ...s.items.dict }

        if (item._deleted) {
          delete next[item._id]
        } else {
          next[item._id] = item
        }

        return {
          index: { ...s.index, pending: true },
          items: { ...s.items, dict: next },
        }
      })
    })
  },

}))
