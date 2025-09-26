export function BottomBar({ onToggleLeft, onToggleRight }) {
  const handleToggleLeft = (ev) => {
    onToggleLeft?.()
  }

  const handleToggleRight = (ev) => {
    onToggleRight?.()
  }

  return (
    <div className="toolbar bottom">
      <button type="button" onPointerDown={handleToggleLeft}>A</button>
      <div class="expand" />
      <button type="button" onPointerDown={handleToggleRight}>B</button>
    </div>
  )
}
