import { useState, useEffect } from 'react'
import type { ListenerDetail } from '../services/detectMemoryLeaks'
import './ListenersDetail.css'

interface ListenersDetailProps {
  listeners: ListenerDetail[]
}

function ListenersDetail({ listeners }: ListenersDetailProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (listeners.length === 0) {
    return (
      <div className="no-data">
        <p>No listeners detected yet. Wait for the audit to collect data...</p>
      </div>
    )
  }

  const formatTimeSince = (timestamp: number) => {
    const seconds = Math.floor((now - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const getTargetDescription = (listener: ListenerDetail) => {
    const parts = []
    parts.push(listener.targetTag)
    if (listener.targetId) parts.push(`#${listener.targetId}`)
    if (listener.targetClass) {
      const classes = listener.targetClass
        .split(' ')
        .filter((c) => c)
        .slice(0, 2)
      if (classes.length > 0) parts.push(`.${classes.join('.')}`)
    }
    return parts.join('')
  }

  return (
    <div className="listeners-detail">
      <div className="detail-header">
        <h3>Event Listeners Details</h3>
        <p className="detail-subtitle">
          Total: {listeners.length} unique listener(s) | Total instances:{' '}
          {listeners.reduce((sum, l) => sum + l.count, 0)}
        </p>
      </div>

      <div className="listeners-list">
        {listeners.map((listener, index) => (
          <div
            key={`${listener.type}-${listener.targetTag}-${listener.targetId}-${listener.targetClass}-${index}`}
            className="listener-card"
          >
            <div className="listener-header">
              <span className="event-badge">{listener.type}</span>
              <span className="count-badge">{listener.count}x</span>
            </div>

            <div className="listener-body">
              <div className="target-info">
                <span className="label">Target:</span>
                <code className="target-selector">{getTargetDescription(listener)}</code>
              </div>

              <div className="time-info">
                <span className="label">First added:</span>
                <span className="time-value">{formatTimeSince(listener.addedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListenersDetail
