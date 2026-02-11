/**
 * This script is injected into the actual web page context
 * It monitors memory leaks and sends data back to the content script
 */

;(function () {
  // Prevent multiple injections
  if (window.__memoryLeakDetectorInstalled) {
    return
  }
  window.__memoryLeakDetectorInstalled = true

  let reportInterval = null

  window.__startMemoryAudit = function (reportIntervalInSeconds = 5, typeOccurenceThreshold = 20) {
    // Clean up any existing audit
    if (reportInterval) {
      clearInterval(reportInterval)
    }

    // Intervals and Timeouts
    const _setInterval = window.setInterval
    const _clearInterval = window.clearInterval
    const _setTimeout = window.setTimeout
    const _clearTimeout = window.clearTimeout

    window.__intervalAudit = {
      intervals: new Map(),
      timeouts: new Map(),
    }

    window.setInterval = function (fn, delay, ...args) {
      const id = _setInterval(fn, delay, ...args)
      window.__intervalAudit.intervals.set(id, {
        fn,
        delay,
        stack: new Error().stack,
        createdAt: Date.now(),
      })
      return id
    }

    window.clearInterval = function (id) {
      if (id !== undefined) {
        window.__intervalAudit.intervals.delete(id)
      }
      return _clearInterval(id)
    }

    window.setTimeout = function (fn, delay, ...args) {
      const id = _setTimeout(fn, delay, ...args)
      window.__intervalAudit.timeouts.set(id, {
        fn,
        delay,
        stack: new Error().stack,
        createdAt: Date.now(),
      })
      return id
    }

    window.clearTimeout = function (id) {
      if (id !== undefined) {
        window.__intervalAudit.timeouts.delete(id)
      }
      return _clearTimeout(id)
    }

    // Event Listeners
    const _add = EventTarget.prototype.addEventListener
    const _remove = EventTarget.prototype.removeEventListener

    window.__eventAudit = []

    EventTarget.prototype.addEventListener = function (type, listener, options) {
      const entry = {
        target: this,
        type,
        listener,
        options,
        stack: new Error().stack,
        addedAt: Date.now(),
        // Store unique ID for later identification
        targetId: this.id || '',
        targetClass: this.className || '',
        targetTag: this.tagName || this.constructor.name || 'Unknown',
      }
      window.__eventAudit.push(entry)
      // Store a reference map for scrolling
      if (!window.__eventTargetMap) {
        window.__eventTargetMap = new WeakMap()
      }
      window.__eventTargetMap.set(entry, this)
      return _add.call(this, type, listener, options)
    }

    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      window.__eventAudit = window.__eventAudit.filter(
        (e) => e.type !== type || e.listener !== listener || e.target !== this
      )
      return _remove.call(this, type, listener, options)
    }

    // Observers
    const _ResizeObserver = window.ResizeObserver
    const _MutationObserver = window.MutationObserver
    const _IntersectionObserver = window.IntersectionObserver

    window.__observerAudit = []

    function track(type, instance) {
      window.__observerAudit.push({
        type,
        instance,
        stack: new Error().stack,
        createdAt: Date.now(),
      })
    }

    if (_ResizeObserver) {
      window.ResizeObserver = class extends _ResizeObserver {
        constructor(callback) {
          super(callback)
          track('ResizeObserver', this)
        }
      }
    }

    if (_MutationObserver) {
      window.MutationObserver = class extends _MutationObserver {
        constructor(callback) {
          super(callback)
          track('MutationObserver', this)
        }
      }
    }

    if (_IntersectionObserver) {
      window.IntersectionObserver = class extends _IntersectionObserver {
        constructor(callback, options) {
          super(callback, options)
          track('IntersectionObserver', this)
        }
      }
    }

    let timePassed = 0

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0')
      const secs = (seconds % 60).toString().padStart(2, '0')
      return mins + ':' + secs
    }

    let previousListenersValue = 0
    let previousIntervalsValue = 0
    let previousObserversValue = 0

    function heapSizeInMB() {
      if (performance.memory) {
        return (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2) + ' MB'
      }
      return 'N/A'
    }

    function heapPercentage() {
      if (performance.memory) {
        return (
          ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(
            2
          ) + '%'
        )
      }
      return 'N/A'
    }

    reportInterval = setInterval(() => {
      const listenersDifference = window.__eventAudit.length - previousListenersValue
      const intervalsDifference = window.__intervalAudit.intervals.size - previousIntervalsValue
      const observersDifference = window.__observerAudit.length - previousObserversValue

      timePassed += reportIntervalInSeconds

      const listenerTypes = window.__eventAudit.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1
        return acc
      }, {})

      const typesWithMoreThanThreshold = Object.entries(listenerTypes).filter(
        ([, count]) => count > typeOccurenceThreshold
      )
      const typesObject = Object.fromEntries(typesWithMoreThanThreshold)

      // Group listeners by type and target for detailed view
      const listenerDetailsMap = {}
      window.__eventAudit.forEach((entry) => {
        const key = `${entry.type}::${entry.targetTag}::${entry.targetId}::${entry.targetClass}`
        if (!listenerDetailsMap[key]) {
          listenerDetailsMap[key] = {
            type: entry.type,
            targetType: entry.targetTag,
            targetId: entry.targetId,
            targetClass: entry.targetClass,
            targetTag: entry.targetTag,
            count: 0,
            addedAt: entry.addedAt,
            // Store reference for later use
            _entry: entry,
          }
        }
        listenerDetailsMap[key].count++
      })

      const listenerDetails = Object.values(listenerDetailsMap)
        .map(({ _entry, ...rest }) => rest)
        .sort((a, b) => b.count - a.count)

      const stats = {
        listeners: window.__eventAudit.length,
        listenersChange: listenersDifference,
        intervals: window.__intervalAudit.intervals.size,
        intervalsChange: intervalsDifference,
        observers: window.__observerAudit.length,
        observersChange: observersDifference,
        heapSize: heapSizeInMB(),
        heapPercentage: heapPercentage(),
        timePassed: formatTime(timePassed),
        listenerBreakdown: typesObject,
        listenerDetails: listenerDetails,
      }

      // Send stats to content script
      window.postMessage({ type: 'MEMORY_LEAK_STATS', stats }, '*')

      previousListenersValue = window.__eventAudit.length
      previousIntervalsValue = window.__intervalAudit.intervals.size
      previousObserversValue = window.__observerAudit.length
    }, reportIntervalInSeconds * 1000)
  }

  window.__stopMemoryAudit = function () {
    if (reportInterval) {
      clearInterval(reportInterval)
      reportInterval = null
    }
  }

  // Listen for commands from content script
  window.addEventListener('message', function (event) {
    if (event.source !== window) return

    if (event.data.type === 'START_MEMORY_AUDIT') {
      window.__startMemoryAudit(event.data.interval, event.data.threshold)
    } else if (event.data.type === 'STOP_MEMORY_AUDIT') {
      window.__stopMemoryAudit()
    }
  })

  // Notify that script is ready
  window.postMessage({ type: 'MEMORY_LEAK_DETECTOR_READY' }, '*')
})()
