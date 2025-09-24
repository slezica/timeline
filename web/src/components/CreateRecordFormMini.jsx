import { useLayoutEffect, useRef } from 'react'


export default function CreateRecordFormMini({ onRecordCreate }) {
  const shortcutRef = useRef()

  useLayoutEffect(() => {
    const handleKey = (ev) => {
      if (ev.key === '+') {
        ev.preventDefault()
        shortcutRef.current?.click()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const now = new Date().toISOString()

    try {
      const record = {
        title: "",
        kind: 'note',
        body: "",
        refs: [],
        createdDate: now,
        updatedDate: now
      }

      onRecordCreate?.(record)

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form className="create" onSubmit={handleSubmit} >
      <button type="submit" ref={shortcutRef}><i className="plus" /></button>
    </form >
  )
}
