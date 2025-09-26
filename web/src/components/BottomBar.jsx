import { useState } from "react"

export function BottomBar({ onLeftVisibleChange, onRightVisibleChange }) {
  const [isLeftVisible, setLeftVisible] = useState()
  const [isRightVisible, setRightVisible] = useState()

  const handleToggleLeft = (ev) => {
    const isVisible = !isLeftVisible
    setLeftVisible(isVisible)
    onLeftVisibleChange?.(isVisible)
  }

  const handleToggleRight = (ev) => {
    const isVisible = !isRightVisible
    setRightVisible(isVisible)
    onRightVisibleChange?.(isVisible)
  }

  return (
    <div className="toolbar bottom">
      <button type="button" onPointerDown={handleToggleLeft}>A</button>
      <div class="expand" />
      <button type="button" onPointerDown={handleToggleRight}>B</button>
    </div>
  )
}
