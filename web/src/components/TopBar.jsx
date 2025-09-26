import CreateRecordFormMini from "./CreateRecordFormMini"
import SearchForm from "./SearchForm"

export function TopBar({ onSearch, onRecordCreate }) {
  const handleQueryChange = (query) => {
    onSearch?.(query)
  }

  const handleRecordCreate = (record) => {
    onRecordCreate?.(record)
  }

  return (
    <div className="toolbar top">
      <SearchForm onQueryChange={handleQueryChange} />
      <CreateRecordFormMini onRecordCreate={handleRecordCreate} />
    </div>
  )
}
