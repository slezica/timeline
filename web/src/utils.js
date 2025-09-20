import { useEffect } from "react"

export function throttle(fn, ms) {
  let pending = false
  let running = false

  function throttledFn() {
    if (running) {
      pending = true
      return
    }

    running = true
    pending = false

    try {
      fn()
    } catch (err) {
      console.error(err)
    } finally {
      running = false
    }

    if (pending) {
      new Promise(r => setTimeout(r, ms)).then(throttledFn)
    }
  }

  return throttledFn
}


export function accumulate(ms, fn) {
  let pending = []
  let timeout = null

  return function(arg) {
    pending.push(arg)
    if (timeout) {
      return
    }

    timeout = setTimeout(() => {
      const toRun = pending
      pending = []
      fn(toRun)
      timeout = null
    }, ms)
  }
}


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


export function setTransferData(dataTransfer, data) {
  dataTransfer.setData('application/json', JSON.stringify(data))
}

export function getTransferData(dataTransfer) {
  try {
    const json = dataTransfer.getData('application/json')
    return json ? JSON.parse(json) : null
  } catch {
    return null
  }
}
