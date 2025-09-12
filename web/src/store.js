import { fetchItems, addMs } from './api'

import * as zs from 'zustand'


const scope = (key, createFn) => (set, get, api) => {
  // Get a scoped field:
  const scopeGet = () => get()[key]

  // Set a scoped field:
  const scopeSet = (partial, replace) => set(parent => {
    const prev = parent[key]
    const next = (typeof partial === 'function') ? partial(prev) : partial
    const comb = replace ? next : { ...prev, ...next }

    return { [key]: comb }
  })

  return { [key]: createFn(scopeSet, scopeGet, api) }
}


const createTimelineSlice = (set, get) => ({
  items  : [],
  total  : null,
  error  : null,
  loading: false,
  stale  : false,
  sort   : 'created',
  order  : 'desc',

  loadMore: async () => {
    const s = get()

    let start
    if (s.items.length > 0) {
      start = addMs(s.items[s.items.length - 1].datetime, 1)
    }

    s._addItems(fetchItems(s.sort, s.order, 20, start))
  },

  _addItems: async (dataPromise) => {
    if (get().loading) { return }

    set({ loading: true })

    try {
      const { items } = await dataPromise
      set({ loading: false, error: null, items: [...get().items, ...items] })

    } catch (error) {
      set({ loading: false, error })
    }
  },

  _replaceItems: async (dataPromise) => {
    if (get().loading) { return }

    set({ loading: true, stale: true, total: null })

    try {
      const { items, total } = await dataPromise
      set({ loading: false, stale: false, error: null, items, total })

    } catch (error) {
      set({ loading: false, error, total: null })
    }
  }
})


export const useStore = zs.create((...a) => ({
  ...scope('timeline', createTimelineSlice)(...a)
}))
