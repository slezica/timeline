

function DropTargetList({ children, className }) {
  const selfRef = useRef()
  const [insertionPos, setInsertionPos] = useState(-1)

  const getValidTransferData = (ev) => {
    const data = getTransferData(ev)
    return (data?.id && index.byId[data.id]) ? data : null
  }

  const handleDragOver = (ev) => {
    setInsertionPos(getInsertionIndex(selfRef.current, ev))
  }

  const handleDragLeave = (ev) => {
    setInsertionPos(null)
  }

  const handleDrop = (ev) => {
    const ref = getValidTransferData(ev)
    if (!ref) { return }
  }

  return (
    <div className={className} ref={useRef}>
      {children}
    </div>
  )
}

function getInsertionIndex(parent, ev) {
  if (parent.children.length == 0) { return }

  const firstRect = parent.children[0].getBoundingClientRect()
  const lastRect = parent.children[parent.children.length - 1].getBoundingClientRect()

  if (ev.clientY < firstRect.top + tolerancePx) {
    return 0
  }

  if (ev.clientY > lastRect.bottom - tolerancePx) {
    return parent.children.length
  }

  for (let i = 0; i < parent.children.length - 1; i++) {
    const currentRect = parent.children[i].getBoundingClientRect()
    const siblingRect = parent.children[i + 1].getBoundingClientRect()

    if (ev.clientY >= currentRect.bottom - tolerancePx && ev.clientY <= siblingRect.top + tolerancePx) {
      return i + 1
    }
  }

  return -1
}

