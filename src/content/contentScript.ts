/**
 * Content Script - Runs in the context of web pages
 * Acts as a bridge between the injected script and the popup
 */

let isInjected = false;

// Inject the script into the page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('content/injected.js');
script.onload = function() {
  script.remove();
  isInjected = true;
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from the injected script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data.type === 'MEMORY_LEAK_STATS') {
    // Forward stats to the popup/background
    chrome.runtime.sendMessage({
      type: 'MEMORY_LEAK_STATS',
      stats: event.data.stats
    }).catch(() => {
      // Popup might be closed, ignore error
    });
  } else if (event.data.type === 'MEMORY_LEAK_DETECTOR_READY') {
    chrome.runtime.sendMessage({
      type: 'MEMORY_LEAK_DETECTOR_READY'
    }).catch(() => {
      // Popup might be closed, ignore error
    });
  }
});

// Listen for commands from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PING') {
    // Respond that we're ready
    sendResponse({ ready: isInjected });
    return true;
  } else if (message.type === 'START_MEMORY_AUDIT') {
    window.postMessage({
      type: 'START_MEMORY_AUDIT',
      interval: message.interval,
      threshold: message.threshold
    }, '*');
    sendResponse({ success: true });
    return true;
  } else if (message.type === 'STOP_MEMORY_AUDIT') {
    window.postMessage({
      type: 'STOP_MEMORY_AUDIT'
    }, '*');
    sendResponse({ success: true });
    return true;
  }
});
