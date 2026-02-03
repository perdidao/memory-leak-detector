import { useState, useEffect } from 'react'
import './App.css'
import type { MemoryStats } from './services/detectMemoryLeaks'
import ListenersDetail from './components/ListenersDetail'

interface ChromeMessage {
  type: string;
  stats?: MemoryStats;
}

type TabType = 'overview' | 'listeners'

function App() {
  const [testsRunning, setTestsRunning] = useState(false)
  const [stats, setStats] = useState<MemoryStats | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    // Listen for messages from content script
    const messageListener = (message: ChromeMessage) => {
      if (message.type === 'MEMORY_LEAK_STATS') {
        setStats(message.stats || null)
      } else if (message.type === 'MEMORY_LEAK_DETECTOR_READY') {
        setIsReady(true)
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    // Check if we have an active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      if (tabs[0]?.id) {
        // Ping the content script to see if it's ready
        chrome.tabs.sendMessage(tabs[0].id, { type: 'PING' })
          .then((response) => {
            if (response?.ready) {
              setIsReady(true)
            }
          })
          .catch(() => {
            setError('Please refresh the page to enable memory leak detection')
          })
      }
    })

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  useEffect(() => {
    if (!isReady) return

    const handleAudit = async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const tabId = tabs[0]?.id
      if (!tabId) return

      if (testsRunning) {
        // Send message to content script to start audit
        chrome.tabs.sendMessage(tabId, {
          type: 'START_MEMORY_AUDIT',
          interval: 1,
          threshold: 10
        })
      } else {
        // Stop audit
        chrome.tabs.sendMessage(tabId, {
          type: 'STOP_MEMORY_AUDIT'
        }).catch(() => {})
      }
    }

    handleAudit()

    return () => {
      if (testsRunning) {
        // Stop audit when component unmounts
        chrome.tabs.query({ active: true, currentWindow: true }).then((tabs: chrome.tabs.Tab[]) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'STOP_MEMORY_AUDIT'
            }).catch(() => {})
          }
        })
      }
    }
  }, [testsRunning, isReady])

  // Reset stats when stopping
  useEffect(() => {
    if (!testsRunning) {
      const timer = setTimeout(() => setStats(null), 0)
      return () => clearTimeout(timer)
    }
  }, [testsRunning])

  const formatChange = (value: number) => {
    if (value > 0) return <span style={{ color: '#ff6b6b' }}>(+{value})</span>
    return null
  }

  return (
    <div className="App">

      <header className="header">
        <h1>Memory Leak Detector</h1>

        {
          !testsRunning
            ?
              <button 
                onClick={() => setTestsRunning(true)}
                disabled={!isReady && !error}
              >
                Start detector
              </button>
            :
              <></>
        }

        {stats && (
          <p className="time-passed">{stats.timePassed}</p>
        )}
      </header>
      
      {error && (
        <div style={{ padding: '10px', background: '#fee', color: '#c33', borderRadius: '6px', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      {!isReady && !error && (
        <p className='status-message'>Connecting to page...</p>
      )}
      
      {testsRunning && !stats && isReady && (
        <p className='status-message'>Initializing audit...</p>
      )}

      {stats && (
        <>
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'listeners' ? 'active' : ''}`}
              onClick={() => setActiveTab('listeners')}
            >
              Listeners Detail ({stats.listenerDetails?.length || 0})
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="stats-container">

              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Event Listeners</h3>
                  <p className="stat-value">
                    {stats.listeners} {formatChange(stats.listenersChange)}
                  </p>
                </div>

                <div className="stat-card">
                  <h3>Intervals</h3>
                  <p className="stat-value">
                    {stats.intervals} {formatChange(stats.intervalsChange)}
                  </p>
                </div>

                <div className="stat-card">
                  <h3>Observers</h3>
                  <p className="stat-value">
                    {stats.observers} {formatChange(stats.observersChange)}
                  </p>
                </div>

                <div className="stat-card">
                  <h3>Heap Size</h3>
                  <p className="stat-value stat-value--small">{stats.heapSize}</p>
                </div>

                <div className="stat-card">
                  <h3>Heap % of Limit</h3>
                  <p className="stat-value stat-value--small">{stats.heapPercentage}</p>
                </div>
              </div>

              {Object.keys(stats.listenerBreakdown).length > 0 && (
                <div className="listener-breakdown">
                  <h3>Event Listeners Breakdown</h3>
                  <div className="breakdown-list">
                    {Object.entries(stats.listenerBreakdown).map(([type, count]) => (
                      <div key={type} className="breakdown-item">
                        <span className="event-type">{type}</span>
                        <span className="event-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'listeners' && stats?.listenerDetails && (
            <ListenersDetail 
              listeners={stats.listenerDetails}
            />
          )}
        </>
      )}
    </div>
  )
}

export default App
