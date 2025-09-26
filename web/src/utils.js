import { useLayoutEffect } from "react"


export function debounce(delay, fn) {
  // 1. Fires immediately.
  // 2. Fires again with the latest parameters after a delay.
  // 3. If the function is async, it awaits before firing again to avoid concurrency.

  let latestArgs, latestThis
  let running = false
  let pending = false
  let timer = null
  let waiters = []

  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(run, delay)
    pending = false
  }

  const run = async () => {
    running = true

    try {
      const value = await Promise.resolve(fn.apply(latestThis, latestArgs))
      for (let waiter of waiters) {
        waiter.resolve(value)
      }

    } catch (err) {
      for (let waiter of waiters) {
        waiter.reject(err)
      }

    } finally {
      running = false
      waiters = []
      if (pending) { schedule() }
    }
  }

  return function debounced(...args) {
    latestArgs = args
    latestThis = this

    const { promise, resolve, reject } = Promise.withResolvers()
    waiters.push({ resolve, reject })

    if (!running && !pending) {
      run()
    } else if (!pending) {
      schedule()
    }

    return promise
  }
}



export const RefType =  'application/vnd.garden.ref+json'

export function setTransferData(ev, data, mimeType) {
  ev.dataTransfer.effectAllowed = 'copy'
  ev.dataTransfer.setData(mimeType, JSON.stringify(data))
}

export function getTransferData(ev, mimeType='unknown') {
  try {
    return JSON.parse(ev.dataTransfer.getData(mimeType))
  } catch {
    return null
  }
}

export function genId() {
  return Math.random().toString(36).substr(2)
}


export function useDiscardEvent(el, onDiscard) {
  useLayoutEffect(() => {
    if (!el) { return }

    // The 'discard' event is custom, indicating this element was dropped outside
    // any drop area. It's fired in main.jsx.
    el.addEventListener('discard', onDiscard)
    return () => { el.removeEventListener('discard', onDiscard) }

  }, [onDiscard])
}


export function indexInParent(el) {
  return [...el.parentElement.children].indexOf(el)
}
