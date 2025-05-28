document.addEventListener('DOMContentLoaded', () => {
  const jsonViewer = document.getElementById('json-viewer');
  const rawJsonTextarea = document.getElementById('raw-json');
  const toggleRawButton = document.getElementById('toggle-raw');
  const errorMessageDiv = document.getElementById('error-message');

  // AI Feature Elements
  const apiKeyInput = document.getElementById('gemini-api-key');
  const modelSelect = document.getElementById('gemini-model');
  const summarizeButton = document.getElementById('ai-summarize');
  const nlqInput = document.getElementById('nlq-input');
  const nlqSubmitButton = document.getElementById('nlq-submit');
  const inferSchemaButton = document.getElementById('ai-infer-schema');
  const explainNodeButton = document.getElementById('ai-explain-node');

  // Output divs for AI features (as per viewer.html example)
  const summaryOutputDiv = document.getElementById('ai-summary-output');
  const nlqOutputDiv = document.getElementById('nlq-output');
  const schemaOutputDiv = document.getElementById('ai-schema-output');
  const explainOutputDiv = document.getElementById('ai-explain-output');


  let currentJsonData = null;
  let currentRawJson = "";
  let isRawView = false;

  // Element Refs for new controls
  const expandAllButton = document.getElementById('expand-all');
  const collapseAllButton = document.getElementById('collapse-all');
  const expandLevelInput = document.getElementById('expand-level-input');
  const expandToLevelButton = document.getElementById('expand-to-level');


  // --- JSON Rendering Functions ---
  function renderJsonNode(data, container, currentLevel = 0) { // Added currentLevel
    container.dataset.level = currentLevel; // Set data-level attribute

    if (data === null) {
      const el = document.createElement('span');
      el.className = 'json-null';
      el.textContent = 'null';
      container.appendChild(el);
      return;
    }

    switch (typeof data) {
      case 'string':
        const strEl = document.createElement('span');
        strEl.className = 'json-string';
        strEl.textContent = `"${data}"`; // Add quotes for strings
        container.appendChild(strEl);
        break;
      case 'number':
        const numEl = document.createElement('span');
        numEl.className = 'json-number';
        numEl.textContent = data;
        container.appendChild(numEl);
        break;
      case 'boolean':
        const boolEl = document.createElement('span');
        boolEl.className = 'json-boolean';
        boolEl.textContent = data;
        container.appendChild(boolEl);
        break;
      case 'object':
        if (Array.isArray(data)) {
          const isObject = !Array.isArray(data);
          const itemCount = isObject ? Object.keys(data).length : data.length;

          if (itemCount === 0) { // Render empty array/object without toggler
            const emptyText = isObject ? '{}' : '[]';
            const el = document.createElement('span');
            el.className = isObject ? 'json-object' : 'json-array';
            el.textContent = emptyText;
            container.appendChild(el);
            return;
          }

          // Create a header div for toggler, key (if obj), and item count
          const entryHeader = document.createElement('div');
          entryHeader.className = 'json-entry-header';

          const toggler = document.createElement('span');
          toggler.className = 'json-toggler';
          toggler.textContent = '▼ '; // Expanded by default
          entryHeader.appendChild(toggler);
          
          // Key and opening brace/bracket are part of the header for objects/arrays
          // if (isObject && container.className !== 'json-value') { // Avoid adding key if this is a root object passed to renderJsonNode directly
             // This logic is slightly off, the key is handled by the caller for object properties.
             // For root objects/arrays, there's no preceding key in the `container`'s direct children.
          // }

          const openBracket = document.createElement('span');
          openBracket.className = 'json-punctuation';
          openBracket.textContent = isObject ? '{ ' : '[ ';
          entryHeader.appendChild(openBracket);
          
          const itemCountSpan = document.createElement('span');
          itemCountSpan.className = 'json-item-count';
          itemCountSpan.textContent = `(${itemCount} ${isObject ? (itemCount === 1 ? 'property' : 'properties') : (itemCount === 1 ? 'item' : 'items')})`;
          entryHeader.appendChild(itemCountSpan);

          // The container for an object/array itself is the <li> if it's nested, or jsonViewer if it's root
          // The `container` passed to renderJsonNode is where the output for `data` should go.
          // If `data` is an object or array, its representation will include the header and the child list.
          container.appendChild(entryHeader); // Add header to the current container

          const listElement = document.createElement('ul');
          listElement.className = isObject ? 'json-object' : 'json-array';
          // listElement.style.display = 'block'; // Expanded by default - CSS will handle via .collapsed

          if (isObject) {
            for (const key in data) {
              if (data.hasOwnProperty(key)) {
                const li = document.createElement('li');
                
                const keySpan = document.createElement('span');
                keySpan.className = 'json-key';
                keySpan.textContent = `"${key}": `;
                li.appendChild(keySpan);
                
                // The value part will be another call to renderJsonNode.
                // If the value is an object/array, it will create its own toggler etc.
                renderJsonNode(data[key], li); // Value directly in li after key
                
                listElement.appendChild(li);
              }
            }
          } else { // Array
            data.forEach(item => {
              const li = document.createElement('li');
              renderJsonNode(item, li); // Array item directly in li
              listElement.appendChild(li);
            });
          }
          container.appendChild(listElement); // Add list of children to the current container

          const closeBracket = document.createElement('span');
          closeBracket.className = 'json-punctuation';
          closeBracket.textContent = isObject ? ' }' : ' ]';
          container.appendChild(closeBracket);


          toggler.addEventListener('click', (event) => {
            event.stopPropagation();
            const parentLiOrContainer = container; // If container is <li> or jsonViewer
            // We want to collapse the listElement (ul) and the closing bracket
            // The header (entryHeader) should remain visible.
            
            const parentContainer = container; 

            // Check initial collapsed state from class, if any (e.g. for expandToLevel)
            let isCurrentlyCollapsed = parentContainer.classList.contains('collapsed-node');
            toggler.textContent = isCurrentlyCollapsed ? '► ' : '▼ ';


            toggler.addEventListener('click', (event) => {
              event.stopPropagation();
              const currentlyIsCollapsed = parentContainer.classList.contains('collapsed-node');
              if (currentlyIsCollapsed) {
                parentContainer.classList.remove('collapsed-node');
                toggler.textContent = '▼ ';
              } else {
                parentContainer.classList.add('collapsed-node');
                toggler.textContent = '► ';
              }
            });
            
            // Children are rendered one level deeper
            const nextLevel = currentLevel + 1;
            if (isObject) {
              for (const key in data) {
                if (data.hasOwnProperty(key)) {
                  const li = document.createElement('li');
                  // li.dataset.level = nextLevel; // Set on the li which will be a container for next renderJsonNode
                  
                  const keySpan = document.createElement('span');
                  keySpan.className = 'json-key';
                  keySpan.textContent = `"${key}": `;
                  li.appendChild(keySpan);
                  
                  renderJsonNode(data[key], li, nextLevel); 
                  
                  listElement.appendChild(li);
                }
              }
            } else { // Array
              data.forEach(item => {
                const li = document.createElement('li');
                // li.dataset.level = nextLevel; 
                renderJsonNode(item, li, nextLevel); 
                listElement.appendChild(li);
              });
            }
          } else { // Not an object or array, but was called on a value that should be simple
             // This case should ideally be handled by the caller ensuring `container` is appropriate
             // For instance, if renderJsonNode is called for a string value, the container is the `li`
             // and the string rendering logic correctly appends a span to it.
             // This `else` for `typeof data === 'object'` might not be reachable if logic is correct.
          }
        }
        break;
      default:
        const unkEl = document.createElement('span');
        unkEl.textContent = 'Unknown type: ' + typeof data;
        container.appendChild(unkEl);
    }
  }

  function displayJSON(jsonData) {
    try {
      currentJsonData = jsonData;
      currentRawJson = JSON.stringify(jsonData, null, 2); // For toggle and raw view

      jsonViewer.innerHTML = ''; // Clear previous content
      // If jsonData is an object or array, jsonViewer itself acts as a level 0 container
      if (typeof jsonData === 'object' && jsonData !== null) {
        renderJsonNode(jsonData, jsonViewer, 0); // Start rendering with level 0 for root
      } else {
        // If root is a primitive, render it directly without level (or handle as error/special case)
        renderJsonNode(jsonData, jsonViewer, 0); // Primitives will also get level 0 on jsonViewer
      }
      
      rawJsonTextarea.value = currentRawJson;
      jsonViewer.style.display = 'block';
      rawJsonTextarea.style.display = 'none';
      errorMessageDiv.style.display = 'none';
      isRawView = false;
      if(toggleRawButton) toggleRawButton.textContent = 'View Raw';
    } catch (error) {
      displayError('Error rendering JSON: ' + error.message);
      console.error("Error in displayJSON:", error);
    }
  }

  function displayRaw(jsonString) {
    currentRawJson = jsonString;
    // Attempt to parse to ensure it's valid for later formatted view
    try {
        currentJsonData = JSON.parse(jsonString);
    } catch (e) {
        currentJsonData = null; // Or handle as error
        // The example calls displayError here, let's align with that.
        // However, displaying an error just for loading raw text might be too aggressive.
        // Let's keep currentJsonData as null, and let the toggle handle if it can't switch back.
        console.warn('Invalid JSON string in raw view. Formatted view might not be available.');
    }
    rawJsonTextarea.value = jsonString;
    jsonViewer.style.display = 'none';
    rawJsonTextarea.style.display = 'block';
    errorMessageDiv.style.display = 'none';
    isRawView = true;
    if(toggleRawButton) toggleRawButton.textContent = 'View Formatted';
  }

  function displayError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    jsonViewer.style.display = 'none';
    rawJsonTextarea.style.display = 'none';
  }

  if(toggleRawButton){
    toggleRawButton.addEventListener('click', () => {
      if (isRawView) {
        if (currentJsonData) {
          displayJSON(currentJsonData);
        } else {
          // If raw view was initiated with invalid JSON, or currentJsonData became null
          try {
              const parsed = JSON.parse(rawJsonTextarea.value);
              displayJSON(parsed);
          } catch (e) {
              displayError('Cannot switch to formatted view: Invalid JSON text. Please correct it in the raw view.');
          }
        }
      } else {
        displayRaw(currentRawJson);
      }
    });
  } else {
    console.warn("Button with id 'toggle-raw' not found.")
  }
  
  // Event listener for theme-toggle (from viewer.html)
  const themeToggleButton = document.getElementById('theme-toggle');
  let currentTheme = 'light'; // default theme
  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
      if (currentTheme === 'light') {
        document.body.classList.remove('theme-light'); // Assuming you have these classes in style.css
        document.body.classList.add('theme-dark');
        currentTheme = 'dark';
      } else {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
        currentTheme = 'light';
      }
      console.log("Theme toggled to:", currentTheme);
    });
  } else {
      console.warn("Button with id 'theme-toggle' not found.");
  }

  // --- Expand/Collapse All Logic ---
  function setNodeExpansion(nodeContainer, isCollapsed) {
    // nodeContainer is expected to be the element that gets 'collapsed-node' class (e.g. LI or jsonViewer)
    const toggler = nodeContainer.querySelector(':scope > .json-entry-header > .json-toggler');
    
    if (isCollapsed) {
      nodeContainer.classList.add('collapsed-node');
      if (toggler) toggler.textContent = '► ';
    } else {
      nodeContainer.classList.remove('collapsed-node');
      if (toggler) toggler.textContent = '▼ ';
    }
  }

  function expandAllNodes() {
    // Find all elements that act as containers for collapsible content
    // These are LIs or the main jsonViewer div if they have a toggler (json-entry-header)
    const collapsibleContainers = jsonViewer.querySelectorAll('li, #json-viewer');
    collapsibleContainers.forEach(container => {
      // Check if it's a "true" collapsible container (has a header with toggler)
      if (container.querySelector(':scope > .json-entry-header > .json-toggler')) {
        setNodeExpansion(container, false);
      }
    });
  }

  function collapseAllNodes() {
    const collapsibleContainers = jsonViewer.querySelectorAll('li, #json-viewer');
     collapsibleContainers.forEach(container => {
      if (container.querySelector(':scope > .json-entry-header > .json-toggler')) {
        setNodeExpansion(container, true);
      }
    });
  }
  
  function expandToLevel(targetLevel) {
    const allPotentialContainers = jsonViewer.querySelectorAll('li, #json-viewer'); // Elements with data-level
    allPotentialContainers.forEach(container => {
      if (container.dataset.level === undefined) return; // Skip if no level defined

      const nodeLevel = parseInt(container.dataset.level, 10);
      const hasToggler = container.querySelector(':scope > .json-entry-header > .json-toggler');

      if (hasToggler) { // Only apply to nodes that are actually collapsible
        if (nodeLevel < targetLevel) {
          setNodeExpansion(container, false); // Expand
        } else {
          setNodeExpansion(container, true);  // Collapse
        }
      }
    });
  }

  if(expandAllButton) expandAllButton.addEventListener('click', expandAllNodes);
  if(collapseAllButton) collapseAllButton.addEventListener('click', collapseAllNodes);
  if(expandToLevelButton && expandLevelInput) {
    expandToLevelButton.addEventListener('click', () => {
      const level = parseInt(expandLevelInput.value, 10);
      if (!isNaN(level) && level >= 0) {
        expandToLevel(level);
      } else {
        alert("Please enter a valid non-negative number for the level.");
      }
    });
  }


  // Placeholder AI Handlers
  if(summarizeButton) summarizeButton.addEventListener('click', () => {
    console.log('Summarize clicked. API Key:', apiKeyInput.value, 'Model:', modelSelect.value);
    if(summaryOutputDiv) summaryOutputDiv.textContent = "Summarizing (placeholder)...";
  });
  if(nlqSubmitButton && nlqInput) nlqSubmitButton.addEventListener('click', () => {
    console.log('NLQ submitted. Query:', nlqInput.value, 'API Key:', apiKeyInput.value, 'Model:', modelSelect.value);
    if(nlqOutputDiv) nlqOutputDiv.textContent = "Querying (placeholder)...";
  });
  if(inferSchemaButton) inferSchemaButton.addEventListener('click', () => {
    console.log('Infer Schema clicked. API Key:', apiKeyInput.value, 'Model:', modelSelect.value);
    if(schemaOutputDiv) schemaOutputDiv.textContent = "Inferring schema (placeholder)...";
  });
  if(explainNodeButton) explainNodeButton.addEventListener('click', () => {
    console.log('Explain Node clicked. API Key:', apiKeyInput.value, 'Model:', modelSelect.value);
    // Actual node selection logic will be needed here
    if(explainOutputDiv) explainOutputDiv.textContent = "Explaining node (placeholder)...";
  });

  // API Key and Model Selection Storage (simple console log for now)
  if (apiKeyInput) {
    apiKeyInput.addEventListener('change', () => {
      console.log('API Key changed:', apiKeyInput.value);
      // Future: chrome.storage.local.set({ geminiApiKey: apiKeyInput.value });
    });
  }

  if (modelSelect) {
    modelSelect.addEventListener('change', () => {
      console.log('Gemini Model selected:', modelSelect.value);
      // Future: chrome.storage.local.set({ geminiModel: modelSelect.value });
    });
  }

  // Load initial JSON (e.g. from a message or a default)
  // For now, display a sample matching the task description
  const sampleJson = {
    "name": "JSON Lens AI",
    "version": "1.0",
    "status": "Development",
    "features": ["View", "Format", "AI Insights"]
  };
  displayJSON(sampleJson);

  // Listen for messages from content script or background script
  // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //   if (request.action === "displayJsonInViewer") {
  //     if (request.error) { // If content script sends an error (e.g. from initial fetch)
  //        displayError(request.error);
  //        if(request.jsonText) displayRaw(request.jsonText); // Show raw if available
  //     } else if (request.jsonData) {
  //       displayJSON(request.jsonData);
  //     } else if (request.jsonText) { // If only text is sent
  //       try {
  //         const parsed = JSON.parse(request.jsonText);
  //         displayJSON(parsed);
  //       } catch (e) {
  //         displayError("Received invalid JSON: " + e.message);
  //         displayRaw(request.jsonText); // Show the raw text if it's invalid
  //       }
  //     }
  //     // sendResponse({status: "JSON processed by viewer"}); // Optional
  //     return true; // If you might send a response asynchronously
  //   }
  // });
  console.log("JSON Lens AI viewer.js loaded and initialized matching example.");
});
