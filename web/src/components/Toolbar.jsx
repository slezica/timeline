import CreateItemFormMini from "./CreateItemFormMini"
import SearchForm from "./SearchForm"

export function Toolbar({ onSearch, onEdit }) {
  const handleQueryChange = (query) => {
    onSearch?.(query)
  }

  const handleItemCreate = (item) => {
    onEdit?.(item)
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
