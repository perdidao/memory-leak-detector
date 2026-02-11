/**
 * Audits memory leaks by tracking event listeners, intervals, timeouts, and observers.
 * Reports the counts at specified intervals and highlights potential leaks.
 */

export interface ListenerDetail {
  type: string
  targetType: string
  targetId: string
  targetClass: string
  targetTag: string
  count: number
  addedAt: number
}

export interface MemoryStats {
  listeners: number
  listenersChange: number
  intervals: number
  intervalsChange: number
  observers: number
  observersChange: number
  heapSize: string
  heapPercentage: string
  timePassed: string
  listenerBreakdown: Record<string, number>
  listenerDetails?: ListenerDetail[]
}

export type StatsCallback = (stats: MemoryStats) => void

interface TimerInfo {
  fn: TimerHandler
  delay: number
  stack: string | undefined
  createdAt: number
}

interface EventInfo {
  target: EventTarget
  type: string
  listener: EventListenerOrEventListenerObject | null
  options?: boolean | AddEventListenerOptions
  stack: string | undefined
  addedAt: number
}

interface ObserverInfo {
  type: string
  instance: ResizeObserver | MutationObserver | IntersectionObserver
  stack: string | undefined
  createdAt: number
}

interface PerformanceMemory {
  usedJSHeapSize: number
  jsHeapSizeLimit: number
  totalJSHeapSize: number
}

declare global {
  interface Window {
    __intervalAudit?: {
      intervals: Map<number, TimerInfo>
      timeouts: Map<number, TimerInfo>
    }
    __eventAudit?: EventInfo[]
    __observerAudit?: ObserverInfo[]
  }
  interface Performance {
    memory?: PerformanceMemory
  }
}

let reportInterval: number | null = null

/**
 * Starts the memory leak audit
 * @param reportIntervalInSeconds Interval in seconds between each report
 * @param typeOccurenceThreshold Threshold for reporting potential leaks based on occurrence count
 * @param onStatsUpdate Callback to receive stats updates
 */
export function startMemoryLeakAudit(
  reportIntervalInSeconds: number = 5,
  typeOccurenceThreshold: number = 5,
  onStatsUpdate: StatsCallback
): () => void {
  // Clear any existing audit
  stopMemoryLeakAudit()

  // Intervals and Timeouts
  const _setInterval = window.setInterval
  const _clearInterval = window.clearInterval
  const _setTimeout = window.setTimeout
  const _clearTimeout = window.clearTimeout

  window.__intervalAudit = {
    intervals: new Map(),
    timeouts: new Map(),
  }

  window.setInterval = function (fn: TimerHandler, delay?: number, ...args: unknown[]) {
    const id = _setInterval(fn, delay, ...args)
    window.__intervalAudit!.intervals.set(id, {
      fn,
      delay: delay ?? 0,
      stack: new Error().stack,
      createdAt: Date.now(),
    })
    return id
  } as typeof window.setInterval

  window.clearInterval = function (id: number | undefined) {
    if (id !== undefined) {
      window.__intervalAudit!.intervals.delete(id)
    }
    return _clearInterval(id)
  }

  window.setTimeout = function (fn: TimerHandler, delay?: number, ...args: unknown[]) {
    const id = _setTimeout(fn, delay, ...args)
    window.__intervalAudit!.timeouts.set(id, {
      fn,
      delay: delay ?? 0,
      stack: new Error().stack,
      createdAt: Date.now(),
    })
    return id
  } as typeof window.setTimeout

  window.clearTimeout = function (id: number | undefined) {
    if (id !== undefined) {
      window.__intervalAudit!.timeouts.delete(id)
    }
    return _clearTimeout(id)
  }

  // Event Listeners
  const _add = EventTarget.prototype.addEventListener
  const _remove = EventTarget.prototype.removeEventListener

  window.__eventAudit = []

  EventTarget.prototype.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    window.__eventAudit!.push({
      target: this,
      type,
      listener,
      options,
      stack: new Error().stack,
      addedAt: Date.now(),
    })
    return _add.call(this, type, listener, options)
  }

  EventTarget.prototype.removeEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ) {
    window.__eventAudit = window.__eventAudit!.filter(
      (e) => e.type !== type || e.listener !== listener || e.target !== this
    )
    return _remove.call(this, type, listener, options)
  }

  // Observers
  const _ResizeObserver = window.ResizeObserver
  const _MutationObserver = window.MutationObserver
  const _IntersectionObserver = window.IntersectionObserver

  window.__observerAudit = []

  function track(type: string, instance: ResizeObserver | MutationObserver | IntersectionObserver) {
    window.__observerAudit!.push({
      type,
      instance,
      stack: new Error().stack,
      createdAt: Date.now(),
    })
  }

  if (_ResizeObserver) {
    window.ResizeObserver = class extends _ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        super(callback)
        track('ResizeObserver', this)
      }
    }
  }

  if (_MutationObserver) {
    window.MutationObserver = class extends _MutationObserver {
      constructor(callback: MutationCallback) {
        super(callback)
        track('MutationObserver', this)
      }
    }
  }

  if (_IntersectionObserver) {
    window.IntersectionObserver = class extends _IntersectionObserver {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        super(callback, options)
        track('IntersectionObserver', this)
      }
    }
  }

  let timePassed = 0

  // Return 00:00 format
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  let previousListenersValue = 0
  let previousIntervalsValue = 0
  let previousObserversValue = 0

  function heapSizeInMB(): string {
    if (performance.memory) {
      return (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2) + ' MB'
    }
    return 'N/A'
  }

  function heapPercentage(): string {
    if (performance.memory) {
      return (
        ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(
          2
        ) + '%'
      )
    }
    return 'N/A'
  }

  reportInterval = window.setInterval(() => {
    const listenersDifference = window.__eventAudit!.length - previousListenersValue
    const intervalsDifference = window.__intervalAudit!.intervals.size - previousIntervalsValue
    const observersDifference = window.__observerAudit!.length - previousObserversValue

    timePassed += reportIntervalInSeconds

    const listenerTypes = window.__eventAudit!.reduce(
      (acc: Record<string, number>, curr: EventInfo) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1
        return acc
      },
      {}
    )

    const typesWithMoreThanThreshold = Object.entries(listenerTypes).filter(
      ([, count]) => count > typeOccurenceThreshold
    )
    const typesObject = Object.fromEntries(typesWithMoreThanThreshold)

    const stats: MemoryStats = {
      listeners: window.__eventAudit!.length,
      listenersChange: listenersDifference,
      intervals: window.__intervalAudit!.intervals.size,
      intervalsChange: intervalsDifference,
      observers: window.__observerAudit!.length,
      observersChange: observersDifference,
      heapSize: heapSizeInMB(),
      heapPercentage: heapPercentage(),
      timePassed: formatTime(timePassed),
      listenerBreakdown: typesObject,
    }

    onStatsUpdate(stats)

    previousListenersValue = window.__eventAudit!.length
    previousIntervalsValue = window.__intervalAudit!.intervals.size
    previousObserversValue = window.__observerAudit!.length
  }, reportIntervalInSeconds * 1000)

  // Return cleanup function
  return stopMemoryLeakAudit
}

/**
 * Stops the memory leak audit and cleans up
 */
export function stopMemoryLeakAudit() {
  if (reportInterval !== null) {
    clearInterval(reportInterval)
    reportInterval = null
  }
}
