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

 
const createAsyncValueSlice = (initialValue) => (set, get) => ({
  value: initialValue,
  error: null,
  loading: false,

  setLoading: () => set({ loading: true }),
  setSuccess: (value) => set({ loading: false, error: null, value }),
  setFailure: (error) => set({ loading: false, error }),
})


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
  ...createAsyncValueSlice(set, get),

  fetch: async (order) => {
    if (get().loading) { return }

    try {
      const value = await api.fetchIndex(order)
      set({ value, loading: false, error: null })

    } catch (error) {
      set({ loading: false, error })
      return
    }
  }
})

const createItemsSlice = (set, get) => ({
  byId: {},

  fetch: async (ids) => {
    const byId = get().byId

    for (let id of ids) {
      if (id in byId) {
        byId[id].setLoading()
      } else {
        byId[id] = createAsyncValueSlice(null)(set, get)
      }
    }

    try {
      const value = await api.fetchIndex(order)
      set({ value, loading: false, error: null })

    } catch (error) {
      set({ loading: false, error })
      return
    }
  }
})


const createTimelineSlice = (set, get) => ({
  items  : [],
  error  : null,
  loading: false,

  fetch: async (ids) => {

  },

  addItems: async (data, mode) => {
    if (get().loading) { return }

    if (typeof data.then == 'function') {
      set({ loading: true })

      try {
        data = await data
        set({ loading: false, error: null })

      } catch (error) {
        set({ loading: false, error })
        return
      }
    }

    const items = 
      mode == 'prepend' ? [...data.items, ...get().items] :
      mode == 'replace' ? data.items :
      [...get().items, ...data.items]     

    set({ items })
  },

  removeItem: (itemId) => {
    const items = get().items
    set({ items: items.filter(item => item.id !== itemId) })
  },
})


export const useStore = zs.create((...a) => ({
  ...scope('index', createIndexSlice)(...a),
  ...scope('timeline', createTimelineSlice)(...a),
  ...scope('createItem', createCreateItemSlice)(...a),
}))
