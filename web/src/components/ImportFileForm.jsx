import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'


export default function ImportFileForm() {
  const importFile = useStore(state => state.importFile)
  const [file, setFile] = useState(null)
  const inputRef = useRef(null)


  const handleSubmit = async (ev) => {
    ev.preventDefault()
    inputRef.current.click()
  }

  const handleChange = async (ev) => {
    console.log(ev)
    if (ev.target.files?.length == 0) { return }

    try {
      await importFile.run(ev.target.files[0])
      setFile(null)

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form className="import-file" onSubmit={handleSubmit}>
      <fieldset>
        <input
          type="file"
          accept="application.json"
          multiple={false}
          onChange={handleChange}
          disabled={importFile.loading}
          aria-busy={importFile.loading}
          ref={inputRef}
          style={{ display: 'none' }}
        />
      </fieldset>

      <button type="submit" disabled={importFile.loading}>
          {importFile.loading ? 'Importing...' : 'Import'}
      </button>


      {importFile.error && (
        <div role="alert">
          Error: {importFile.error}
        </div>
      )}
    </form>
  )
}


