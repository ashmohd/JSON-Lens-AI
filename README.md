## JSON Lens AI 🚀

**JSON Lens AI** is a powerful Chrome Extension designed to help you effortlessly view, understand, and query JSON data. Whether you're a developer debugging APIs, a data analyst exploring datasets, or anyone working with JSON, this tool will streamline your workflow.

**Key Features:**

*   **Advanced JSON Viewing:** Seamlessly switch between raw and beautifully formatted JSON. Toggle themes for optimal readability.
*   **Effortless Navigation:** Expand and collapse JSON nodes with precision – go all in, or explore level by level. Navigate complex structures with ease using JSONPath.
*   **Powerful Search:** Quickly find what you need by searching keys, values, or both. Fine-tune your search with case-sensitive and regex options.
*   **AI-Powered Insights (via Gemini API):**
    *   **Summarize:** Get quick summaries of your JSON data.
    *   **Natural Language Querying:** Ask questions about your data in plain English.
    *   **Schema Inference:** Understand the structure of your JSON at a glance.
    *   **Node Explanation:** Get clear explanations for specific JSON nodes.
*   **Highly Customizable:** Tailor JSON Lens AI to your needs. Configure your Gemini API key, choose your preferred AI model (including custom models), and adjust UI settings like font size and indentation.

Dive deeper into your JSON data with AI-enhanced clarity and control!

## Features

### JSON Viewing
*   **Raw View:** Display the raw, unformatted JSON string.
*   **Formatted View:** Pretty-print the JSON for improved readability with collapsible tree structure.
*   **Theme Toggling:** Switch between different visual themes (e.g., light/dark) for comfortable viewing.

### Navigation
*   **Expand All:** Fully expand all nodes in the formatted JSON view.
*   **Collapse All:** Fully collapse all nodes to the root level in the formatted JSON view.
*   **Expand to Specific Level:** Expand the JSON tree down to a user-defined depth.
*   **JSONPath Navigation:** Directly jump to a specific node or value within the JSON using a JSONPath expression.
*   **Breadcrumbs:** Display the path to the currently selected/viewed node, allowing for easy navigation up the JSON tree.

### Search
*   **Search Term Input:** Text field to enter search queries.
*   **Search By:**
    *   Keys: Search only within JSON keys.
    *   Values: Search only within JSON values.
    *   Both: Search within both keys and values.
*   **Search Options:**
    *   Case Sensitive: Perform a case-sensitive search.
    *   Regular Expressions (Regex): Use regular expressions for advanced search patterns.
*   **Clear Search:** Button to clear search results and term.
    *(Note: `viewer.html` includes a commented-out "Filter view to matches" which could be a potential future feature but isn't explicitly active based on the HTML provided).*

### AI-Powered Insights (via Gemini API)
*   **Summarize JSON:** Generate a concise summary of the entire JSON object/array.
*   **Natural Language Querying (NLQ):** Ask questions about the JSON data in plain English and receive AI-generated answers.
*   **Infer Schema:** Analyze the JSON structure and generate a schema that describes its fields and data types.
*   **Explain Selected Node:** Provide an AI-generated explanation for a currently selected JSON node or element.

### Customization & Settings
*   **Gemini API Key Management:** Input and store the user's Gemini API key.
*   **Gemini Model Selection:**
    *   Choose from a predefined list of Gemini models.
    *   Add and manage custom Gemini model names/IDs for users with access to specific or fine-tuned models.
*   **UI Settings:**
    *   Font Size: Adjust the font size for the JSON view.
    *   Indentation Width: Customize the indentation width (e.g., number of spaces or pixels) for the formatted JSON view.

### Other Features
*   **Load JSON from URL:** Fetch and display JSON data directly from a specified URL.
*   **Error Display:** Show informative error messages if JSON is invalid, a URL cannot be fetched, or an API call fails.
*   **View JSON from Active Tab:** (Inferred from `manifest.json` permissions and typical Chrome extension behavior for JSON viewers) - The extension likely automatically detects and allows viewing of JSON content encountered on the current web page or allows manual triggering on the active tab.

## Installation

Currently, JSON Lens AI is not yet available on the Chrome Web Store. To install it for development or personal use, you can load it as an unpacked extension:

1.  **Download the Source Code:** Clone or download the project repository from GitHub to your local machine.
2.  **Open Chrome Extensions Page:** Open Google Chrome, type `chrome://extensions` in the address bar, and press Enter.
3.  **Enable Developer Mode:** Ensure that "Developer mode" in the top right corner of the Extensions page is toggled on.
4.  **Load Unpacked:**
    *   Click the "Load unpacked" button that appears once Developer mode is enabled.
    *   In the file dialog, navigate to the directory where you cloned or downloaded the extension's source code.
    *   Select the root folder of the extension (the one containing `manifest.json`).
5.  **Done!** JSON Lens AI should now appear in your list of installed extensions, and you can access it via its icon in the Chrome toolbar.

## Usage

JSON Lens AI is designed to be intuitive. Here's a typical workflow:

1.  **Accessing the Viewer:**
    *   **Automatic Detection:** If you navigate to a webpage that serves raw JSON data, or open a `.json` file directly in Chrome, JSON Lens AI may automatically attempt to parse and display it (depending on final implementation and content script behavior).
    *   **Extension Icon:** Click on the JSON Lens AI icon in your Chrome toolbar. This will likely open a popup or a dedicated viewer page.
    *   **Pasting/Loading JSON:** If the viewer is open, you can often paste JSON directly or use the "Load JSON from URL" feature to fetch and display JSON from a specific web address.

2.  **Interacting with JSON:**
    *   Once JSON is loaded, you'll see it displayed in a formatted, interactive tree view.
    *   **View Options:** Toggle between raw and formatted views, or change themes.
    *   **Navigation:** Expand/collapse nodes, use JSONPath to jump to specific parts, or use breadcrumbs to navigate.
    *   **Search:** Utilize the search bar to find keys or values, with options for case sensitivity and regex.
    *   **AI Insights:** Access the AI features (Summarize, Natural Language Query, Infer Schema, Explain Node) to gain deeper understanding of your data. You'll need to configure your Gemini API key in the settings first.
    *   **Settings:** Customize the extension's behavior, API keys, AI models, and appearance through the settings panel.

## Contributing

We welcome contributions to make JSON Lens AI even better! Whether you're looking to fix a bug, propose a new feature, or improve existing functionality, your help is appreciated.

Here are a few ways you can contribute:

*   **Reporting Bugs:** If you encounter any issues or unexpected behavior, please open an issue on our GitHub repository. Provide as much detail as possible, including steps to reproduce, screenshots, and your environment (Chrome version, OS).
*   **Suggesting Enhancements:** Have an idea for a new feature or an improvement to an existing one? Feel free to open an issue to discuss it.
*   **Submitting Pull Requests:** If you'd like to contribute code:
    1.  Fork the repository.
    2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name` or `bugfix/your-bug-fix`).
    3.  Make your changes and commit them with clear, descriptive messages.
    4.  Push your changes to your fork (`git push origin feature/your-feature-name`).
    5.  Open a pull request against the main repository. Please provide a clear description of the changes you've made.

We aim to review and respond to issues and pull requests in a timely manner. Thank you for your interest in contributing to JSON Lens AI!
