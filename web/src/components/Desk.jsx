import { useStore } from '../store'
import SmallRecord from './SmallRecord'
import { getTransferData, indexInParent, RefType } from '../utils'
import DropTarget from './DropTarget'
import WidgetRecord from './WidgetRecord'
import Collection from './Collection'


export default function Desk({ onRecordClick }) {
  const desk = useStore(state => state.desk)

  return (
    <Collection
      className     = "desk"
      collection    = {desk}
      onRecordClick = {onRecordClick}
      render        = {props => <WidgetRecord {...props} />}
    />
  )
}
