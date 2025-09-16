import * as zs from 'zustand'
import * as api from './api'


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

 
const createAsyncActionSlice = (fn) => (set, get) => ({
  value: null,
  error: null,
  loading: false,

  run: async (...args) => {
    if (get().loading) { return }

    try {
      const value = await fn(...args)
      set({ value, loading: false, error: null })

    } catch (error) {
      set({ value: null, loading: false, error })
      return
    }
  },
})


const createCreateItemSlice = (set, get) => ({
  ...createAsyncActionSlice(item => api.createItem(item))(set, get)
})


const createIndexSlice = (set, get) => ({
  value: null,
  error: null,
  loading: false,

  fetch: async (order) => {
    if (get().loading) { return }

    try {
      const value = await api.fetchIndex(order)
      set({ value, loading: false, error: null })

    } catch (error) {
      set({ loading: false, error })
      returx
    }
  },

  optimisticPrepend(item) {
    const entry = {
      itemId: item.id,
      kind: item.kind,
      date: item.createdDate
    } 

    this.set([ entry, ...this.value ])
  }
})


const createItemsSlice = (set, get) => {
  const cache = {}
  const pending = {}
  let latestFetch = Promise.resolve()

  const fetchPending = async () => {
    const batch = Object.keys(pending)
    if (batch.length == 0) { return }

    try {
      const { items } = await api.fetchItems(batch)

      for (let item of items) {
        cache[item.id] = item
        delete pending[item.id]
      }

      set(cache)

    } catch (err) {
      console.error(err)
      return new Promise(resolve => setTimeout(resolve, 1000)).then(fetchPending)
    }
  }

  const schedulePending = (ids) => {
    for (let id of ids) {
      if (id in cache || id in pending) { continue }
      pending[id] = true
    }

    latestFetch = latestFetch.then(fetchPending)
  }

  const optimisticSet = (item) => {
    cache[item.id] = item
    this.set({ [item.id]: item })
  }

  const slice = {
    optimisticSet
  }

  Object.defineProperty(slice, 'fetch', {
    enumerable: false,
    value: (ids) => { schedulePending(ids) }
  })

  return slice
}


export const useStore = zs.create((...a) => ({
  ...scope('index', createIndexSlice)(...a),
  ...scope('items', createItemsSlice)(...a),
  ...scope('createItem', createCreateItemSlice)(...a),
}))
