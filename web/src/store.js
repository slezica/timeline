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

 
const createActionSlice = (set) => ({
  value: null,
  error: null,
  loading: false,

  setLoading: () => set({ loading: true }),
  setSuccess: (value) => set({ value, loading: false }),
  setFailure: (error) => set({ error, loading: false })
})


const createCreateItemSlice = (set, get) => ({
  ...createActionSlice(set),

  run: async ({ title, kind }) => {
    if (get().loading) { return }
    get().setLoading()

    try {
      const { item } = await api.createItem({ title, kind })
      get().setSuccess(item)

    } catch (error) {
      get().setFailure(error)
    }
  }
})


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
      start = api.addMs(s.items[s.items.length - 1].datetime, 1) // TODO this sucks
    }

    s.addItems(api.fetchItems(s.sort, s.order, 20, start))
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
  ...scope('timeline', createTimelineSlice)(...a),
  ...scope('createItem', createCreateItemSlice)(...a)
}))
