import CreateItemFormMini from "./CreateItemFormMini"
import SearchForm from "./SearchForm"

export function Toolbar({ onSearch, onItemCreate }) {
  const handleQueryChange = (query) => {
    onSearch?.(query)
  }

  const handleItemCreate = (item) => {
    onItemCreate?.(item)
  }

  return (
    <div className="toolbar">
      <header>
        <SearchForm onQueryChange={handleQueryChange} />
        <CreateItemFormMini onItemCreate={handleItemCreate} />
      </header>
    </div>
  )
}
