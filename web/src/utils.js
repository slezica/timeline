import { useLayoutEffect } from "react"


export function scheduled(asyncFn) {
  let pending = false
  let running = false

  return async function scheduledFn() {
    if (running) {
      pending = true
      return
    }

    running = true
    pending = false

    try {
      await asyncFn()

    } catch (err) {
      console.error(err)

    } finally {
      running = false
      if (pending) { Promise.resolve().then(scheduledFn) }
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
