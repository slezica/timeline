import { useLayoutEffect, useRef } from "react";
import DropTarget from "./DropTarget";
import { extendTransferData, getTransferData, RefType, setTransferData } from "../utils";


function isPointInRect({x, y}, rect) {
  return (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)
}

const TOLERANCE = 12


export default function DropList({ onDrop, children }) {
  const lineRef = useRef()
  const dropSpotRef = useRef()

  const showLine = ({ top, left, width }) => {
    let lineEl = lineRef.current

    // Find the line element if not ref'd:
    if (lineEl == null) {
       lineEl = lineRef.current = document.querySelector('.droplist-line')
    }

    // Create the line element if not found:
    if (lineEl == null) {
      lineEl = lineRef.current = document.createElement('div')
      lineEl.classList.add('droplist-line')
      document.body.appendChild(lineEl)
    }

    Object.assign(lineEl.style, {
      display: 'block',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`
    })
  }

  const hideLine = () => {
    if (lineRef.current) {
      lineRef.current.style.display = 'none'
    }
  }

  const findDropSpot = (ev) => {
    const y = ev.clientY

    const parent = ev.currentTarget
    const parentRect = parent.getBoundingClientRect()

    let i, zoneStart, zoneEnd

    // First drop zone starts at the top of the container:
    zoneStart = parentRect.top

    // Go through children, skipping the droplist-line at the beginning:
    for (i = 0; i < parent.children.length; i++) {
      const childRect = parent.children[i].getBoundingClientRect()

      // Intermediate drop zones end when the next child begins, plus a small margin:
      zoneEnd = childRect.top + TOLERANCE

      // Did we skip over the cursor? It's not on a drop zone then.
      if (y < zoneStart) {
        return null
      }

      // Is the cursor in this zone? Return the match if so.
      if (y >= zoneStart && y <= zoneEnd) {
        return {
          index: i,
          top: (zoneStart + zoneEnd) / 2,
          left: parentRect.left,
          width: parentRect.width
        }
      }

      zoneStart = childRect.bottom - TOLERANCE
    }

    // Last drop zone ends at the bottom of the container:
    zoneEnd = parentRect.bottom

    return {
      index: i,
      top: (zoneStart + zoneEnd) / 2,
      left: parentRect.left,
      width: parentRect.width
    }
  }

  const handleDragOverCapture = (ev) => {
    ev.preventDefault()

    const dropSpot = findDropSpot(ev)
    dropSpotRef.current = dropSpot
    extendTransferData(ev, RefType, { dropSpot })

    if (dropSpot) {
      showLine(dropSpot)
    } else {
      hideLine()
      dropSpotRef.current = null
    }
  }

  const handleDragLeave = () => {
    hideLine()
  }

  const handleDropCapture = () => {
    hideLine()
  }

  const handleDrop = (ev) => {
    const dropSpot = findDropSpot(ev)
    if (dropSpot) {
      ev.preventDefault()

      extendTransferData(ev, RefType, { dropSpot })
      onDrop?.(ev)
    }
  }

  return (
    <ol
      className          = "droplist"
      onDropCapture      = {handleDropCapture}
      onDragOverCapture  = {handleDragOverCapture}
      onDragLeaveCapture = {handleDragLeave}
      onDrop             = {handleDrop}
    >
      {children?.map(it =>
        <li className="droplist-item" key={it.key} draggable={true}>{it}</li>
      )}
    </ol>
  )
}
