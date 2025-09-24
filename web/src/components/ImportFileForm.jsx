import { useRef } from 'react'
import { useStore } from '../store'


export default function ImportFileForm() {
  const importFile = useStore(state => state.importFile)
  const inputRef = useRef(null)

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    inputRef.current.click()
  }

  const handleChange = async (ev) => {
    if (ev.target.files?.length == 0) { return }

    try {
      await importFile.run(ev.target.files[0])

    } catch (error) {
      console.error(error)
    }
  }

  return <ImportFileFormView
    loading={importFile.loading}
    error={importFile.error}
    onSubmit={handleSubmit}
    onChange={handleChange}
    inputRef={inputRef}
  />
}


function ImportFileFormView({ loading, error, onSubmit, onChange, inputRef }) {
  return (
    <form className="import-file" onSubmit={onSubmit}>
      <fieldset>
        <input
          type="file"
          accept="application.json"
          multiple={false}
          onChange={onChange}
          disabled={loading}
          aria-busy={loading}
          ref={inputRef}
          style={{ display: 'none' }}
        />
      </fieldset>

      <button type="submit" disabled={loading}>
        {loading ? 'Importing...' : 'Import'}
      </button>

      {error && (
        <div role="alert">
          Error: {error}
        </div>
      )}
    </form>
  )
}


