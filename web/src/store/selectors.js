// Selectors for accessing state in a controlled way
// This implements the Flow architecture pattern of having pure selector functions

export const selectItems = (state) => state.items

export const selectLoading = (state) => state.loading

export const selectHasMore = (state) => state.hasMore

export const selectError = (state) => state.error

export const selectSort = (state) => state.sort

export const selectOrder = (state) => state.order

// Derived selectors (computed state)
export const selectItemsCount = (state) => state.items.length

export const selectLastItem = (state) => {
  const items = state.items
  return items.length > 0 ? items[items.length - 1] : null
}

export const selectCanLoadMore = (state) => {
  return !state.loading && state.hasMore
}

export const selectLoadingState = (state) => ({
  loading: state.loading,
  hasMore: state.hasMore,
  error: state.error
})