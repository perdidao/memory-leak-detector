# Memory Leak Detector - Chrome Extension

An **open source** Chrome extension to detect and monitor memory leaks in web pages in real-time.

> 🔓 **Open Source** - This extension is fully open source and its code is available to everyone. Contributions are welcome!
> 
> 🔒 **Privacy** - We don't collect, store, or transmit any user data. All analysis is done locally in your browser. See our [Privacy Policy](PRIVACY.md).

## 🚀 Features

This extension was designed to help developers identify and fix memory leaks in web applications. It offers:

### Real-Time Monitoring

- **Event Listeners**: Tracks all event listeners added and removed on the page
  - Shows total number of active listeners
  - Breakdown by event type (click, scroll, resize, etc.)
  - Details about where each listener was attached (element, ID, class)
  - Identifies listeners that were never removed

- **Timers**: Monitors all application timers
  - **Intervals**: Tracks `setInterval` and `clearInterval`
  - **Timeouts**: Tracks `setTimeout` and `clearTimeout`
  - Identifies timers that were never cleared

- **Observers**: Tracks all browser API observers
  - `ResizeObserver` - observes element size changes
  - `MutationObserver` - observes DOM changes
  - `IntersectionObserver` - observes element intersections with viewport
  - Identifies observers that were never disconnected

### Memory Analysis

- **Heap Memory**: Displays JavaScript memory usage in real-time
  - Total size used
  - Usage percentage
  - Growth trend

- **Leak Detection**: Smart algorithm that identifies abnormal growth
  - Numbers in red indicate possible leaks
  - Visual alerts for unreleased resources

### User-Friendly Interface

- Clean and intuitive dashboard
- Automatic updates every 5 seconds
- Detailed visualization of listeners by event type
- Easy to start and stop auditing

## 📦 Installation

### Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 🎯 How to Use

1. Click the extension icon in Chrome toolbar
2. Click "Start Audit" to begin monitoring
3. The extension will collect statistics every 5 seconds
4. View in real-time:
   - Number of active event listeners
   - Number of active intervals
   - Number of active observers
   - Heap memory usage
   - Heap memory usage percentage
   - Event type breakdown (when there are more than 20 occurrences of the same type)

5. Click "Stop Audit" to stop monitoring

## 📊 Understanding the Data

### Leak Indicators

- **Red numbers (+X)**: Indicate continuous growth, possible leak
- **Excessive listeners**: If a specific event type appears many times, it may indicate listeners that weren't removed
- **Growing memory**: If heap memory keeps growing without stopping, there's a leak

### Best Practices

- Always remove event listeners when they're no longer needed
- Clear intervals and timeouts when components are unmounted
- Disconnect observers when they're no longer used
- Use `AbortController` to manage event listeners more easily

## 🛠️ Development

### Available Scripts

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Code linting
npm run lint
```

### Project Structure

```
src/
├── App.tsx                    # Main UI component
├── App.css                    # Interface styles
├── services/
│   └── detectMemoryLeaks.ts  # Memory leak detection logic
└── main.tsx                   # Entry point
```

## 🤝 Contributing

This is an open source extension and contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 Credits

Based on the original memory leak audit gist:
https://gist.github.com/perdidao/9254749e0a6e6251c605f0ea92535105

**Author:** Lucas "perdidão" Almeida

## 📄 License

This project is open source and available for free use.

## 🔒 Privacy

This extension fully respects your privacy. For more information, see our [Privacy Policy](PRIVACY_EN.md).

MIT

## 🔧 How It Works

The extension works in 3 layers:

1. **Injected Script**: Code injected directly into the web page context that intercepts browser APIs
2. **Content Script**: Bridge between the injected script and the extension popup
3. **Popup (App.tsx)**: Interface that displays the collected data

### Data Flow

```
Web Page → Injected Script → Content Script → Popup
     ↑         (collects)        (bridge)     (displays)
     |
 API Interception
```

## ⚠️ Important

- After installing or updating the extension, **reload the page** you want to monitor
- The extension only monitors the current active tab
- If the message "Please refresh the page" appears, reload the page

## 🧪 Testing

To test if the extension is working:

1. Open any web page
2. Open the page console (F12)
3. Run some commands to create event listeners:
   ```javascript
   // Add some listeners
   document.addEventListener('click', () => console.log('click'))
   window.addEventListener('scroll', () => console.log('scroll'))
   
   // Create an interval
   setInterval(() => console.log('interval'), 1000)
   
   // Create an observer
   const observer = new MutationObserver(() => {})
   observer.observe(document.body, { childList: true })
   ```

4. Open the extension and click "Start Audit"
5. Wait a few seconds and watch the numbers go up!
