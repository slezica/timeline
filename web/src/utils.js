import { useLayoutEffect } from "react"
import { debounce as perfectDebounce } from "perfect-debounce"


export function debounce(delay, fn) {
  return perfectDebounce(fn, delay, { leading: true, trailing: true })
}




export const RefType =  'application/vnd.garden.ref+json'

let globalDataTransfer = {
  'text/plain': ''
}

export function clearTransferData(ev) {
  globalDataTransfer = {}
}

export function setTransferData(ev, data, mimeType) {
  ev.dataTransfer.effectAllowed = 'copy'
  globalDataTransfer[mimeType] = JSON.stringify(data)
}

export function getTransferData(ev, mimeType='unknown') {
  try {
    return JSON.parse(globalDataTransfer[mimeType])
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


export function isInside(ev, rect) {
  return ev.clientX >= rect.left &&
         ev.clientX <= rect.right &&
         ev.clientY >= rect.top &&
         ev.clientY <= rect.bottom
}
