import CreateItemFormMini from "./CreateItemFormMini"
import SearchForm from "./SearchForm"

export function SidebarLeft({ onSearch, onEdit }) {
  const handleQueryChange = (query) => {
    onSearch?.(query)
  }

  const handleItemCreate = (item) => {
    onEdit?.(item)
  }

  return (
    <aside className="sidebar left">
      <header>
        <SearchForm onQueryChange={handleQueryChange} />
        <CreateItemFormMini onItemCreate={handleItemCreate} />
      </header>
    </aside>
  )
}
