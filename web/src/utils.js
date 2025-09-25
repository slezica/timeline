
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
