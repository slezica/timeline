import { useLayoutEffect } from "react"


// debounce implementation that:
// 1. Fires immediately.
// 2. Fires again with the latest parameters after a delay.
// 3. If the function is async, it awaits before firing again to avoid concurrency.
export function debounce(delay, fn) {
  let timer = null
  let latestArgs, latestThis
  let running = false
  let pending = false

  const invoke = async () => {
    running = true
    await Promise.resolve(fn.apply(latestThis, latestArgs))
    running = false

    if (pending) {
      pending = false
      timer = setTimeout(invoke, delay)
    } else {
      timer = null
    }
  }

  return async function (...args) {
    latestArgs = args
    latestThis = this

    if (!timer && !running) {
      await invoke()

    } else {
      pending = true
      clearTimeout(timer)
      if (!running) { timer = setTimeout(invoke, delay) }
    }
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
