import CreateRecordFormMini from "./CreateRecordFormMini"
import SearchForm from "./SearchForm"

export function Toolbar({ onSearch, onRecordCreate }) {
  const handleQueryChange = (query) => {
    onSearch?.(query)
  }

  const handleRecordCreate = (record) => {
    onRecordCreate?.(record)
  }

  return (
    <div className="toolbar">
      <header>
        <SearchForm onQueryChange={handleQueryChange} />
        <CreateRecordFormMini onRecordCreate={handleRecordCreate} />
      </header>
    </div>
  )
}
