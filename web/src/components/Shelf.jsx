import { useStore } from '../store'
import SmallRecord from './SmallRecord'
import { getTransferData, indexInParent, RefType } from '../utils'
import DropTarget from './DropTarget'
import WidgetRecord from './WidgetRecord'
import Collection from './Collection'


export default function Shelf({ onRecordClick }) {
  const shelf = useStore(state => state.shelf)

  return (
    <Collection
      className     = "shelf"
      collection    = {shelf}
      onRecordClick = {onRecordClick}
      render        = {props => <SmallRecord {...props} />}
    />
  )
}
