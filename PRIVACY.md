# Privacy Policy - Memory Leak Detector

**Effective date: February 4, 2026**

## Introduction

The Memory Leak Detector extension was developed with the highest respect for user privacy. This document clearly describes our privacy policy and how we handle data.

## Data Collection

**We DO NOT collect any personal or usage data.**

The Memory Leak Detector extension operates completely locally in your browser. Specifically:

- ❌ **We do not collect** personal information
- ❌ **We do not collect** browsing history
- ❌ **We do not collect** visited URLs
- ❌ **We do not collect** extension usage data
- ❌ **We do not collect** statistics or metrics
- ❌ **We do not transmit** any information to external servers
- ❌ **We do not store** data on servers

## How the Extension Works

The Memory Leak Detector extension works as follows:

1. **Local Analysis**: All memory analysis and leak detection is performed locally in your browser
2. **Real-Time Monitoring**: The collected data (listeners, timers, observers) exists only in memory during the audit session
3. **No Storage**: No data is persisted or stored, neither locally nor remotely
4. **No External Communication**: The extension does not make any network requests to external servers

## Content Modification

**We DO NOT modify web page content.**

The extension only:
- ✅ **Monitors** native JavaScript APIs (`addEventListener`, `setInterval`, etc.)
- ✅ **Records** the usage of these APIs for audit purposes
- ✅ **Displays** statistics in the extension popup

The extension does **NOT**:
- ❌ Modify page HTML
- ❌ Change the behavior of page elements
- ❌ Inject ads or additional content
- ❌ Manipulate forms or input data
- ❌ Interfere with the normal functionality of the page

## Required Permissions

The extension requests the following Chrome permissions:

### `activeTab`
Allows the extension to access the active tab when you click the extension icon. This is necessary to inject monitoring code into the page.

### `scripting`
Allows the extension to inject monitoring scripts into web pages. This is necessary to track event listeners, timers, and observers.

### `host_permissions` (http://*/* and https://*/*)
Allows the extension to work on all web pages you visit.

**Important**: These permissions are used exclusively for memory analysis functionality. No data is collected or transmitted.

## Open Source

This extension is **100% open source**. You can:
- Review all source code
- Verify there is no data collection
- Audit the extension yourself
- Contribute improvements

The code is publicly available and can be inspected by anyone.

## Policy Compliance

This extension is in full compliance with:
- Chrome Web Store Privacy Policies
- GDPR (General Data Protection Regulation)
- LGPD (Lei Geral de Proteção de Dados)

## Changes to this Policy

If there are changes to this Privacy Policy in the future, the effective date will be updated and changes will be communicated through the extension repository.

## Contact

If you have questions about this Privacy Policy or how the extension works, feel free to open an issue in the project repository.

---

**In summary**: This extension does not collect, store, or transmit any data. Everything works locally in your browser, and no information leaves your computer. Your privacy is fully respected.
