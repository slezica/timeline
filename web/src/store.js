import { configureStore } from '@reduxjs/toolkit'
import { fetchItems, addMs } from './api'

// Action types
export const LOAD_ITEMS_START = 'LOAD_ITEMS_START'
export const LOAD_ITEMS_SUCCESS = 'LOAD_ITEMS_SUCCESS'
export const LOAD_ITEMS_ERROR = 'LOAD_ITEMS_ERROR'

// Selectors
export const selectItems = (state) => state.items
export const selectLoading = (state) => state.loading
export const selectHasMore = (state) => state.hasMore
export const selectError = (state) => state.error
export const selectSort = (state) => state.sort
export const selectOrder = (state) => state.order

// Derived selectors
export const selectItemsCount = (state) => state.items.length
export const selectLastItem = (state) => {
  const items = state.items
  return items.length > 0 ? items[items.length - 1] : null
}
export const selectCanLoadMore = (state) => !state.loading && state.hasMore
export const selectLoadingState = (state) => ({
  loading: state.loading,
  hasMore: state.hasMore,
  error: state.error
})

// Action creators
export function loadItemsStart() {
  return { type: LOAD_ITEMS_START }
}

export function loadItemsSuccess(items) {
  return {
    type: LOAD_ITEMS_SUCCESS,
    payload: items
  }
}

export function loadItemsError(error) {
  return {
    type: LOAD_ITEMS_ERROR,
    payload: error
  }
}

export function loadMoreItems() {
  return async (dispatch, getState) => {
    const state = getState()
    
    if (state.loading || !state.hasMore) {
      return
    }
    
    dispatch(loadItemsStart())
    
    try {
      let startAfter
      const lastItem = selectLastItem(state)
      if (lastItem) {
        startAfter = addMs(lastItem.datetime, 1)
      }
      
      const data = await fetchItems(
        selectSort(state),
        selectOrder(state),
        20,
        startAfter
      )
      
      dispatch(loadItemsSuccess(data.items))
    } catch (error) {
      dispatch(loadItemsError(error.message))
    }
  }
}

// Initial state
const initialState = {
  items: [],
  loading: false,
  hasMore: true,
  error: null,
  sort: 'created',
  order: 'desc'
}

// Reducer
function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_ITEMS_START:
      return {
        ...state,
        loading: true,
        error: null
      }
      
    case LOAD_ITEMS_SUCCESS:
      const newItems = action.payload
      return {
        ...state,
        loading: false,
        items: [...state.items, ...newItems],
        hasMore: newItems.length >= 20,
        error: null
      }
      
    case LOAD_ITEMS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
      
    default:
      return state
  }
}

// Store configuration
const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false
    })
})

export default store