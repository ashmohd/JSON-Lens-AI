# JSON Lens AI - Feature Overview

This document outlines the features of the JSON Lens AI browser extension.

## Core JSON Viewing & Navigation

### 1. Automatic JSON Detection
*   Automatically identifies JSON content on web pages.
*   Supports detection via `Content-Type: application/json` headers.
*   Detects JSON embedded within `<pre>` tags on a page.
*   Includes a fallback mechanism to check the main body content if other methods don't find JSON.

### 2. Open JSON in a Dedicated Viewer
*   When JSON is detected, it's opened in a new browser tab featuring a specialized viewer (`viewer.html`).
*   Efficiently handles large JSON files by temporarily using `chrome.storage.local` for transfer to the viewer; smaller JSON files are passed as URL parameters.
*   Displays the original source URL of the JSON data, if available, for context.

### 3. Raw JSON View
*   Provides a "Toggle Raw" button allowing users to switch between a formatted, interactive tree view and a plain text area displaying the raw JSON string.

### 4. Theme Toggling
*   Includes a "Toggle Theme" button to switch the viewer's appearance between light and dark modes for user comfort.

### 5. Expand/Collapse Functionality
*   **Expand All:** A button to fully expand all nodes within the JSON tree.
*   **Collapse All:** A button to fully collapse all nodes to the root level.
*   **Expand to Level:** An input field and button allowing users to specify a depth level to which the JSON tree should be expanded.

### 6. JSONPath Navigation
*   Features a "Jump to Path" input field where users can enter a JSONPath expression (e.g., `$.data[0].name`) to directly navigate to and highlight the corresponding element in the JSON tree.

### 7. Breadcrumb Navigation
*   Dynamically generates and displays a breadcrumb trail representing the current path within the JSON structure.
*   Each part of the breadcrumb is clickable, allowing for quick navigation back to parent nodes.

### 8. Load JSON from URL
*   Allows users to directly load and view JSON from a specified web address.
*   Provides a "JSON URL" input field and a "Load" button in the viewer's toolbar for this purpose.

## Search Functionality

### 9. Search within JSON
*   Enables users to search for specific terms within the loaded JSON data using the "Search JSON..." input field.
*   **Search Targets:**
    *   Search within JSON values only.
    *   Search within JSON keys only.
    *   Search within both keys and values.
*   **Search Options:**
    *   **Case Sensitive:** A checkbox to toggle whether the search considers letter casing.
    *   **Use Regex:** A checkbox to enable the use of regular expressions for advanced search patterns.
*   **Clear Search:** A "Clear" button to remove the current search term and highlighting from the viewer.

## AI-Powered Features (powered by Gemini)

### 10. AI Settings Configuration
*   **Gemini API Key:** Users can input and save their Google Gemini API key via the settings popup to enable AI features.
*   **Gemini Model Selection:** Allows selection from a predefined list of Gemini models (e.g., `gemini-1.5-pro-preview-05-06`, `gemini-1.0-flash`).
*   **Custom Model Management:** Users can add their own custom Gemini model names/IDs and corresponding display names, which are then available in the model selection dropdown. Saved custom models can also be removed.

### 11. Summarize JSON
*   An "Summarize JSON" button that, when AI is configured, sends the current JSON data to the Gemini API to generate a concise summary of its content and structure. The summary is then displayed in the UI.

### 12. Natural Language Query (NLQ)
*   Provides an input field ("Ask AI about this JSON...") and a "Submit Query" button.
*   Allows users to ask questions about the loaded JSON data in plain English (or other supported languages). The query is processed by the Gemini API, and the answer is displayed.

### 13. Infer Schema
*   An "Infer Schema" button that uses the Gemini API to analyze the current JSON and deduce its structure, including data types and properties. The inferred schema is then presented to the user.

### 14. Explain Selected Node
*   An "Explain Selected Node" button (becomes active when a JSON node is selected in the viewer).
*   Sends the selected JSON node's content and path to the Gemini API to get a contextual explanation of that specific part of the data.

## User Interface & Experience Settings

### 15. Font Size Adjustment
*   Located in the settings popup, this allows users to increase or decrease the font size used for displaying the JSON tree and other text in the viewer, with a range from 8px to 30px.

### 16. Indentation Width Adjustment
*   Also in the settings popup, users can customize the indentation width (in pixels) for the JSON tree view, allowing for more compact or spread-out display (0px to 80px).

### 17. Settings Popup
*   A modal dialog accessed via the "AI Settings" button in the toolbar.
*   Consolidates all AI-related configurations (API key, model choice, custom models) and UI preferences (font size, indentation width).

## Extension Specific

### 18. Popup Window (Browser Action)
*   The extension has a basic popup window (`popup.html`) accessible when clicking the extension's icon in the Chrome toolbar.
*   The `manifest.json` defines this as the default popup, though its current UI content is minimal ("Popup content will go here."). Its primary role is to initiate actions or provide brief info/links.

### 19. Iconography
*   The extension includes a set of icons (16x16, 48x48, 128x128 pixels) for display in the Chrome extensions management page, toolbar, and other browser contexts, providing a visual identity for "JSON Lens AI".
