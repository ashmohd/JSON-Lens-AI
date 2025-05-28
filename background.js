// Background service worker for JSON Lens AI

// Listener for the extension being installed or updated
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log('JSON Lens AI extension installed.');
    // Future: Set default preferences in chrome.storage.local
    // chrome.storage.local.set({
    //   theme: 'light',
    //   defaultModel: 'gemini-pro',
    //   // Add other default settings here
    // }, () => {
    //   console.log('Default preferences set.');
    // });
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    console.log('JSON Lens AI extension updated to version ' + chrome.runtime.getManifest().version);
  }
});

// Listener for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);

  if (request.action === "openJsonViewer" && request.jsonString) {
    const jsonString = request.jsonString;
    const viewerUrl = chrome.runtime.getURL('viewer.html');

    // Define a threshold for JSON string length (e.g., 1.5MB)
    const JSON_LENGTH_THRESHOLD = 1.5 * 1024 * 1024; // 1.5MB

    if (jsonString.length < JSON_LENGTH_THRESHOLD) {
      // Method 1: Pass JSON via URL parameter for smaller JSON.
      console.log('Using URL parameter method for JSON data.');
      const encodedJson = encodeURIComponent(jsonString);
      const urlWithJson = `${viewerUrl}?json=${encodedJson}`;

      chrome.tabs.create({ url: urlWithJson }, (tab) => {
        console.log('viewer.html opened in new tab with JSON data via URL parameter.');
        sendResponse({ status: "success", tabId: tab.id, method: "URL parameter" });
      });
    } else {
      // Method 2: Pass JSON via chrome.storage.local for larger JSON.
      console.log('Using chrome.storage.local method for JSON data.');
      const tempStorageKey = `json_data_for_tab_${Date.now()}`; // Unique key
      chrome.storage.local.set({ [tempStorageKey]: jsonString }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving JSON to local storage:', chrome.runtime.lastError);
          sendResponse({ status: "error", message: "Failed to save JSON to storage", method: "chrome.storage.local" });
          return;
        }
        const urlWithStorageKey = `${viewerUrl}?storageKey=${tempStorageKey}`;
        chrome.tabs.create({ url: urlWithStorageKey }, (tab) => {
          console.log('viewer.html opened. JSON stored in local storage with key:', tempStorageKey);
          sendResponse({ status: "success", tabId: tab.id, method: "chrome.storage.local", storageKey: tempStorageKey });
        });
      });
    }
    return true; // Indicates that the response will be sent asynchronously.
  } else if (request.action === "getStorage") {
    // Example: How other parts of the extension might request stored data
    // chrome.storage.local.get(request.keys, (result) => {
    //   if (chrome.runtime.lastError) {
    //     sendResponse({ error: chrome.runtime.lastError.message });
    //   } else {
    //     sendResponse({ data: result });
    //   }
    // });
    // return true; // Asynchronous response
    console.log("Placeholder for getStorage action");
    sendResponse({status: "ignored", reason: "getStorage not fully implemented in this version"});

  } else if (request.action === "setStorage") {
    // Example: How other parts of the extension might save data
    // chrome.storage.local.set(request.data, () => {
    //   if (chrome.runtime.lastError) {
    //     sendResponse({ error: chrome.runtime.lastError.message, status: "error" });
    //   } else {
    //     sendResponse({ status: "success" });
    //   }
    // });
    // return true; // Asynchronous response
    console.log("Placeholder for setStorage action");
    sendResponse({status: "ignored", reason: "setStorage not fully implemented in this version"});
  }

  // Default response if no specific action is matched for synchronous messages
  // If all primary paths return true for async, this part might not be reached
  // unless an unknown action is received.
  // sendResponse({ status: "unknown_action" });
  return true; // Keep channel open for async responses, good practice.
});

// Example of how API keys or preferences might be managed (can be called from options page or viewer)
function saveApiKey(apiKey) {
  // chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
  //   console.log('API Key saved.');
  // });
  console.log("Placeholder function saveApiKey called with:", apiKey);
}

function getApiKey(callback) {
  // chrome.storage.local.get(['geminiApiKey'], (result) => {
  //   if (result.geminiApiKey) {
  //     callback(result.geminiApiKey);
  //   } else {
  //     callback(null);
  //   }
  // });
  console.log("Placeholder function getApiKey called.");
  if (typeof callback === 'function') {
      callback(null); // Simulate no key found
  }
}

console.log('JSON Lens AI background script loaded and listeners attached.');
