import * as zs from 'zustand'
import { db, initializeDb } from './database'


export const useStore = zs.create((set, get) => ({
  index: {
    list: [],
    error: null,
    ready: false,
    loading: false,

    fetch: async () => {
      set(s => ({
        index: { ...s.index, loading: true }
      }))

      try {
        const latestDateQ = await db.query('index/byLatestDate')
        const ids = latestDateQ.rows.map(it => it.value)

        set({
          index: { list: ids, error: null, ready: true, loading: false }
        })

      } catch (err) {
        console.error(err)
        set(s => ({
          index: { ...s.index, error: JSON.stringify(err), loading: false }
        }))
      } 
    }
  },

  items: {
    dict: {},
    error: null,
    ready: false,
    loading: false,

    fetch: async () => {
      set(s => ({
        items: { ...s.items, loading: true }
      }))

      try {
        const latestDateQ = await db.query('index/byLatestDate', { include_docs: true })

        const dict = {}
        for (let row of latestDateQ.rows) {
          dict[row.doc._id] = row.doc
        }

        set({
          items: { dict, error: null, ready: true, loading: false }
        })

      } catch (err) {
        console.error(err)
        set(s => ({
          index: { ...s.index, error: JSON.stringify(err), loading: false }
        }))
      } 
    }
  },

  createItem: {
    error: null,
    loading: false,
    result: null,

    run: async (item) => {
      set({
        createItem: { result: null, error: null, loading: true }
      })

      try {
        item._id = crypto.randomUUID()
        const putQ = await db.put(item) // TODO actually check `.ok`
        item._rev = putQ.rev

        set({
          createItem: { result: item, error: null, loading: false }
        })

      } catch (err) {
        console.error(err)
        set({
          createItem: { result: item, error: JSON.stringify(err), loading: false }
        })
      }
    }
  },

  initialize: async () => {
    await initializeDb()
    // TODO: changes stream
  },

}))
