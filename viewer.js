document.addEventListener('DOMContentLoaded', () => {
  const jsonViewer = document.getElementById('json-viewer');
  const rawJsonTextarea = document.getElementById('raw-json');
  const toggleRawButton = document.getElementById('toggle-raw');
  const errorMessageDiv = document.getElementById('error-message');

  // AI Feature Elements (Inputs are in settings popup, buttons are in AI features section)
  const settingApiKeyInput = document.getElementById('gemini-api-key'); // Renamed for consistency
  const settingModelSelect = document.getElementById('gemini-model');   // Renamed for consistency
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

  // Settings Popup Elements
  const settingsButton = document.getElementById('settings-button');
  const settingsPopup = document.getElementById('settings-popup');
  const closeSettingsPopupButton = document.getElementById('close-settings-popup');
  const breadcrumbContainer = document.getElementById('breadcrumb-container');

  // Model Info Popup Elements
  const viewModelInfoButton = document.getElementById('view-model-info-button');
  const modelInfoPopup = document.getElementById('model-info-popup');
  const closeModelInfoPopupButton = document.getElementById('close-model-info-popup');

  // Search Controls
  const searchTermInput = document.getElementById('search-term');
  const searchTypeValuesRadio = document.getElementById('search-type-values');
  const searchTypeKeysRadio = document.getElementById('search-type-keys');
  const searchTypeBothRadio = document.getElementById('search-type-both');
  const searchCaseSensitiveCheckbox = document.getElementById('search-case-sensitive');
  const searchRegexCheckbox = document.getElementById('search-regex');
  const searchButton = document.getElementById('search-button');
  const clearSearchButton = document.getElementById('clear-search-button');
  // const filterToMatchesCheckbox = document.getElementById('filter-to-matches'); // For later

  // Jump to Path controls
  const jumpToPathInput = document.getElementById('jump-to-path-input');
  const jumpToPathButton = document.getElementById('jump-to-path-button');
  const gotoAiInsightsButton = document.getElementById('goto-ai-insights-button');

  // Settings Inputs
  const settingFontSizeInput = document.getElementById('setting-font-size');
  const settingIndentWidthInput = document.getElementById('setting-indent-width');

  // Constants for settings
  const DEFAULT_FONT_SIZE = 13;
  const DEFAULT_INDENT_WIDTH = 20; // Default indentation in pixels
  const DEFAULT_MODEL = 'gemini-1.5-flash'; // Updated Default AI Model
  const FONT_SIZE_KEY = 'setting_fontSize';
  const INDENT_WIDTH_KEY = 'setting_indentWidth';
  const API_KEY_KEY = 'geminiApiKey'; // Storage key for API Key
  const MODEL_PREFERENCE_KEY = 'geminiModel'; // Storage key for Model Preference
  // Security Note: API keys are stored in chrome.storage.local, which is not synced
  // and is generally considered more secure for sensitive user data than chrome.storage.sync.

  let currentSearchMatches = []; // To store paths of current search matches


  // --- Settings Functionality ---
  function updateAiFeatureAvailability(apiKey) {
    const aiButtons = [summarizeButton, nlqSubmitButton, inferSchemaButton, explainNodeButton];
    const isApiKeyPresent = apiKey && apiKey.trim() !== '';

    aiButtons.forEach(button => {
      if (button) {
        button.disabled = !isApiKeyPresent;
        if (!isApiKeyPresent) {
          button.title = "API Key required for AI features.";
        } else {
          button.title = ""; // Clear title if key is present
        }
      }
    });
    // Also consider nlqInput enabled/disabled state
    if(nlqInput) nlqInput.disabled = !isApiKeyPresent;
  }

  function applySettings(settings) {
    // Font and Indent settings
    if (jsonViewer && settings.fontSize) {
      jsonViewer.style.fontSize = `${settings.fontSize}px`;
    }
    if (settings.indentWidth !== undefined) { 
      document.documentElement.style.setProperty('--json-indent-width', `${settings.indentWidth}px`);
    }
    // AI settings are not directly "applied" to view beyond form population and button state
    // updateAiFeatureAvailability is called after loading/saving AI settings.
  }

  function saveSettings() {
    // Visual settings
    let fontSize = parseInt(settingFontSizeInput.value, 10);
    let indentWidth = parseInt(settingIndentWidthInput.value, 10);

    if (isNaN(fontSize) || fontSize < parseInt(settingFontSizeInput.min, 10) || fontSize > parseInt(settingFontSizeInput.max, 10)) {
      fontSize = DEFAULT_FONT_SIZE;
      settingFontSizeInput.value = fontSize;
      showNotification(`Font size reset to default (${fontSize}px) due to invalid input.`, settingFontSizeInput.getBoundingClientRect().x, settingFontSizeInput.getBoundingClientRect().bottom + 5, true);
    }
    if (isNaN(indentWidth) || indentWidth < parseInt(settingIndentWidthInput.min, 10) || indentWidth > parseInt(settingIndentWidthInput.max, 10)) {
      indentWidth = DEFAULT_INDENT_WIDTH;
      settingIndentWidthInput.value = indentWidth;
      showNotification(`Indentation width reset to default (${indentWidth}px) due to invalid input.`, settingIndentWidthInput.getBoundingClientRect().x, settingIndentWidthInput.getBoundingClientRect().bottom + 5, true);
    }
    
    // AI settings
    const apiKey = settingApiKeyInput ? settingApiKeyInput.value.trim() : '';
    const modelPreference = settingModelSelect ? settingModelSelect.value : DEFAULT_MODEL;

    const settingsToSave = {
      [FONT_SIZE_KEY]: fontSize,
      [INDENT_WIDTH_KEY]: indentWidth,
      [API_KEY_KEY]: apiKey,
      [MODEL_PREFERENCE_KEY]: modelPreference
    };

    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(settingsToSave, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving settings:', chrome.runtime.lastError);
          showNotification('Error saving settings.', settingsPopup.getBoundingClientRect().x, settingsPopup.getBoundingClientRect().bottom + 5, true);
        } else {
          console.log('Settings saved:', settingsToSave);
          showNotification('Settings saved!', settingsPopup.getBoundingClientRect().x, settingsPopup.getBoundingClientRect().bottom + 5);
        }
      });
    } else {
        console.warn("chrome.storage.local not available. Settings not saved.");
    }
    applySettings({ fontSize, indentWidth }); // Apply visual settings
    updateAiFeatureAvailability(apiKey); // Update AI button states
  }

  function loadSettings() {
    const defaultValues = {
      [FONT_SIZE_KEY]: DEFAULT_FONT_SIZE,
      [INDENT_WIDTH_KEY]: DEFAULT_INDENT_WIDTH,
      [API_KEY_KEY]: '', // Default to empty API key
      [MODEL_PREFERENCE_KEY]: DEFAULT_MODEL
    };

    if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(defaultValues, (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error loading settings:', chrome.runtime.lastError);
                // Apply all defaults if error
                if(settingFontSizeInput) settingFontSizeInput.value = DEFAULT_FONT_SIZE;
                if(settingIndentWidthInput) settingIndentWidthInput.value = DEFAULT_INDENT_WIDTH;
                if(settingApiKeyInput) settingApiKeyInput.value = '';
                if(settingModelSelect) settingModelSelect.value = DEFAULT_MODEL;
                applySettings({ fontSize: DEFAULT_FONT_SIZE, indentWidth: DEFAULT_INDENT_WIDTH });
                updateAiFeatureAvailability('');
                return;
            }
            
            const loadedSettings = {
                fontSize: result[FONT_SIZE_KEY],
                indentWidth: result[INDENT_WIDTH_KEY],
                apiKey: result[API_KEY_KEY],
                modelPreference: result[MODEL_PREFERENCE_KEY]
            };

            if(settingFontSizeInput) settingFontSizeInput.value = loadedSettings.fontSize;
            if(settingIndentWidthInput) settingIndentWidthInput.value = loadedSettings.indentWidth;
            if(settingApiKeyInput) settingApiKeyInput.value = loadedSettings.apiKey;
            if(settingModelSelect) settingModelSelect.value = loadedSettings.modelPreference;
            
            applySettings(loadedSettings); // Apply visual settings
            updateAiFeatureAvailability(loadedSettings.apiKey); // Update AI button states
            console.log('Settings loaded:', loadedSettings);
        });
    } else {
        console.warn("chrome.storage.local not available. Applying default settings.");
        // Apply all defaults if storage is not available
        if(settingFontSizeInput) settingFontSizeInput.value = DEFAULT_FONT_SIZE;
        if(settingIndentWidthInput) settingIndentWidthInput.value = DEFAULT_INDENT_WIDTH;
        if(settingApiKeyInput) settingApiKeyInput.value = '';
        if(settingModelSelect) settingModelSelect.value = DEFAULT_MODEL;
        applySettings({ fontSize: DEFAULT_FONT_SIZE, indentWidth: DEFAULT_INDENT_WIDTH });
        updateAiFeatureAvailability('');
    }
  }

  // Add change listeners for all settings inputs
  if(settingFontSizeInput) settingFontSizeInput.addEventListener('change', saveSettings);
  if(settingIndentWidthInput) settingIndentWidthInput.addEventListener('change', saveSettings);
  if(settingApiKeyInput) settingApiKeyInput.addEventListener('change', saveSettings);
  if(settingModelSelect) settingModelSelect.addEventListener('change', saveSettings);
  // --- End Settings Functionality ---


  // --- Jump to Path Functionality ---
  function jumpToPath() {
    const pathString = jumpToPathInput.value.trim();

    if (!pathString) {
      showNotification("Please enter a JSONPath.", jumpToPathInput.getBoundingClientRect().x, jumpToPathInput.getBoundingClientRect().bottom + 5, true);
      return;
    }

    // Basic validation: should start with '$'
    if (!pathString.startsWith('$')) {
      showNotification("Invalid JSONPath. Path must start with '$'.", jumpToPathInput.getBoundingClientRect().x, jumpToPathInput.getBoundingClientRect().bottom + 5, true);
      return;
    }
    
    // Check if path exists in currentJsonData using getNodeDataByPath (more robust than just querySelector)
    const targetData = getNodeDataByPath(currentJsonData, pathString);

    if (targetData === undefined) {
      showNotification("Path not found in JSON data.", jumpToPathInput.getBoundingClientRect().x, jumpToPathInput.getBoundingClientRect().bottom + 5, true);
      return;
    }

    // If data exists for path, then try to expand and highlight
    expandPath(pathString); // This function already handles scrolling and highlighting

    // Verify if the element was actually found and highlighted by expandPath
    // expandPath itself logs if an element for a segment is not found.
    // A simple check here is if the target element exists.
    const targetElement = jsonViewer.querySelector(`[data-path="${pathString}"]`);
    if (targetElement) {
      // Path was found and expandPath should have handled it.
      updateBreadcrumbs(pathString); // Update breadcrumbs to the new path
      // jumpToPathInput.value = ''; // Clear input on successful jump - decided against to allow easy modification
      showNotification(`Jumped to path: ${pathString}`, jumpToPathInput.getBoundingClientRect().x, jumpToPathInput.getBoundingClientRect().bottom + 5);
    } else {
      // This case might be rare if getNodeDataByPath found data, but DOM element wasn't rendered/found
      showNotification("Path found in data, but element not found in view. Try expanding manually.", jumpToPathInput.getBoundingClientRect().x, jumpToPathInput.getBoundingClientRect().bottom + 5, true);
    }
  }

  if (jumpToPathButton) {
    jumpToPathButton.addEventListener('click', jumpToPath);
  }
  if (jumpToPathInput) {
    jumpToPathInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        jumpToPath();
      }
    });
  }
  // --- End Jump to Path Functionality ---


  // --- Search Functionality ---
  function clearSearchHighlights() {
    const highlighted = jsonViewer.querySelectorAll('.search-match');
    highlighted.forEach(el => el.classList.remove('search-match'));
    currentSearchMatches = [];
  }

  function highlightMatches(matchingPaths) {
    if (!matchingPaths || matchingPaths.length === 0) {
      showNotification("No matches found.", searchTermInput.getBoundingClientRect().x, searchTermInput.getBoundingClientRect().bottom + 5, true);
      return;
    }

    let firstMatchElement = null;

    matchingPaths.forEach((pathData, index) => {
      // expandPath will ensure the node and its parents are visible.
      // It also handles scrolling to the *final* element of the path.
      // We want to scroll to the first match overall.
      expandPath(pathData.path); // Expand to the matched node's container

      // Find the specific key or value span to highlight
      const containerElement = jsonViewer.querySelector(`[data-path="${pathData.path}"]`);
      if (containerElement) {
        let elementToHighlight = null;
        if (pathData.type === 'key') {
          // For keys, the path is to the value. The key is in the parent <li>, then .json-key
          // The containerElement found by data-path on a key is often the <li> or the value span itself.
          // We need to find the .json-key within the <li> that corresponds to this path.
          // The `renderJsonNode` sets data-path on the keySpan to be the same as its value's path.
          const keySpans = containerElement.parentNode.querySelectorAll(`.json-key[data-path="${pathData.path}"]`);
          keySpans.forEach(ks => {
             if(ks.dataset.key === pathData.keyName) elementToHighlight = ks;
          });
          // If not found that way (e.g. root object), try direct children.
           if(!elementToHighlight && containerElement.classList.contains('json-key') && containerElement.dataset.path === pathData.path){
             elementToHighlight = containerElement;
           }

        } else if (pathData.type === 'value') {
          // For values, the path directly points to the value span (if primitive) or its container (if object/array)
          // The copyable-value class is on the span that displays the primitive value.
          elementToHighlight = containerElement.querySelector('.copyable-value') || containerElement.classList.contains('copyable-value') ? containerElement : null;
           // If the container itself is the value (e.g. for empty array/object span, or root primitive)
           if (!elementToHighlight && containerElement.classList.contains('copyable-value') && containerElement.dataset.path === pathData.path) {
             elementToHighlight = containerElement;
           } else if (!elementToHighlight) {
             // If path points to an li for an array item or object property, the value is inside.
             // We need to be more specific if the direct container isn't the value span.
             const directValueSpan = containerElement.querySelector(`:scope > .copyable-value[data-path="${pathData.path}"]`);
             if(directValueSpan) elementToHighlight = directValueSpan;
             else { // Check if containerElement itself is the value span
                const selfValueSpan = (containerElement.matches && containerElement.matches(`.copyable-value[data-path="${pathData.path}"]`)) ? containerElement : null;
                if(selfValueSpan) elementToHighlight = selfValueSpan;
             }
           }
        }

        if (elementToHighlight) {
          elementToHighlight.classList.add('search-match');
          if (index === 0) {
            firstMatchElement = elementToHighlight;
          }
        } else {
            // Fallback: if specific element not found, highlight the container
            containerElement.classList.add('search-match');
            if(index === 0) firstMatchElement = containerElement;
            console.warn("Could not find specific key/value span for path:", pathData.path, "Highlighting container instead.");
        }
      }
    });

    if (firstMatchElement) {
      // expandPath already scrolls, but this ensures the *highlighted part* of first match is scrolled to.
      firstMatchElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showNotification(`${matchingPaths.length} match(es) found.`, searchTermInput.getBoundingClientRect().x, searchTermInput.getBoundingClientRect().bottom + 5);
    } else if (matchingPaths.length > 0) {
        // If no specific element was highlighted but paths were found (e.g. only containers)
        // attempt to scroll to the first path's container again.
        const firstPathContainer = jsonViewer.querySelector(`[data-path="${matchingPaths[0].path}"]`);
        if (firstPathContainer) {
            firstPathContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        showNotification(`${matchingPaths.length} match(es) found.`, searchTermInput.getBoundingClientRect().x, searchTermInput.getBoundingClientRect().bottom + 5);
    }
  }
  
  function findMatchesRecursive(data, currentPath, searchConfig, matches) {
    if (data === null || typeof data !== 'object') { // Primitives (or null) are handled as values by their parent
      return;
    }
  
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        const itemPath = `${currentPath}[${index}]`;
        if (searchConfig.searchValues) {
          let valueToCheck = item;
          if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' || item === null) {
            let valueStr = item === null ? 'null' : String(item);
            let term = searchConfig.term;
            if (!searchConfig.isCaseSensitive) {
              valueStr = valueStr.toLowerCase();
              term = term.toLowerCase();
            }
            if (searchConfig.isRegex) {
              try {
                if (new RegExp(term).test(valueStr)) {
                  matches.push({ path: itemPath, type: 'value', value: item });
                }
              } catch (e) { /* Ignore invalid regex for this test */ }
            } else {
              if (valueStr.includes(term)) {
                matches.push({ path: itemPath, type: 'value', value: item });
              }
            }
          }
        }
        // Recursive call for nested objects/arrays
        if (typeof item === 'object') {
          findMatchesRecursive(item, itemPath, searchConfig, matches);
        }
      });
    } else { // Object
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const itemPath = `${currentPath}['${key.replace(/'/g, "\\'")}']`;
          // Search Keys
          if (searchConfig.searchKeys) {
            let keyStrToMatch = key;
            let term = searchConfig.term;
            if (!searchConfig.isCaseSensitive) {
              keyStrToMatch = keyStrToMatch.toLowerCase();
              term = term.toLowerCase();
            }
            if (searchConfig.isRegex) {
              try {
                if (new RegExp(term).test(keyStrToMatch)) {
                  matches.push({ path: itemPath, type: 'key', keyName: key });
                }
              } catch (e) { /* Ignore invalid regex */ }
            } else {
              if (keyStrToMatch.includes(term)) {
                matches.push({ path: itemPath, type: 'key', keyName: key });
              }
            }
          }
  
          // Search Values (if the value is primitive)
          const value = data[key];
          if (searchConfig.searchValues) {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
              let valueStr = value === null ? 'null' : String(value);
              let term = searchConfig.term;
              if (!searchConfig.isCaseSensitive) {
                valueStr = valueStr.toLowerCase();
                term = term.toLowerCase();
              }
              if (searchConfig.isRegex) {
                try {
                  if (new RegExp(term).test(valueStr)) {
                    matches.push({ path: itemPath, type: 'value', value: value });
                  }
                } catch (e) { /* Ignore invalid regex */ }
              } else {
                if (valueStr.includes(term)) {
                  matches.push({ path: itemPath, type: 'value', value: value });
                }
              }
            }
          }
          // Recursive call for nested objects/arrays
          if (typeof value === 'object') {
            findMatchesRecursive(value, itemPath, searchConfig, matches);
          }
        }
      }
    }
  }

  function performSearch() {
    const term = searchTermInput.value;
    clearSearchHighlights();

    if (!term.trim()) {
      return; // No search term, do nothing
    }

    const searchType = document.querySelector('input[name="search-type"]:checked').value;
    const searchConfig = {
      term: term,
      searchKeys: searchType === 'keys' || searchType === 'both',
      searchValues: searchType === 'values' || searchType === 'both',
      isCaseSensitive: searchCaseSensitiveCheckbox.checked,
      isRegex: searchRegexCheckbox.checked,
    };

    if (searchConfig.isRegex) {
        try {
            new RegExp(searchConfig.term); // Validate regex syntax
        } catch (e) {
            showNotification(`Invalid Regular Expression: ${e.message}`, searchTermInput.getBoundingClientRect().x, searchTermInput.getBoundingClientRect().bottom + 5, true);
            return;
        }
    }
    
    currentSearchMatches = []; // Reset matches
    findMatchesRecursive(currentJsonData, '$', searchConfig, currentSearchMatches);
    
    // Remove duplicate paths (e.g. if both key and value match the same term for the same node)
    const uniquePaths = [];
    const seenPaths = new Set();
    currentSearchMatches.forEach(match => {
        if(!seenPaths.has(match.path + match.type + (match.keyName || ''))) { // Make key more unique
            uniquePaths.push(match);
            seenPaths.add(match.path + match.type + (match.keyName || ''));
        }
    });
    currentSearchMatches = uniquePaths;

    highlightMatches(currentSearchMatches);
  }

  function clearSearch() {
    searchTermInput.value = '';
    searchTypeValuesRadio.checked = true; // Default
    searchCaseSensitiveCheckbox.checked = false;
    searchRegexCheckbox.checked = false;
    clearSearchHighlights();
    // If filtering was implemented, would reset it here
  }

  if (searchButton) searchButton.addEventListener('click', performSearch);
  if (clearSearchButton) clearSearchButton.addEventListener('click', clearSearch);
  if (searchTermInput) {
    searchTermInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        performSearch();
      }
    });
  }
  // --- End Search Functionality ---


  // --- Breadcrumb Navigation ---

  function expandPath(pathString) {
    if (!pathString || !jsonViewer) return;
    console.log("Expanding path:", pathString);

    // Start with the root element, which is jsonViewer itself for path '$'
    let currentElement = jsonViewer;
    if (pathString === '$') {
      if (currentElement) {
        currentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // Parse path segments: $['key'][0] -> $ , $['key'] , $['key'][0]
    const segments = [];
    segments.push('$'); // Always start with root
    
    let tempPath = '$';
    const pathPartsRegex = /\['([^']+?)'\]|\[(\d+)\]/g;
    let match;
    while ((match = pathPartsRegex.exec(pathString)) !== null) {
        tempPath += match[0];
        segments.push(tempPath);
    }
    
    console.log("Path segments for expansion:", segments);

    segments.forEach((segmentPath, index) => {
      // Find the DOM element for this segment path.
      // For '$', currentElement is already jsonViewer.
      // For subsequent paths, query within jsonViewer.
      const elementToExpand = (segmentPath === '$') ? jsonViewer : jsonViewer.querySelector(`[data-path="${segmentPath}"]`);
      
      if (elementToExpand) {
        // Check if this element is a collapsible container and is collapsed
        // A collapsible container usually has a 'json-entry-header' and a 'json-toggler'
        // and might have the 'collapsed-node' class directly on it.
        const isCollapsible = elementToExpand.querySelector(':scope > .json-entry-header > .json-toggler');
        const isCollapsed = elementToExpand.classList.contains('collapsed-node');

        if (isCollapsible && isCollapsed) {
          console.log("Expanding node:", segmentPath);
          setNodeExpansion(elementToExpand, false); // setNodeExpansion(container, isCollapsed)
        }
        
        // Update currentElement for the next iteration if needed, or for final scroll
        currentElement = elementToExpand; 
        
        // If it's the last segment, scroll it into view
        if (index === segments.length - 1) {
          console.log("Scrolling to final element of path:", segmentPath, currentElement);
          currentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          // Add a temporary highlight
          currentElement.classList.add('highlighted-node');
          setTimeout(() => {
            currentElement.classList.remove('highlighted-node');
          }, 2000);
        }
      } else {
        console.warn("Could not find element for path segment:", segmentPath);
        // Stop further expansion if a segment is not found
        return; 
      }
    });
  }

  function updateBreadcrumbs(currentPathString) {
    if (!breadcrumbContainer) return;
    breadcrumbContainer.innerHTML = ''; // Clear existing breadcrumbs

    if (!currentPathString) currentPathString = '$'; // Default to root if undefined

    // Define segments based on the path structure used ($['key'][index])
    // Root element
    const rootSegment = document.createElement('span');
    rootSegment.textContent = '$';
    rootSegment.className = 'breadcrumb-segment';
    if (currentPathString === '$') {
      rootSegment.classList.add('breadcrumb-current');
    } else {
      rootSegment.classList.add('breadcrumb-link');
      rootSegment.dataset.pathSegment = '$';
    }
    breadcrumbContainer.appendChild(rootSegment);

    // Path segments parsing: $['key'][0]['next'] -> "key", 0, "next"
    const pathParts = currentPathString.match(/\['([^']+?)'\]|\[(\d+)\]/g);
    let builtPath = '$';

    if (pathParts) {
      pathParts.forEach((part, index) => {
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = ' > ';
        breadcrumbContainer.appendChild(separator);

        let segmentName = part.replace(/^\[\'?|\'?\]$/g, ''); // Remove brackets and quotes
        if (part.match(/^\[\d+\]$/)) { // Is an array index
            segmentName = part.replace(/^\[|\]$/g, '');
        } else { // Is an object key
            segmentName = segmentName.replace(/\\'/g, "'"); // Unescape quotes
        }
        
        builtPath += part;

        const segmentSpan = document.createElement('span');
        segmentSpan.textContent = segmentName;
        segmentSpan.className = 'breadcrumb-segment';

        if (index === pathParts.length - 1) { // Last segment
          segmentSpan.classList.add('breadcrumb-current');
        } else {
          segmentSpan.classList.add('breadcrumb-link');
          segmentSpan.dataset.pathSegment = builtPath;
        }
        breadcrumbContainer.appendChild(segmentSpan);
      });
    }
    
    // Add click listeners to newly created breadcrumb links
    breadcrumbContainer.querySelectorAll('.breadcrumb-link').forEach(link => {
      link.addEventListener('click', (event) => {
        const clickedPath = event.target.dataset.pathSegment;
        if (clickedPath) {
          expandPath(clickedPath); // Expand and scroll to the clicked path
          updateBreadcrumbs(clickedPath); // Then update breadcrumbs to reflect the new current path
        }
      });
    });
  }


  // --- JSON Rendering Functions ---
  function renderJsonNode(data, container, currentLevel = 0, currentPath = '$') {
    container.dataset.level = currentLevel;
    container.dataset.path = currentPath; // Set path for the container itself

    if (data === null) {
      const el = document.createElement('span');
      el.className = 'json-null copyable-value';
      el.textContent = 'null';
      el.dataset.path = currentPath;
      el.dataset.value = 'null';
      container.appendChild(el);
      return;
    }

    switch (typeof data) {
      case 'string':
        const strEl = document.createElement('span');
        strEl.className = 'json-string copyable-value';
        strEl.textContent = `"${data}"`;
        strEl.dataset.path = currentPath;
        strEl.dataset.value = data; // Store raw string
        container.appendChild(strEl);
        break;
      case 'number':
        const numEl = document.createElement('span');
        numEl.className = 'json-number copyable-value';
        numEl.textContent = data;
        numEl.dataset.path = currentPath;
        numEl.dataset.value = data;
        container.appendChild(numEl);
        break;
      case 'boolean':
        const boolEl = document.createElement('span');
        boolEl.className = 'json-boolean copyable-value';
        boolEl.textContent = data;
        boolEl.dataset.path = currentPath;
        boolEl.dataset.value = data;
        container.appendChild(boolEl);
        break;
      case 'object':
        const isArray = Array.isArray(data);
        const itemCount = isArray ? data.length : Object.keys(data).length;

        if (itemCount === 0) {
          const emptyText = isArray ? '[]' : '{}';
          const el = document.createElement('span');
          el.className = isArray ? 'json-array' : 'json-object';
          el.textContent = emptyText;
          el.dataset.path = currentPath; // Path for the empty object/array
          // el.dataset.value = emptyText; // Or perhaps JSON.stringify(data)
          container.appendChild(el);
          return;
        }

        const entryHeader = document.createElement('div');
        entryHeader.className = 'json-entry-header';

        const toggler = document.createElement('span');
        toggler.className = 'json-toggler';
        toggler.textContent = '▼ ';
        entryHeader.appendChild(toggler);

        const openBracket = document.createElement('span');
        openBracket.className = 'json-punctuation';
        openBracket.textContent = isArray ? '[ ' : '{ ';
        entryHeader.appendChild(openBracket);

        const itemCountSpan = document.createElement('span');
        itemCountSpan.className = 'json-item-count';
        itemCountSpan.textContent = `(${itemCount} ${isArray ? (itemCount === 1 ? 'item' : 'items') : (itemCount === 1 ? 'property' : 'properties')})`;
        entryHeader.appendChild(itemCountSpan);

        // Add copy subtree icon for non-empty objects/arrays
        // The 'itemCount > 0' check is already implicitly handled because this part of the code
        // is only reached if itemCount > 0. If itemCount were 0, it would have returned earlier.
        const copySubtreeIcon = document.createElement('span');
        copySubtreeIcon.className = 'copy-subtree-icon json-action-icon'; // Added json-action-icon for common styling
        copySubtreeIcon.textContent = '📋'; // Clipboard icon
        copySubtreeIcon.title = `Copy subtree (Path: ${currentPath})`;
        copySubtreeIcon.dataset.path = currentPath; // Store path for subtree
        entryHeader.appendChild(copySubtreeIcon);
        
        container.appendChild(entryHeader);

        const listElement = document.createElement('ul');
        listElement.className = isArray ? 'json-array' : 'json-object';
        // listElement.dataset.path = currentPath; // The list itself also represents this path

        if (!isArray) { // Object
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              const li = document.createElement('li');
              const itemPath = `${currentPath}['${key.replace(/'/g, "\\'")}']`; // Handle quotes in key
              li.dataset.path = itemPath; // Path for the key-value pair's value part

              const keySpan = document.createElement('span');
              keySpan.className = 'json-key copyable-key';
              keySpan.textContent = `"${key}": `;
              keySpan.dataset.key = key;
              keySpan.dataset.path = itemPath; // Path for the key itself
              li.appendChild(keySpan);
              
              renderJsonNode(data[key], li, currentLevel + 1, itemPath);
              listElement.appendChild(li);
            }
          }
        } else { // Array
          data.forEach((item, index) => {
            const li = document.createElement('li');
            const itemPath = `${currentPath}[${index}]`;
            li.dataset.path = itemPath; // Path for the item

            renderJsonNode(item, li, currentLevel + 1, itemPath);
            listElement.appendChild(li);
          });
        }
        container.appendChild(listElement);

        const closeBracket = document.createElement('span');
        closeBracket.className = 'json-punctuation';
        closeBracket.textContent = isArray ? ' ]' : ' }';
        container.appendChild(closeBracket);

        toggler.addEventListener('click', (event) => {
          event.stopPropagation();
          const parentNodeContainer = container;
          if (parentNodeContainer.classList.contains('collapsed-node')) {
            parentNodeContainer.classList.remove('collapsed-node');
            toggler.textContent = '▼ ';
          } else {
            parentNodeContainer.classList.add('collapsed-node');
            toggler.textContent = '► ';
          }
        });
        // Note: The recursive calls for children already happened above.
        // The data-level for children's containers (li) is set in those recursive calls.
        // The listElement itself doesn't need a specific level, its children (li) do.
        break;
      default:
        const unkEl = document.createElement('span');
        unkEl.textContent = 'Unknown type: ' + typeof data;
        container.appendChild(unkEl);
    }
  }

  function displayJSON(jsonData) {
    try {
      currentJsonData = jsonData; // Keep a reference to the full JSON data
      currentRawJson = JSON.stringify(jsonData, null, 2);

      jsonViewer.innerHTML = '';
      if (typeof jsonData === 'object' && jsonData !== null) {
        renderJsonNode(jsonData, jsonViewer, 0, '$');
      } else {
        renderJsonNode(jsonData, jsonViewer, 0, '$');
      }
      updateBreadcrumbs('$'); // Initial breadcrumb for root
      
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


  // --- AI Feature Handlers ---

  async function handleSummarizeJson() {
    const apiKey = settingApiKeyInput.value.trim();
    const selectedModel = settingModelSelect.value;

    if (!apiKey) {
      showNotification("API Key is required for AI features. Please set it in Settings.", summarizeButton.getBoundingClientRect().x, summarizeButton.getBoundingClientRect().bottom + 5, true);
      return;
    }

    if (!currentJsonData) {
      summaryOutputDiv.textContent = "No JSON data loaded to summarize.";
      return;
    }

    summaryOutputDiv.innerHTML = `Summarizing with ${selectedModel}... <span class="loading-spinner"></span>`;
    summarizeButton.disabled = true;

    try {
      const fullJsonString = JSON.stringify(currentJsonData);
      const MAX_JSON_STRING_LENGTH_FOR_SUMMARY = 150000; // Approx 30-40k tokens
      let jsonToSend = fullJsonString;
      let wasTruncated = false;
      let truncationNoticeForUser = "";
      let promptPrefix = "";

      if (fullJsonString.length > MAX_JSON_STRING_LENGTH_FOR_SUMMARY) {
        wasTruncated = true;
        jsonToSend = fullJsonString.substring(0, MAX_JSON_STRING_LENGTH_FOR_SUMMARY);
        console.warn(`JSON string truncated for summarization from ${fullJsonString.length} to ${jsonToSend.length} characters.`);
        
        promptPrefix = `Note: The following JSON data has been truncated due to its large size (original length ${fullJsonString.length} characters, truncated to ${jsonToSend.length} characters). Please provide a summary based on this partial data. `;
        
        truncationNoticeForUser = `<p style="font-style: italic; color: orange; margin-bottom: 10px;">Note: The original JSON was too large and was truncated before summarization. The summary is based on the initial part of the data (approx. first ${MAX_JSON_STRING_LENGTH_FOR_SUMMARY.toLocaleString()} characters).</p>`;
      }
      // TODO: Implement more sophisticated truncation/sampling for very large JSON (e.g., structural sampling) if this basic truncation isn't sufficient.


      const promptText = `${promptPrefix}Please provide a concise summary of the following JSON data. Describe its main purpose, overall structure, and identify any key entities or important fields. JSON data: 

\`\`\`json
${jsonToSend}
\`\`\`

Summary:`;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
      
      const requestBody = {
        contents: [{ parts: [{ text: promptText }] }],
        // Optional: Add generationConfig if needed (e.g., temperature, maxOutputTokens)
        // "generationConfig": {
        //   "temperature": 0.7,
        //   "maxOutputTokens": 256
        // }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('API Response Status:', response.status, response.statusText);
      const contentType = response.headers.get('content-type');
      console.log('API Response Content-Type:', contentType);

      const responseText = await response.text();
      console.log('API Raw Response Text:', responseText);

      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}.`;
        if (responseText) {
          errorMsg += ` Response: ${responseText.substring(0, 500)}`; // Show snippet of error
        }
        summaryOutputDiv.textContent = errorMsg;
        showNotification(errorMsg, summarizeButton.getBoundingClientRect().x, summarizeButton.getBoundingClientRect().bottom + 5, true);
        // No need to throw here, finally block will handle UI reset
        return; 
      }

      if (!contentType || !contentType.includes('application/json')) {
        summaryOutputDiv.textContent = `Error: Unexpected content type received from API: ${contentType}. Expected application/json. Response: ${responseText.substring(0,500)}`;
        showNotification("Error: Response was not JSON.", summarizeButton.getBoundingClientRect().x, summarizeButton.getBoundingClientRect().bottom + 5, true);
        return;
      }

      try {
        const responseData = JSON.parse(responseText);
        let summaryHtml = "";
        if (wasTruncated) {
          summaryHtml += truncationNoticeForUser;
        }

        if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts[0]) {
          const summaryText = responseData.candidates[0].content.parts[0].text;
          // Append summary text (escaping HTML is good practice if summary can contain HTML-like chars)
          const summaryTextNode = document.createTextNode(summaryText);
          const tempDiv = document.createElement('div'); // Create a temporary div to hold the text node
          tempDiv.appendChild(summaryTextNode);
          summaryHtml += tempDiv.innerHTML; // Get HTML string from the text node
          summaryOutputDiv.innerHTML = summaryHtml;

        } else if (responseData.promptFeedback && responseData.promptFeedback.blockReason) {
            const blockReason = responseData.promptFeedback.blockReason;
            const safetyRatings = responseData.promptFeedback.safetyRatings ? responseData.promptFeedback.safetyRatings.map(r => `${r.category}: ${r.probability}`).join(', ') : 'N/A';
            summaryOutputDiv.innerHTML = summaryHtml + `Content blocked by API. Reason: ${blockReason}. Safety Ratings: ${safetyRatings}`;
            showNotification(`Content blocked: ${blockReason}`, summarizeButton.getBoundingClientRect().x, summarizeButton.getBoundingClientRect().bottom + 5, true);
        } else {
          summaryOutputDiv.innerHTML = summaryHtml + "Could not extract summary from API response structure.";
          console.error('Unexpected API response JSON structure:', responseData);
        }
      } catch (parseError) {
        console.error('Error parsing API response JSON:', parseError);
        summaryOutputDiv.textContent = `Error: Failed to parse API response as JSON. Raw response: ${responseText.substring(0, 500)}...`;
        showNotification("Error: Invalid JSON response from API.", summarizeButton.getBoundingClientRect().x, summarizeButton.getBoundingClientRect().bottom + 5, true);
      }

    } catch (error) { // Catches network errors or errors from await response.text() if response itself is flawed
      console.error('Error during summarization fetch operation:', error);
      summaryOutputDiv.textContent = `Network or fetch error: ${error.message}`;
      showNotification(`Network error: ${error.message}`, summarizeButton.getBoundingClientRect().x, summarizeButton.getBoundingClientRect().bottom + 5, true);
    } finally {
      summarizeButton.disabled = false;
      const spinner = summaryOutputDiv.querySelector('.loading-spinner');
      if (spinner) spinner.remove();
    }
  }

  if(summarizeButton) summarizeButton.addEventListener('click', handleSummarizeJson);
  
  async function handleNlqSubmit() {
    const apiKey = settingApiKeyInput.value.trim();
    const selectedModel = settingModelSelect.value;
    const nlqQuery = nlqInput.value.trim();

    if (!apiKey) {
      showNotification("API Key is required for AI features. Please set it in Settings.", nlqSubmitButton.getBoundingClientRect().x, nlqSubmitButton.getBoundingClientRect().bottom + 5, true);
      return;
    }
    if (!nlqQuery) {
      showNotification("Please enter a natural language query.", nlqInput.getBoundingClientRect().x, nlqInput.getBoundingClientRect().bottom + 5, true);
      return;
    }
    if (!currentJsonData) {
      nlqOutputDiv.textContent = "No JSON data loaded to query.";
      return;
    }

    nlqOutputDiv.innerHTML = `Processing query with ${selectedModel}... <span class="loading-spinner"></span>`;
    nlqSubmitButton.disabled = true;
    nlqInput.disabled = true;

    try {
      const fullJsonString = JSON.stringify(currentJsonData);
      const MAX_JSON_STRING_LENGTH_FOR_NLQ = 150000; // Consistent with summarizer for now
      let jsonContextString = fullJsonString;
      let wasTruncated = false;
      let truncationNoticeForUser = "";
      let promptContextNote = "";

      if (fullJsonString.length > MAX_JSON_STRING_LENGTH_FOR_NLQ) {
        wasTruncated = true;
        jsonContextString = fullJsonString.substring(0, MAX_JSON_STRING_LENGTH_FOR_NLQ);
        console.warn(`JSON string truncated for NLQ from ${fullJsonString.length} to ${jsonContextString.length} characters.`);
        promptContextNote = `\n\nNote: The provided JSON data was truncated due to its size (original length ${fullJsonString.length} characters, truncated to ${jsonContextString.length} characters). Base your JSONPath on this partial data.`;
        truncationNoticeForUser = `<p style="font-style: italic; color: orange; margin-bottom: 10px;">Note: The original JSON was too large and was truncated. The query was based on the initial part of the data (approx. first ${MAX_JSON_STRING_LENGTH_FOR_NLQ.toLocaleString()} characters).</p>`;
      }

      let promptText = "Given the following JSON data, translate the natural language query into a single, valid JSONPath expression. ";
      promptText += "Only return the JSONPath expression itself (e.g., $.store.book[*].author). Do not include any markdown, explanations, or surrounding text. ";
      promptText += "If you cannot determine a valid JSONPath from the query, or if the query is too ambiguous, return the exact string 'INVALID_PATH'.";
      promptText += promptContextNote; // Add truncation note if applicable
      promptText += `\n\nJSON Data:\n\`\`\`json\n${jsonContextString}\n\`\`\`\n\nNatural Language Query: "${nlqQuery}"\n\nJSONPath:`;
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
      const requestBody = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { // More deterministic output for JSONPath
          temperature: 0.1, 
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('NLQ API Response Status:', response.status, response.statusText);
      const contentType = response.headers.get('content-type');
      console.log('NLQ API Response Content-Type:', contentType);
      const responseText = await response.text();
      console.log('NLQ API Raw Response Text:', responseText);

      let outputHtml = "";
      if (wasTruncated) {
        outputHtml += truncationNoticeForUser;
      }

      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}.`;
        if (responseText) {
          errorMsg += ` Response: ${responseText.substring(0, 500)}`;
        }
        nlqOutputDiv.innerHTML = outputHtml + `<p style="color: red;">${errorMsg}</p>`;
        showNotification(errorMsg, nlqSubmitButton.getBoundingClientRect().x, nlqSubmitButton.getBoundingClientRect().bottom + 5, true);
        return;
      }

      if (!contentType || !contentType.includes('application/json')) {
        nlqOutputDiv.innerHTML = outputHtml + `<p style="color: red;">Error: Unexpected content type received from API: ${contentType}. Expected application/json. Response: ${responseText.substring(0,500)}</p>`;
        showNotification("Error: Response was not JSON.", nlqSubmitButton.getBoundingClientRect().x, nlqSubmitButton.getBoundingClientRect().bottom + 5, true);
        return;
      }

      try {
        const responseData = JSON.parse(responseText);
        if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts[0]) {
          const generatedPath = responseData.candidates[0].content.parts[0].text.trim();
          if (generatedPath === 'INVALID_PATH' || generatedPath === '' || !generatedPath.startsWith('$')) {
            nlqOutputDiv.innerHTML = outputHtml + "<p>Could not determine a valid JSONPath for your query. Please try rephrasing or be more specific.</p>";
             if(generatedPath !== 'INVALID_PATH' && generatedPath !== '') {
                nlqOutputDiv.innerHTML += `<p style="font-size:0.9em; color:grey;">Model returned: <code>${generatedPath}</code></p>`;
            }
          } else {
            // Attempt to jump to the path
            const targetData = getNodeDataByPath(currentJsonData, generatedPath);
            let pathFeedback = "";
            if (targetData !== undefined) {
                expandPath(generatedPath);
                updateBreadcrumbs(generatedPath);
                pathFeedback = ` <span style="color: green;">(Path found and highlighted)</span>`;
            } else {
                pathFeedback = ` <span style="color: orange;">(Path not found in current JSON structure, but syntax might be valid)</span>`;
            }
            nlqOutputDiv.innerHTML = outputHtml + `<p>Generated JSONPath:</p><pre><code>${generatedPath}</code></pre>${pathFeedback}`;
          }
        } else if (responseData.promptFeedback && responseData.promptFeedback.blockReason) {
            const blockReason = responseData.promptFeedback.blockReason;
            const safetyRatings = responseData.promptFeedback.safetyRatings ? responseData.promptFeedback.safetyRatings.map(r => `${r.category}: ${r.probability}`).join(', ') : 'N/A';
            nlqOutputDiv.innerHTML = outputHtml + `<p style="color: red;">Content blocked by API. Reason: ${blockReason}. Safety Ratings: ${safetyRatings}</p>`;
            showNotification(`Content blocked: ${blockReason}`, nlqSubmitButton.getBoundingClientRect().x, nlqSubmitButton.getBoundingClientRect().bottom + 5, true);
        } else {
          nlqOutputDiv.innerHTML = outputHtml + "<p style='color: red;'>Could not extract JSONPath from API response structure.</p>";
          console.error('Unexpected NLQ API response JSON structure:', responseData);
        }
      } catch (parseError) {
        console.error('Error parsing NLQ API response JSON:', parseError);
        nlqOutputDiv.innerHTML = outputHtml + `<p style="color: red;">Error: Failed to parse API response as JSON. Raw response: ${responseText.substring(0, 500)}...</p>`;
        showNotification("Error: Invalid JSON response from API.", nlqSubmitButton.getBoundingClientRect().x, nlqSubmitButton.getBoundingClientRect().bottom + 5, true);
      }

    } catch (error) {
      console.error('Error during NLQ fetch operation:', error);
      nlqOutputDiv.innerHTML = `<p style="color: red;">Network or fetch error: ${error.message}</p>`; // Keep potential truncation notice
      showNotification(`Network error: ${error.message}`, nlqSubmitButton.getBoundingClientRect().x, nlqSubmitButton.getBoundingClientRect().bottom + 5, true);
    } finally {
      nlqSubmitButton.disabled = false;
      nlqInput.disabled = false;
      const spinner = nlqOutputDiv.querySelector('.loading-spinner');
      if (spinner) spinner.remove();
    }
  }
  
  // Placeholder AI Handlers - Will be updated to use stored API key/model
  if(nlqSubmitButton && nlqInput) {
    nlqSubmitButton.addEventListener('click', handleNlqSubmit);
    nlqInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleNlqSubmit();
        }
    });
  }
  if(inferSchemaButton) inferSchemaButton.addEventListener('click', () => {
    // console.log('Infer Schema clicked. API Key:', settingApiKeyInput.value, 'Model:', settingModelSelect.value);
    // if(schemaOutputDiv) schemaOutputDiv.textContent = "Inferring schema (placeholder)...";
  });

  async function handleInferSchema() {
    const apiKey = settingApiKeyInput.value.trim();
    const selectedModel = settingModelSelect.value;

    if (!apiKey) {
      showNotification("API Key is required for AI features. Please set it in Settings.", inferSchemaButton.getBoundingClientRect().x, inferSchemaButton.getBoundingClientRect().bottom + 5, true);
      return;
    }
    if (!currentJsonData) {
      schemaOutputDiv.textContent = "No JSON data loaded to infer schema from.";
      return;
    }

    schemaOutputDiv.innerHTML = `Inferring schema with ${selectedModel}... <span class="loading-spinner"></span>`;
    inferSchemaButton.disabled = true;

    try {
      const fullJsonString = JSON.stringify(currentJsonData);
      const MAX_JSON_STRING_LENGTH_FOR_SCHEMA = 150000; 
      let jsonContextString = fullJsonString;
      let wasTruncated = false;
      let truncationNoticeForUser = "";
      let promptContextNote = "";

      if (fullJsonString.length > MAX_JSON_STRING_LENGTH_FOR_SCHEMA) {
        wasTruncated = true;
        jsonContextString = fullJsonString.substring(0, MAX_JSON_STRING_LENGTH_FOR_SCHEMA);
        console.warn(`JSON string truncated for Schema Inference from ${fullJsonString.length} to ${jsonContextString.length} characters.`);
        promptContextNote = `\n\nNote: The provided JSON data was truncated due to its large size (original length ${fullJsonString.length} characters, truncated to ${jsonContextString.length} characters). Base your schema inference on this partial data.`;
        truncationNoticeForUser = `<p style="font-style: italic; color: orange; margin-bottom: 10px;">Note: The original JSON was too large and was truncated. The schema is inferred from the initial part of the data (approx. first ${MAX_JSON_STRING_LENGTH_FOR_SCHEMA.toLocaleString()} characters).</p>`;
      }

      let promptText = "Analyze the following JSON data and provide a concise schema inference. Describe the data types of the fields (e.g., String, Number, Boolean, Array, Object), identify common or important keys, and if possible, suggest if fields seem optional or typically present. ";
      promptText += "Present the schema in a human-readable, descriptive format. For example, use nested bullet points or a clear, structured textual description. Avoid outputting a formal JSON Schema document unless the JSON structure itself is extremely simple. Focus on understandability.";
      promptText += promptContextNote; // Add truncation note if applicable
      promptText += `\n\nJSON Data:\n\`\`\`json\n${jsonContextString}\n\`\`\`\n\nInferred Schema Description:`;
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
      const requestBody = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.3 }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('Schema Inference API Response Status:', response.status, response.statusText);
      const contentType = response.headers.get('content-type');
      console.log('Schema Inference API Response Content-Type:', contentType);
      const responseText = await response.text();
      console.log('Schema Inference API Raw Response Text:', responseText);

      let outputHtml = "";
      if (wasTruncated) {
        outputHtml += truncationNoticeForUser;
      }

      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}.`;
        if (responseText) { errorMsg += ` Response: ${responseText.substring(0, 500)}`; }
        schemaOutputDiv.innerHTML = outputHtml + `<p style="color: red;">${errorMsg}</p>`;
        showNotification(errorMsg, inferSchemaButton.getBoundingClientRect().x, inferSchemaButton.getBoundingClientRect().bottom + 5, true);
        return;
      }

      if (!contentType || !contentType.includes('application/json')) {
        schemaOutputDiv.innerHTML = outputHtml + `<p style="color: red;">Error: Unexpected content type received from API: ${contentType}. Expected application/json. Response: ${responseText.substring(0,500)}</p>`;
        showNotification("Error: Response was not JSON.", inferSchemaButton.getBoundingClientRect().x, inferSchemaButton.getBoundingClientRect().bottom + 5, true);
        return;
      }

      try {
        const responseData = JSON.parse(responseText);
        if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts[0]) {
          const inferredSchemaText = responseData.candidates[0].content.parts[0].text;
          const preElement = document.createElement('pre');
          preElement.textContent = inferredSchemaText;
          schemaOutputDiv.innerHTML = outputHtml; // Add truncation notice first
          schemaOutputDiv.appendChild(preElement); // Then append the preformatted schema
        } else if (responseData.promptFeedback && responseData.promptFeedback.blockReason) {
            const blockReason = responseData.promptFeedback.blockReason;
            const safetyRatings = responseData.promptFeedback.safetyRatings ? responseData.promptFeedback.safetyRatings.map(r => `${r.category}: ${r.probability}`).join(', ') : 'N/A';
            schemaOutputDiv.innerHTML = outputHtml + `<p style="color: red;">Content blocked by API. Reason: ${blockReason}. Safety Ratings: ${safetyRatings}</p>`;
            showNotification(`Content blocked: ${blockReason}`, inferSchemaButton.getBoundingClientRect().x, inferSchemaButton.getBoundingClientRect().bottom + 5, true);
        } else {
          schemaOutputDiv.innerHTML = outputHtml + "<p style='color: red;'>Could not extract schema from API response structure.</p>";
          console.error('Unexpected Schema Inference API response JSON structure:', responseData);
        }
      } catch (parseError) {
        console.error('Error parsing Schema Inference API response JSON:', parseError);
        schemaOutputDiv.innerHTML = outputHtml + `<p style="color: red;">Error: Failed to parse API response as JSON. Raw response: ${responseText.substring(0, 500)}...</p>`;
        showNotification("Error: Invalid JSON response from API.", inferSchemaButton.getBoundingClientRect().x, inferSchemaButton.getBoundingClientRect().bottom + 5, true);
      }

    } catch (error) {
      console.error('Error during Schema Inference fetch operation:', error);
      schemaOutputDiv.innerHTML = `<p style="color: red;">Network or fetch error: ${error.message}</p>`; // Keep potential truncation notice
      showNotification(`Network error: ${error.message}`, inferSchemaButton.getBoundingClientRect().x, inferSchemaButton.getBoundingClientRect().bottom + 5, true);
    } finally {
      inferSchemaButton.disabled = false;
      const spinner = schemaOutputDiv.querySelector('.loading-spinner');
      if (spinner) spinner.remove();
    }
  }

  if(inferSchemaButton) inferSchemaButton.addEventListener('click', handleInferSchema);

  if(explainNodeButton) explainNodeButton.addEventListener('click', () => {
    console.log('Explain Node clicked. API Key:', settingApiKeyInput.value, 'Model:', settingModelSelect.value);
    // Actual node selection logic will be needed here
    if(explainOutputDiv) explainOutputDiv.textContent = "Explaining node (placeholder)...";
  });

  // Event listeners for API Key and Model selection will be added in saveSettings/loadSettings context

  // --- Clipboard and Notification Utilities ---
  function copyToClipboard(text, type, event) {
    if (!navigator.clipboard) {
      console.error('Clipboard API not available.');
      showNotification('Clipboard API not supported in this browser.', event ? event.clientX : window.innerWidth / 2, event ? event.clientY : window.innerHeight / 2, true);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      console.log(`${type} copied to clipboard:`, text);
      if (event) { // Check if event is provided for positioning
        showNotification(`Copied ${type}!`, event.clientX, event.clientY);
      } else { // Fallback positioning
        showNotification(`Copied ${type}!`, window.innerWidth / 2, window.innerHeight / 2);
      }
    }).catch(err => {
      console.error(`Error copying ${type} to clipboard:`, err);
      if (event) {
        showNotification(`Error copying: ${err.message}`, event.clientX, event.clientY, true);
      } else {
        showNotification(`Error copying: ${err.message}`, window.innerWidth / 2, window.innerHeight / 2, true);
      }
    });
  }

  function showNotification(message, x, y, isError = false) {
    const notification = document.createElement('div');
    // Basic styling, can be enhanced in style.css
    notification.style.position = 'fixed';
    notification.style.background = isError ? 'rgba(255,0,0,0.8)' : 'rgba(0,0,0,0.7)';
    notification.style.color = 'white';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '10000'; // Ensure it's on top
    notification.style.fontSize = '14px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.transition = 'opacity 0.5s ease-out'; // For fade out
    notification.textContent = message;
    
    document.body.appendChild(notification);

    // Position near cursor or center if no cursor info, adjust if too close to edge
    const { innerWidth, innerHeight } = window;
    const notifRect = notification.getBoundingClientRect();
    
    let top = y + 20; // Offset from cursor
    let left = x + 20;

    // Adjust if overflowing
    if (left + notifRect.width > innerWidth - 20) { // 20px padding from edge
        left = x - notifRect.width - 20;
         if (left < 20) left = 20; // Prevent going off-screen left
    }
    if (top + notifRect.height > innerHeight - 20) {
        top = y - notifRect.height - 20;
        if (top < 20) top = 20; // Prevent going off-screen top
    }
    
    notification.style.left = `${Math.max(10, left)}px`;
    notification.style.top = `${Math.max(10, top)}px`;

    // Fade out and remove
    setTimeout(() => {
      notification.style.opacity = '0';
    }, 1800); // Start fading out before removal
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2300); // Remove after fade
  }
  // --- End Clipboard and Notification Utilities ---

  // --- Data Retrieval Utility ---
  function getNodeDataByPath(jsonData, path) {
    if (path === '$') return jsonData;
    // Evaluator for paths like $['key'], $['key with spaces'], $[0], $['key'][0]['sub key']
    try {
      let current = jsonData;
      // Improved regex to handle various key types and array indices
      const segments = path.match(/\['([^']+?)'\]|\[(\d+)\]/g);
      
      if (!segments && path !== '$') { // Path is not root and not parsable by regex (e.g. simple '$')
          console.warn(`Invalid or non-standard path format for non-root: ${path}`);
          return undefined;
      }
      if (!segments && path === '$') return jsonData; // Path is root

      for (const segment of segments) {
        const keyMatch = segment.match(/\['([^']+?)'\]/); // Match quoted key
        const indexMatch = segment.match(/\[(\d+)\]/);    // Match array index

        if (keyMatch) {
          const key = keyMatch[1].replace(/\\'/g, "'"); // Unescape single quotes in key
          if (typeof current === 'object' && current !== null && current.hasOwnProperty(key)) {
            current = current[key];
          } else {
            console.warn(`Path segment (key) "${key}" not found in data at current path. Full path: ${path}`);
            return undefined;
          }
        } else if (indexMatch) {
          const index = parseInt(indexMatch[1], 10);
          if (Array.isArray(current) && index >= 0 && index < current.length) {
            current = current[index];
          } else {
            console.warn(`Path segment (index) "${index}" not found or out of bounds in data at current path. Full path: ${path}`);
            return undefined;
          }
        } else {
          console.warn(`Invalid path segment: "${segment}". Full path: ${path}`);
          return undefined;
        }
        if (current === undefined) { // Should be caught by hasOwnProperty or array bounds, but as a safeguard
            console.warn(`Path evaluation led to undefined at segment: "${segment}". Full path: ${path}`);
            return undefined;
        }
      }
      return current;
    } catch (e) {
      console.error('Error evaluating JSONPath:', path, e);
      return undefined;
    }
  }
  // --- End Data Retrieval Utility ---

  // --- Initial JSON Loading Logic ---
  function loadInitialJson() {
    const urlParams = new URLSearchParams(window.location.search);
    const storageKey = urlParams.get('storageKey');
    const jsonParam = urlParams.get('json');

    if (storageKey) {
      console.log('Attempting to load JSON from chrome.storage.local with key:', storageKey);
      chrome.storage.local.get(storageKey, (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error retrieving from chrome.storage.local:', chrome.runtime.lastError);
          displayError(`Error accessing storage: ${chrome.runtime.lastError.message}`);
          // Attempt to remove the key even if retrieval failed, as it might exist but be corrupted
          chrome.storage.local.remove(storageKey, () => {
            if (chrome.runtime.lastError) {
              console.error('Error removing storage key after retrieval error:', storageKey, chrome.runtime.lastError);
            } else {
              console.log('Storage key removed after retrieval error:', storageKey);
            }
          });
          return;
        }

        if (result && result[storageKey]) {
          const jsonString = result[storageKey];
          try {
            const jsonData = JSON.parse(jsonString);
            displayJSON(jsonData);
          } catch (e) {
            console.error('Error parsing JSON from storage:', e);
            displayError(`Error parsing JSON from storage: ${e.message}. Raw data: ${jsonString.substring(0, 100)}...`);
          } finally {
            // Remove the item from storage after processing
            chrome.storage.local.remove(storageKey, () => {
              if (chrome.runtime.lastError) {
                console.error('Error removing item from chrome.storage.local:', storageKey, chrome.runtime.lastError);
              } else {
                console.log('Successfully removed item from chrome.storage.local:', storageKey);
              }
            });
          }
        } else {
          console.warn('Storage key found in URL, but no data in chrome.storage.local for key:', storageKey);
          displayError(`No data found in local storage for key: ${storageKey}. It might have expired or been cleared.`);
          // Attempt to remove the key if it was expected but not found, to clean up URL params if user retries
           chrome.storage.local.remove(storageKey, () => {
            if (chrome.runtime.lastError) {
              console.error('Error removing non-existent/empty storage key:', storageKey, chrome.runtime.lastError);
            } else {
              console.log('Attempted removal of non-existent/empty storage key:', storageKey);
            }
          });
        }
      });
    } else if (jsonParam) {
      console.log('Attempting to load JSON from URL parameter.');
      try {
        const decodedJson = decodeURIComponent(jsonParam);
        const jsonData = JSON.parse(decodedJson);
        displayJSON(jsonData);
      } catch (e) {
        console.error('Error parsing JSON from URL parameter:', e);
        displayError(`Error parsing JSON from URL: ${e.message}`);
      }
    } else {
      console.log('No storageKey or json URL parameter found. Loading sample JSON.');
      // For now, display a sample matching the task description
      const sampleJson = {
        "name": "JSON Lens AI",
        "version": "1.0",
        "status": "Development",
        "features": ["View", "Format", "AI Insights"],
        "message": "This is a sample JSON because no data was passed via URL or local storage."
      };
      displayJSON(sampleJson);
    }
  }

  loadInitialJson(); // Call the function to load JSON when DOM is ready.
  loadSettings(); // Load and apply settings on startup

  // --- Event Listener for Copy Actions on JSON Viewer ---
  if (jsonViewer) {
    jsonViewer.addEventListener('click', (event) => {
      const target = event.target;
      let path, valueToCopy, type;

      if (target.classList.contains('copyable-key')) {
        path = target.dataset.path;
        // const keyName = target.dataset.key; // Key name is also available if needed
        if (path) {
          valueToCopy = path;
          type = 'JSONPath';
          copyToClipboard(valueToCopy, type, event);
          updateBreadcrumbs(path); // Update breadcrumbs on key click
        }
        event.stopPropagation();
      } else if (target.classList.contains('copyable-value')) {
        path = target.dataset.path;
        if (path) {
          const actualNodeData = getNodeDataByPath(currentJsonData, path);
          if (actualNodeData === undefined && !target.dataset.value) { 
            showNotification('Cannot copy undefined value.', event.clientX, event.clientY, true);
            return;
          }
          
          if (typeof actualNodeData === 'string') {
            valueToCopy = actualNodeData;
          } else if (actualNodeData === null) {
            valueToCopy = 'null';
          } else if (actualNodeData !== undefined && typeof actualNodeData !== 'object') {
            valueToCopy = String(actualNodeData);
          } else if (target.dataset.value) { 
             valueToCopy = target.dataset.value; 
          } else { 
            valueToCopy = JSON.stringify(actualNodeData, null, 2); 
          }
          type = 'Value';
          copyToClipboard(valueToCopy, type, event);
          updateBreadcrumbs(path); // Update breadcrumbs on value click
        }
        event.stopPropagation();
      } else if (target.classList.contains('copy-subtree-icon')) {
        path = target.dataset.path;
        if (path) {
          const subTreeData = getNodeDataByPath(currentJsonData, path);
          if (subTreeData !== undefined) {
            try {
              valueToCopy = JSON.stringify(subTreeData, null, 2);
              type = 'Subtree JSON';
              copyToClipboard(valueToCopy, type, event);
              updateBreadcrumbs(path); // Update breadcrumbs on subtree copy
            } catch (e) {
              console.error('Error stringifying subtree:', e);
              showNotification('Error stringifying subtree', event.clientX, event.clientY, true);
            }
          } else {
            showNotification('Could not retrieve subtree data for copying.', event.clientX, event.clientY, true);
          }
        }
        event.stopPropagation();
      }
    });
  }
  // --- End Event Listener ---

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

  // --- Settings Popup Logic ---
  if (settingsButton && settingsPopup && closeSettingsPopupButton) {
    settingsButton.addEventListener('click', () => {
      settingsPopup.style.display = 'block';
    });

    closeSettingsPopupButton.addEventListener('click', () => {
      settingsPopup.style.display = 'none';
    });

    // Optional: Close popup if user clicks outside of it
    window.addEventListener('click', (event) => {
      if (event.target === settingsPopup) { // Close settings popup
        settingsPopup.style.display = 'none';
      }
      if (modelInfoPopup && event.target === modelInfoPopup) { // Close model info popup
        modelInfoPopup.style.display = 'none';
      }
    });
  } else {
    console.warn("AI Settings popup elements not found. Ensure #settings-button, #settings-popup, and #close-settings-popup exist.");
  }

  // --- Model Info Popup Logic ---
  if (viewModelInfoButton && modelInfoPopup && closeModelInfoPopupButton) {
    viewModelInfoButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent settings popup from closing if this button is inside it
      modelInfoPopup.style.display = 'block';
    });

    closeModelInfoPopupButton.addEventListener('click', () => {
      modelInfoPopup.style.display = 'none';
    });
    // Click outside logic for modelInfoPopup is handled by the window event listener for settingsPopup
  } else {
    console.warn("Model info popup elements not found. Ensure #view-model-info-button, #model-info-popup, and #close-model-info-popup exist.");
  }

  // --- Go to AI Insights Button Logic ---
  if (gotoAiInsightsButton) {
    gotoAiInsightsButton.addEventListener('click', () => {
      const aiFeaturesSection = document.querySelector('.ai-features'); // Corrected to querySelector
      if (aiFeaturesSection) {
        aiFeaturesSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.warn("AI Features section (.ai-features) not found.");
      }
    });
  } else {
    console.warn("Button with id 'goto-ai-insights-button' not found.");
  }

});
