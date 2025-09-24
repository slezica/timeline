import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from "react-intersection-observer"
import { useStore } from '../store'
import LargeRecord from './LargeRecord'

const SENTINEL_SPACING = 50


export default function Timeline({ timeline, onRecordClick }) {
  const [ groups, setGroups ] = useState([])
  const records = useStore(state => state.records)

  useEffect(() => {
    if (!timeline.ready) { return }

    // Merge consecutive same-ID entries, mark entry closest to present:
    const groups = []
    const present = new Date().toISOString()
    let mostRecentEntry = null

    for (let i = timeline.refs.length - 1; i > 0; i--) {
      const entry = timeline.refs[i]
      const lastGroup = groups[groups.length - 1]

      if (entry.date < present) {
        mostRecentEntry = entry
      }

      if (lastGroup && entry.id == lastGroup[0].id) {
        lastGroup.sort()
        lastGroup.push(entry)
      } else {
        groups.push([entry])
      }
    }

    if (mostRecentEntry) {
      mostRecentEntry.isMostRecent = true
    }

    setGroups(groups)

  }, [timeline])

  const handleRecordClick = (ref) => {
    onRecordClick?.(records.byId[ref])
  }

  const scrollToElement = useCallback((el) => {
    if (el) {
      el.scrollIntoView({ block: 'start', container: 'nearest' })
    }
  }, [])

  return (
    <TimelineView
      groups={groups}
      records={records}
      timeline={timeline}
      onRecordClick={onRecordClick}
      scrollToElement={scrollToElement}
    />
  )
}


function TimelineView({ groups, records, timeline, onRecordClick, scrollToElement }) {
  return (
    <section className="timeline">
      { groups.map(group => {
        const entry = group[0]
        const key = entry.event + entry.id
        const isMostRecent = group.some(entry => entry.isMostRecent)

        return (
          <div className="timeline-entry" key={key} data-date={group[group.length-1].date}>
            { isMostRecent && <div className="present"><hr />Present<hr /></div> }
            { isMostRecent && <div className="anchor" ref={scrollToElement} /> }

            {records.byId[entry.id]
              ? <LargeRecord
                  entries={group}
                  record={records.byId[entry.id]}
                  onClick={onRecordClick}
                  onRefClick={onRecordClick}
                />
              : <div>placeholder</div>
            }
          </div>
        )
      })}

      {timeline.loading && (
        <div aria-busy="true">Loading...</div>
      )}

      {timeline.error && (
        <div role="alert">
          Error: {timeline.error}
        </div>
      )}
    </section>
  )
}
