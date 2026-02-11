/**
 * Content Script - Runs in the context of web pages
 * Acts as a bridge between the injected script and the popup
 */

// Exit early if extension context is invalid (e.g., after extension reload)
if (!chrome.runtime?.id) {
  console.log('Memory Leak Detector: Extension context invalidated, stopping initialization')
  // Don't throw an error, just stop execution
} else {
  // Extension context is valid, proceed with initialization
  let isInjected = false

  // Inject the script into the page context
  try {
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL('content/injected.js')
    script.onload = function () {
      script.remove()
      isInjected = true
    }
    ;(document.head || document.documentElement).appendChild(script)
  } catch (error) {
    console.warn('Memory Leak Detector: Failed to inject script', error)
  }

  // Listen for messages from the injected script
  window.addEventListener('message', (event) => {
    if (event.source !== window) return

    // Check if context is still valid before using chrome APIs
    if (!chrome.runtime?.id) return

    if (event.data.type === 'MEMORY_LEAK_STATS') {
      // Forward stats to the popup/background
      try {
        chrome.runtime
          .sendMessage({
            type: 'MEMORY_LEAK_STATS',
            stats: event.data.stats,
          })
          .catch(() => {
            // Popup might be closed, ignore error
          })
      } catch {
        // Context invalidated
      }
    } else if (event.data.type === 'MEMORY_LEAK_DETECTOR_READY') {
      try {
        chrome.runtime
          .sendMessage({
            type: 'MEMORY_LEAK_DETECTOR_READY',
          })
          .catch(() => {
            // Popup might be closed, ignore error
          })
      } catch {
        // Context invalidated
      }
    }
  })

  // Listen for commands from the popup
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    // Double check context is still valid
    if (!chrome.runtime?.id) {
      return false
    }

    if (message.type === 'PING') {
      // Respond that we're ready
      sendResponse({ ready: isInjected })
      return true
    } else if (message.type === 'START_MEMORY_AUDIT') {
      window.postMessage(
        {
          type: 'START_MEMORY_AUDIT',
          interval: message.interval,
          threshold: message.threshold,
        },
        '*'
      )
      sendResponse({ success: true })
      return true
    } else if (message.type === 'STOP_MEMORY_AUDIT') {
      window.postMessage(
        {
          type: 'STOP_MEMORY_AUDIT',
        },
        '*'
      )
      sendResponse({ success: true })
      return true
    }
  })
}
