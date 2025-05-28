// Content script for JSON Lens AI

let jsonViewerOpened = false; // Flag to prevent multiple openings

function isValidJsonString(str) {
  if (typeof str !== 'string') return false;
  const trimmedStr = str.trim();
  if ((trimmedStr.startsWith('{') && trimmedStr.endsWith('}')) || (trimmedStr.startsWith('[') && trimmedStr.endsWith(']'))) {
    try {
      JSON.parse(trimmedStr);
      return true;
    } catch (e) {
      // console.debug("JSON Lens AI: String parsing failed", e.message, "String:", trimmedStr.substring(0,100)); // Keep for debugging
      return false;
    }
  }
  return false;
}

function getPageContentAsJson() {
  // 1. Check Content-Type
  if (document.contentType === 'application/json') {
    console.log('JSON Lens AI: Detected application/json content type.');
    const content = document.body.textContent;
    // Validate because some servers might send invalid JSON with correct content type
    if (isValidJsonString(content)) {
        return content;
    }
    console.log('JSON Lens AI: Content-type is application/json, but content is not valid JSON.');
  }

  // 2. Check for JSON in a <pre> tag
  // This is common for APIs that return JSON but don't set the content type header correctly.
  const preElement = document.querySelector('pre');
  if (preElement) {
    console.log('JSON Lens AI: Found <pre> element.');
    const preText = preElement.textContent;
    if (isValidJsonString(preText)) {
      console.log('JSON Lens AI: Valid JSON found in <pre> element.');
      return preText;
    }
    console.log('JSON Lens AI: <pre> element content is not valid JSON.');
  }
  
  // 3. Check document.body.textContent (less reliable, more of a fallback)
  // This is a very basic check for cases where the entire body is just JSON,
  // and it's not wrapped in <pre> and content-type is not set.
  // We check if there are no other significant child elements.
  if (document.body) {
    const childElementCount = document.body.children.length;
    const textContent = document.body.textContent;

    if (childElementCount === 0 && textContent) {
      // No child elements, just text content in body
      console.log('JSON Lens AI: Body has no child elements, checking its textContent.');
      if (isValidJsonString(textContent)) {
        console.log('JSON Lens AI: Valid JSON found in document.body.textContent (no child elements).');
        return textContent;
      }
    } else if (childElementCount === 1 && document.body.firstChild.nodeName === '#text' && textContent) {
        // This case is less likely if childElementCount is 1 as #text isn't an element.
        // The more likely scenario for a single text node is childElementCount === 0 and document.body.firstChild being a text node.
        // The previous condition (childElementCount === 0) covers body being just text.
        // Let's refine this to check if the body has only one child element that's a PRE or if the body's direct text is JSON.
        // The preElement check above already covers single PRE.
        // If the body's primary content, excluding complex HTML, is JSON.
        // This remains a tricky fallback.
        console.log('JSON Lens AI: Checking body text content as a last resort (complex structure).');
         if (isValidJsonString(textContent)) {
            // This might be too broad. It might be better to check if a significant portion of the text is JSON.
            // For now, if the whole body text (trimmed) is valid JSON, we take it.
            console.log('JSON Lens AI: Valid JSON found in document.body.textContent (fallback).');
            return textContent;
        }
    }
  }

  console.log('JSON Lens AI: No clear JSON content found through primary detection methods.');
  return null;
}

function run() {
  if (jsonViewerOpened) {
    console.log('JSON Lens AI: Viewer already triggered for this page/frame.');
    return;
  }

  // Avoid running in iframes that are not the main document, unless specifically designed for it.
  // For now, let's assume it runs in all frames as per manifest, but this could be a point of refinement.
  // if (window.self !== window.top) {
  //   console.log('JSON Lens AI: Content script running in an iframe, aborting auto-detection.');
  //   return;
  // }

  console.log("JSON Lens AI content script executing 'run'");
  const jsonString = getPageContentAsJson();

  if (jsonString) {
    console.log('JSON Lens AI: Detected JSON content on the page.');
    chrome.runtime.sendMessage({ action: "openJsonViewer", jsonString: jsonString }, response => {
      if (chrome.runtime.lastError) {
        console.error("JSON Lens AI: Error sending message to background script:", chrome.runtime.lastError.message);
      } else {
        console.log("JSON Lens AI: Message sent to background, response:", response);
        if (response && response.status === "success") {
          jsonViewerOpened = true; // Mark as opened to prevent re-triggering
          console.log("JSON Lens AI: Successfully requested viewer opening.");
          // Optional: Replace page content to indicate JSON has been sent to the viewer.
          // This is good UX especially if the original page was raw JSON.
          // if (document.contentType === 'application/json' || (document.querySelector('pre') && document.body.children.length === 1 && document.body.firstChild.tagName === 'PRE')) {
          //   document.body.innerHTML = `
          //     <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          //       <h1>JSON Content Opened</h1>
          //       <p>The JSON from this page has been sent to the JSON Lens AI viewer in a new tab.</p>
          //       <p>You can close this tab or navigate away.</p>
          //     </div>`;
          // }
        } else if (response && response.status === "error") {
            console.error("JSON Lens AI: Background script reported an error opening viewer:", response.message);
        } else {
            console.warn("JSON Lens AI: Unknown response from background script or no response.");
        }
      }
    });
  } else {
    console.log('JSON Lens AI: No primary JSON content detected on this page for automatic viewing.');
  }
}

// Main logic execution
// Ensure the script runs after the DOM is fully available.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  // DOMContentLoaded has already fired
  run();
}

console.log("JSON Lens AI content script loaded and initialized.");
