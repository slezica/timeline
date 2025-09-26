
export function BottomBar({ onOpenLeft, onOpenRight }) {
  const handleOpenLeft = (query) => {
    onOpenLeft?.()
  }

  const handleOpenRight = (query) => {
    onOpenRight?.()
  }

  return (
    <div className="toolbar bottom">
    </div>
  )
}
