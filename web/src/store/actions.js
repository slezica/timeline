import { fetchItems, addMs } from '../api'
import { selectLastItem, selectSort, selectOrder } from './selectors'

export const LOAD_ITEMS_START = 'LOAD_ITEMS_START'
export const LOAD_ITEMS_SUCCESS = 'LOAD_ITEMS_SUCCESS'
export const LOAD_ITEMS_ERROR = 'LOAD_ITEMS_ERROR'

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