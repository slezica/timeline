import { LOAD_ITEMS_START, LOAD_ITEMS_SUCCESS, LOAD_ITEMS_ERROR } from './actions'

const initialState = {
  items: [],
  loading: false,
  hasMore: true,
  error: null,
  sort: 'created',
  order: 'desc'
}

export default function reducer(state = initialState, action) {
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