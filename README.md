# FlowRead 📚⚡

**FlowRead** is a modern, customizable speed-reading web application designed to help you consume text faster and more efficiently. Whether you prefer the classic RSVP (Rapid Serial Visual Presentation) method or a more natural "Karaoke" style, FlowRead adapts to your reading comfort.

![FlowRead Screenshot](screenshot.png) *(Add a screenshot here)*

## 🚀 Features

*   **📄 Multi-Format Support**: Upload and read **.txt** and **.pdf** files instantly. (PDF parsing via `pdf.js`).
*   **📖 Dual Reading Modes**:
    *   **Scrolling (RSVP)**: Words stream one-by-one or in chunks, centered for minimal eye movement.
    *   **Static (Karaoke)**: Lines of text appear statically, with a guiding highlight moving across them—perfect for reducing motion sickness.
*   **🎨 Deep Customization**:
    *   **Highlight Styles**: Choose between **Focus** (dimmed surrounding text), **Highlight** (background color), or **Underline**.
    *   **Color Picker**: Pick *any* color for your active word highlight.
    *   **Background Themes**: Switch between **Dark**, **Light**, **Sepia**, and **Navy** modes to suit your environment.
*   **👁️ Focus Mode**: A dedicated distraction-free toggle that hides the sidebar and controls, leaving only the text.
*   **⚡ Control Your Pace**: Adjustable **WPM** (Words Per Minute) ranging from 100 to 1000 WPM.
*   **⏯️ Playback Controls**: Play, Pause, Restart, and scrub through the timeline.

## 🛠️ Built With

*   **HTML5 & CSS3** (Vanilla, no frameworks)
*   **JavaScript** (ES6+)
*   **PDF.js** (for PDF rendering)
*   *No build steps required—just open `index.html`!*

## 📦 Installation & Usage

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/flowread.git
    ```
2.  **Open the application**:
    Simply double-click `index.html` to open it in your browser. No server needed for local text files (though a local server is recommended for better CORS handling with some PDF features).

3.  **Start Reading**:
    *   Click **Open Book** to select a file.
    *   Adjust your **WPM** and **Mode**.
    *   Hit **Play** (or press `Spacebar`).

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for new themes, better PDF handling, or performance improvements.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
