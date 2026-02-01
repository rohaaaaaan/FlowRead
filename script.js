class SpeedReader {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.wpm = 300;
        this.timer = null;
        this.mode = 'scrolling'; // 'scrolling' | 'static'
        this.style = 'focus'; // 'focus' | 'highlight' | 'underline'

        // DOM Elements
        this.elements = {
            uploadBtn: document.getElementById('uploadBtn'),
            fileInput: document.getElementById('fileInput'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            restartBtn: document.getElementById('restartBtn'),
            speedRange: document.getElementById('speedRange'),
            progressRange: document.getElementById('progressRange'),
            wpmDisplay: document.getElementById('wpmDisplay'),
            progressDisplay: document.getElementById('progressDisplay'),
            scrollingLine: document.getElementById('scrollingLine'),
            readingDisplay: document.getElementById('readingDisplay'),
            bookPreview: document.getElementById('bookPreview'),
            playIcon: document.querySelector('.play-icon'),
            pauseIcon: document.querySelector('.pause-icon'),
            modeSelect: document.getElementById('readingModeSelect'),
            styleSelect: document.getElementById('highlightStyleSelect'),
            themeSelect: document.getElementById('themeSelect'),
            colorPicker: document.getElementById('highlightColorPicker'),
            focusModeBtn: document.getElementById('focusModeBtn'),
            menuBtn: document.getElementById('menuBtn'),
            sidebar: document.querySelector('.sidebar'),
            sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
        };

        this.initEventListeners();
    }

    initEventListeners() {
        this.elements.uploadBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        this.elements.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.elements.restartBtn.addEventListener('click', () => this.seekTo(0));

        this.elements.speedRange.addEventListener('input', (e) => this.updateSpeed(e.target.value));
        this.elements.progressRange.addEventListener('input', (e) => {
            const index = Math.floor((e.target.value / 100) * this.words.length);
            this.seekTo(index);
        });

        // Mode & Style Listeners
        if (this.elements.modeSelect) {
            this.elements.modeSelect.addEventListener('change', (e) => {
                this.mode = e.target.value;
                this.renderWordWindow();
            });
        }

        if (this.elements.styleSelect) {
            this.elements.styleSelect.addEventListener('change', (e) => {
                this.style = e.target.value;
                this.renderWordWindow();
            });
        }

        if (this.elements.themeSelect) {
            this.elements.themeSelect.addEventListener('change', (e) => {
                // Remove all theme classes
                document.body.classList.remove('theme-light', 'theme-sepia', 'theme-navy');
                // Add selected theme class (if not default/dark)
                if (e.target.value !== 'dark') {
                    document.body.classList.add(`theme-${e.target.value}`);
                }
            });
        }

        if (this.elements.colorPicker) {
            this.elements.colorPicker.addEventListener('input', (e) => {
                document.documentElement.style.setProperty('--highlight-color', e.target.value);
            });
        }

        if (this.elements.focusModeBtn) {
            this.elements.focusModeBtn.addEventListener('click', () => {
                document.body.classList.toggle('focus-mode');
            });
        }

        if (this.elements.menuBtn) {
            this.elements.menuBtn.addEventListener('click', () => {
                this.elements.sidebar.classList.add('open');
                if (this.elements.sidebarOverlay) this.elements.sidebarOverlay.classList.add('active');
            });
        }

        // Close Sidebar logic
        const closeSidebar = () => {
            this.elements.sidebar.classList.remove('open');
            if (this.elements.sidebarOverlay) this.elements.sidebarOverlay.classList.remove('active');
        };

        if (this.elements.sidebarCloseBtn) {
            this.elements.sidebarCloseBtn.addEventListener('click', closeSidebar);
        }

        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.addEventListener('click', closeSidebar);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
        });
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.pause(); // Stop current playback
        this.elements.bookPreview.innerHTML = '<p>Loading...</p>';

        try {
            let text = '';
            if (file.type === 'application/pdf') {
                text = await this.parsePdf(file);
            } else {
                text = await this.parseText(file);
            }

            this.processText(text);
            this.updateUIForNewBook(text);
        } catch (error) {
            console.error('Error reading file:', error);
            this.elements.bookPreview.innerHTML = '<p style="color:red">Error reading file.</p>';
        }
    }

    parseText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async parsePdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        // Simple page-by-page text extraction
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            fullText += strings.join(' ') + '\n\n';
        }
        return fullText;
    }

    processText(text) {
        // Simple regex to split by whitespace but keep punctuation attached to previous word if possible
        // Or just split by space for simplicity first
        this.words = text.split(/\s+/).filter(w => w.length > 0);
        this.currentIndex = 0;
        this.updateSpeed(this.wpm); // Reset timing calculation

        // Reset controls
        this.elements.progressRange.value = 0;
        this.renderWordWindow();
    }

    updateUIForNewBook(rawText) {
        // Populate sidebar preview (truncate if too huge to keep DOM light?)
        // Let's just put the first 10000 chars for now or structure it better
        this.elements.bookPreview.innerText = rawText;
    }

    renderWordWindow() {
        if (this.words.length === 0) return;

        // Apply current style class to container
        this.elements.readingDisplay.className = `reading-display mode-${this.mode} style-${this.style}`;

        if (this.mode === 'scrolling') {
            this.renderScrolling();
        } else {
            this.renderStatic();
        }
    }

    renderScrolling() {
        const windowSize = 5;
        const start = Math.max(0, this.currentIndex - 3);
        const end = Math.min(this.words.length, this.currentIndex + 4);

        const displayWords = this.words.slice(start, end);

        this.elements.scrollingLine.innerHTML = '';

        let activeEl = null;

        displayWords.forEach((wordText, i) => {
            const span = document.createElement('span');
            span.textContent = wordText;
            span.className = 'word';

            const actualIndex = start + i;
            if (actualIndex === this.currentIndex) {
                span.classList.add('active');
                activeEl = span;
            } else if (actualIndex < this.currentIndex) {
                span.classList.add('read');
            } else {
                span.classList.add('pending');
            }

            this.elements.scrollingLine.appendChild(span);
        });

        // Center the active element logic
        if (activeEl) {
            const containerCenter = this.elements.readingDisplay.offsetWidth / 2;
            const activeLeftRel = activeEl.offsetLeft;
            const activeWidth = activeEl.offsetWidth;
            const offset = containerCenter - (activeLeftRel + activeWidth / 2);
            this.elements.scrollingLine.style.transform = `translateX(${offset}px)`;
        } else {
            this.elements.scrollingLine.style.transform = `translateX(0px)`;
        }
    }

    renderStatic() {
        // Static Mode: Show X words at a time.
        // When currentIndex moves past the current "Page", we rebuild the page.

        const pageSize = 10; // Words per static line
        const pageStart = Math.floor(this.currentIndex / pageSize) * pageSize;
        const pageEnd = Math.min(this.words.length, pageStart + pageSize);

        this.elements.scrollingLine.innerHTML = '';
        // Reset transform from scrolling mode
        this.elements.scrollingLine.style.transform = 'none';

        for (let i = pageStart; i < pageEnd; i++) {
            const span = document.createElement('span');
            span.textContent = this.words[i];
            span.className = 'word';

            if (i === this.currentIndex) {
                span.classList.add('active');
            } else if (i < this.currentIndex) {
                span.classList.add('read');
            } else {
                span.classList.add('pending');
            }

            this.elements.scrollingLine.appendChild(span);
        }
    }

    togglePlay() {
        if (this.words.length === 0) return;

        this.isPlaying = !this.isPlaying;
        this.updatePlayIcon();

        if (this.isPlaying) {
            this.loop();
        } else {
            clearTimeout(this.timer);
        }
    }

    pause() {
        this.isPlaying = false;
        this.updatePlayIcon();
        clearTimeout(this.timer);
    }

    updatePlayIcon() {
        if (this.isPlaying) {
            this.elements.playIcon.style.display = 'none';
            this.elements.pauseIcon.style.display = 'block';
        } else {
            this.elements.playIcon.style.display = 'block';
            this.elements.pauseIcon.style.display = 'none';
        }
    }

    updateSpeed(newWpm) {
        this.wpm = parseInt(newWpm);
        this.elements.wpmDisplay.textContent = `${this.wpm} WPM`;
        this.elements.speedRange.value = this.wpm;
    }

    seekTo(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.words.length - 1));
        this.renderWordWindow();
        this.updateProgress();
    }

    updateProgress() {
        const percent = (this.currentIndex / this.words.length) * 100;
        this.elements.progressRange.value = percent;
        this.elements.progressDisplay.textContent = `${Math.floor(percent)}%`;
    }

    loop() {
        if (!this.isPlaying) return;

        // Calculate delay base on WPM
        // 60 seconds / WPM = seconds per word
        // * 1000 for ms
        const msPerWord = (60 / this.wpm) * 1000;

        this.renderWordWindow();
        this.updateProgress();

        this.currentIndex++;

        if (this.currentIndex >= this.words.length) {
            this.pause();
            return;
        }

        this.timer = setTimeout(() => {
            this.loop();
        }, msPerWord);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SpeedReader();
});
