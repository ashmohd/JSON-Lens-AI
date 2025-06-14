# JSON Lens AI

A Chrome extension to view, understand, and query JSON data with AI-powered insights.

## Features

JSON Lens AI provides a comprehensive suite of tools to enhance your experience with JSON data:

*   **Versatile JSON Viewing:**
    *   Load and view JSON data directly from URLs or from the currently active tab.
    *   Switch to a raw, unformatted JSON view when needed.
*   **Customizable Display:**
    *   Toggle between light and dark themes for comfortable viewing.
    *   Expand or collapse all JSON nodes with a single click.
    *   Precisely control visibility by expanding to a specific nesting level.
    *   Adjust font size and indentation for optimal readability (configurable in Settings).
*   **Efficient Navigation:**
    *   Directly jump to specific parts of the JSON tree using JSONPath expressions.
    *   Easily understand your current location within the JSON structure with interactive breadcrumbs.
*   **Powerful Search:**
    *   Search for specific keys, values, or both within the JSON data.
    *   Perform case-sensitive searches.
    *   Utilize regular expressions for complex search patterns.
*   **AI-Powered Insights (Gemini):**
    *   **Summarize JSON:** Get a quick overview of the JSON's structure and content.
    *   **Natural Language Query (NLQ):** Ask questions about your JSON data in plain English.
    *   **Infer Schema:** Automatically generate a structural schema from the data.
    *   **Explain Selected Node:** Get a detailed explanation for any specific node within the JSON.
*   **User Configuration:**
    *   Securely store your Gemini API key.
    *   Choose from available Gemini models or add custom ones.
    *   Manage UI preferences like font size and indentation.

## Installation

To install JSON Lens AI:

1.  **Download or Clone:**
    *   Download the repository as a ZIP file and unzip it, or
    *   Clone the repository using Git: `git clone https://github.com/your-username/json-lens-ai.git` (Replace `your-username/json-lens-ai.git` with the actual repository URL).
2.  **Open Chrome Extensions:**
    *   Open your Google Chrome browser.
    *   Navigate to `chrome://extensions`.
3.  **Enable Developer Mode:**
    *   In the top right corner of the Extensions page, toggle on "Developer mode".
4.  **Load Unpacked:**
    *   Click the "Load unpacked" button that appears.
    *   Select the directory where you downloaded or cloned the extension (the folder containing `manifest.json`).

The JSON Lens AI icon should now appear in your Chrome toolbar.

## How to Use

1.  **Accessing the Viewer:**
    *   **Automatic:** If you navigate to a URL that returns JSON data or open a local `.json` file in Chrome, JSON Lens AI may automatically open the viewer interface in a new tab. (Note: This behavior depends on the `content_script.js` functionality, assuming it redirects or provides a link to `viewer.html`).
    *   **Manual Load:**
        *   Click the JSON Lens AI icon in your Chrome toolbar to open the popup.
        *   You can open the main viewer by clicking a button or link in the popup (if available - currently the `popup.html` is basic).
        *   Alternatively, once `viewer.html` is open (e.g., from a previous session or by direct navigation if you bookmark it), you can use its URL bar to load JSON from a web address.
    *   **Viewing JSON from Active Tab:** The extension might also offer an option (e.g., via context menu or popup) to capture and view JSON from the current page if it's embedded or available as a resource.

2.  **Loading JSON Data:**
    *   **URL Input:** In the `viewer.html` page, use the "JSON URL" input field at the top to enter a direct link to a JSON file and click "Load".
    *   **Automatic Detection:** For pages that are purely JSON, the extension's content script should automatically detect and provide an option to open it in the viewer.

3.  **Interacting with JSON:**
    *   **Toolbar:** The top toolbar in `viewer.html` provides most controls:
        *   Load JSON from URL.
        *   Toggle raw JSON view.
        *   Switch themes.
        *   Expand/collapse nodes.
        *   Expand to a specific level.
        *   Jump to a path using JSONPath.
    *   **Search:** Use the search bar below the toolbar to find specific content within the JSON. You can specify whether to search keys, values, or both, and use options like case sensitivity or regular expressions.
    *   **Breadcrumbs:** The breadcrumb trail below the search bar shows your current path in the JSON structure and allows for quick navigation to parent elements.

4.  **Using AI Features:**
    *   The AI features are located in the "AI Insights" panel within `viewer.html`.
    *   **Configuration:** Before using AI features, you **must** configure your Gemini API key and select a model.
        *   Click the "AI Settings" button (gear icon) in the toolbar.
        *   Enter your Gemini API key in the provided field.
        *   Choose your preferred Gemini model. You can also add custom model endpoints here.
        *   Click "Close" to save settings.
    *   Once configured, buttons like "Summarize JSON", "Infer Schema", etc., will become active. Click them to get AI-powered insights on the currently loaded JSON.
    *   For "Explain Selected Node", first click on any key or value in the JSON viewer to select it, then click the button.

5.  **Settings:**
    *   Access general settings by clicking the "AI Settings" (gear icon) button in the toolbar.
    *   Here you can configure:
        *   Gemini API Key and Model.
        *   Custom AI Models.
        *   UI preferences like Font Size and Indentation width for the JSON display.

## AI-Powered Insights

JSON Lens AI integrates with Gemini models to provide intelligent analysis of your JSON data. To use these features, you must first configure your Gemini API Key and select a model in the **AI Settings** panel (accessible via the gear icon in the toolbar).

Once configured, the following AI capabilities are available:

*   **Summarize JSON:**
    *   Provides a concise, human-readable summary of the overall structure, purpose, and key information within the loaded JSON data.
    *   Useful for quickly understanding large or unfamiliar JSON documents.

*   **Query with Natural Language (NLQ):**
    *   Allows you to ask questions about the JSON data in plain English (e.g., "How many users are there?", "What are the names of products in the 'electronics' category?").
    *   The AI will interpret your query and attempt to find the relevant information within the JSON.

*   **Infer Schema:**
    *   Analyzes the structure of the JSON data and generates a schema.
    *   This schema can help you understand the expected data types, fields, and overall organization of the JSON.

*   **Explain Selected Node:**
    *   After selecting a specific key or value in the JSON viewer, this feature provides a contextual explanation of that node.
    *   It can help clarify the meaning or purpose of a particular piece of data within the larger JSON structure.

**Important:**
*   Ensure you have a valid Gemini API key with the appropriate permissions.
*   The quality and availability of AI insights depend on the selected Gemini model and the complexity of the JSON data.

## Contributing

Contributions are welcome! If you have suggestions for improvements or want to add new features, please follow these steps:

1.  **Fork the Repository:** Create your own fork of the project.
2.  **Create a Branch:** Make a new branch in your fork for your changes (e.g., `git checkout -b feature/your-feature-name`).
3.  **Make Changes:** Implement your improvements or new features.
4.  **Test Your Changes:** Ensure your changes work as expected and do not break existing functionality.
5.  **Commit Your Changes:** Write clear and concise commit messages.
6.  **Push to Your Fork:** Push your changes to your forked repository (e.g., `git push origin feature/your-feature-name`).
7.  **Submit a Pull Request:** Open a pull request from your branch to the main repository's `main` (or `master`) branch.

Please provide a clear description of your changes in the pull request.

