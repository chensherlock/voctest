// DOM elements
const unitsContainer = document.getElementById('unitsContainer');
const unitDetail = document.getElementById('unitDetail');
const unitsList = document.getElementById('unitsList');
const unitTitle = document.getElementById('unitTitle');
const unitDescription = document.getElementById('unitDescription');
const wordList = document.getElementById('wordList');
const backToUnits = document.getElementById('backToUnits');
const practiceFlashcards = document.getElementById('practiceFlashcards');
const takeQuiz = document.getElementById('takeQuiz');
const notesToggle = document.getElementById('notesToggle');

// Current unit being viewed
let currentUnitId = null;
let activeExamplePlayback = null;
let activePhrasePlayback = null;
const translationProvider = typeof window !== 'undefined' && window.Translator
    ? window.Translator
    : (typeof navigator !== 'undefined' && navigator.translation
        ? navigator.translation
        : (typeof window !== 'undefined' ? window.translation : null));
const supportsTranslationApi = !!translationProvider;
const createTranslatorFn = translationProvider
    ? (typeof translationProvider.create === 'function'
        ? translationProvider.create.bind(translationProvider)
        : (typeof translationProvider.createTranslator === 'function'
            ? translationProvider.createTranslator.bind(translationProvider)
            : null))
    : null;
let writerPromise = null;
let writerSession = null;
let writerUnavailable = false;
let rewriterPromise = null;
let rewriterSession = null;
let rewriterUnavailable = false;
let translatorPromise = null;
const translationCache = new Map();
let htmlDecodeElement = null;
const translationOptions = {
    sourceLanguage: 'en',
    targetLanguage: 'zh-Hant'
};
const rewriterToneVariants = [
    {
        key: 'friendly',
        prompt: 'Use a friendly and encouraging tone that feels like a supportive teacher.'
    },
    {
        key: 'playful',
        prompt: 'Give the sentence a playful, imaginative tone while keeping it easy to understand.'
    },
    {
        key: 'motivational',
        prompt: 'Adopt a motivational tone that inspires the learner to keep practicing.'
    },
    {
        key: 'curious',
        prompt: 'Lean into a curious tone that invites the learner to explore the idea further.'
    },
    {
        key: 'calm',
        prompt: 'Keep the tone calm and reassuring, like a patient tutor guiding the learner.'
    }
];
let lastRewriterToneKey = null;
const NOTES_COOKIE_NAME = 'unitNotesVisible';
let notesVisible = false;

function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};${expires};path=/`;
}

function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
            try {
                return JSON.parse(decodeURIComponent(cookie.substring(nameEQ.length)));
            } catch (e) {
                return null;
            }
        }
    }
    return null;
}

function applyNotesVisibility() {
    if (!wordList) return;
    if (notesVisible) {
        wordList.classList.add('notes-visible');
    } else {
        wordList.classList.remove('notes-visible');
    }
}

function updateUnitDescription(unit) {
    if (!unitDescription) return;
    if (unit && unit.description) {
        unitDescription.textContent = unit.description;
        unitDescription.style.display = 'block';
    } else {
        unitDescription.textContent = '';
        unitDescription.style.display = 'none';
    }
}

function pickRandomRewriterTone() {
    if (!rewriterToneVariants.length) {
        return null;
    }

    let candidates = rewriterToneVariants;
    if (rewriterToneVariants.length > 1 && lastRewriterToneKey) {
        const filtered = rewriterToneVariants.filter(variant => variant.key !== lastRewriterToneKey);
        if (filtered.length > 0) {
            candidates = filtered;
        }
    }

    const selected = candidates[Math.floor(Math.random() * candidates.length)] || null;
    lastRewriterToneKey = selected ? selected.key : lastRewriterToneKey;
    return selected;
}

function getWriterEntryPoint() {
    if (typeof globalThis === 'undefined') {
        return null;
    }
    if (globalThis.Writer) {
        return globalThis.Writer;
    }
    if (globalThis.ai && globalThis.ai.writer) {
        return globalThis.ai.writer;
    }
    return null;
}

function isWriterSupported() {
    return !!getWriterEntryPoint();
}

function getRewriterEntryPoint() {
    // Check window.Rewriter or self.Rewriter (Chrome Built-in AI Rewriter API)
    if (typeof window !== 'undefined' && window.Rewriter) {
        return window.Rewriter;
    }
    if (typeof self !== 'undefined' && self.Rewriter) {
        return self.Rewriter;
    }
    if (typeof globalThis !== 'undefined' && globalThis.Rewriter) {
        return globalThis.Rewriter;
    }
    if (typeof globalThis !== 'undefined' && globalThis.ai && globalThis.ai.rewriter) {
        return globalThis.ai.rewriter;
    }
    return null;
}

function isRewriterSupported() {
    return !!getRewriterEntryPoint();
}

function getRewriterCreator() {
    const entryPoint = getRewriterEntryPoint();
    if (!entryPoint) {
        return null;
    }
    const createFn = entryPoint.create;
    if (typeof createFn === 'function') {
        return createFn.bind(entryPoint);
    }
    return null;
}

function getWriterCreator() {
    const entryPoint = getWriterEntryPoint();
    if (!entryPoint) {
        return null;
    }
    const createFn = entryPoint.create;
    if (typeof createFn === 'function') {
        return createFn.bind(entryPoint);
    }
    return null;
}

function isMobileDevice() {
    if (typeof navigator === 'undefined') {
        return false;
    }
    const mobilePattern = /Mobi|Android|iP(hone|ad|od)|IEMobile|Mobile|Opera Mini/i;
    return mobilePattern.test(navigator.userAgent || '');
}

function getWriterApiFlagInfo() {
    if (typeof navigator === 'undefined') {
        return null;
    }

    const userAgent = navigator.userAgent || '';
    if (isMobileDevice()) {
        return null;
    }
    const isEdge = /Edg\//.test(userAgent);
    const isChrome = !isEdge && /Chrome\//.test(userAgent);

    if (isEdge) {
        return {
            browser: 'edge',
            url: 'edge://flags/#edge-llm-writer-api-for-phi-mini',
            label: '啟用 Writer API'
        };
    }

    if (isChrome) {
        return {
            browser: 'chrome',
            url: 'chrome://flags/#writer-api-for-gemini-nano',
            label: '啟用 Writer API'
        };
    }

    return null;
}

function getRewriterApiFlagInfo() {
    if (typeof navigator === 'undefined') {
        return null;
    }

    const userAgent = navigator.userAgent || '';
    if (isMobileDevice()) {
        return null;
    }
    const isEdge = /Edg\//.test(userAgent);
    const isChrome = !isEdge && /Chrome\//.test(userAgent);

    if (isEdge) {
        return {
            browser: 'edge',
            url: 'edge://flags/#edge-llm-rewriter-api-for-phi-mini',
            label: '啟用 Rewriter API'
        };
    }

    if (isChrome) {
        return {
            browser: 'chrome',
            url: 'chrome://flags/#rewriter-api-for-gemini-nano',
            label: '啟用 Rewriter API'
        };
    }

    return null;
}

function updateWriterApiFlagButton() {
    const header = document.getElementById('unitHeader');
    if (!header) return;
    const unitHeading = header.querySelector('h2');
    if (!unitHeading) return;

    let flagButton = unitHeading.querySelector('.writer-api-flag-btn');

    if (isWriterSupported()) {
        if (flagButton) {
            flagButton.remove();
        }
        return;
    }

    const flagInfo = getWriterApiFlagInfo();
    if (!flagInfo) {
        if (flagButton) {
            flagButton.remove();
        }
        return;
    }

    if (!flagButton) {
        flagButton = document.createElement('button');
        flagButton.type = 'button';
        flagButton.className = 'writer-api-flag-btn';
        flagButton.innerHTML = '<i class="fas fa-flask"></i><span>啟用 Writer API</span>';
        unitHeading.appendChild(flagButton);
    }

    const labelSpan = flagButton.querySelector('span');
    if (labelSpan) {
        labelSpan.textContent = flagInfo.label;
    }

    const navigateToFlags = async (event) => {
        event.stopPropagation();
        event.preventDefault();
        const destination = flagInfo.url;
        let openedWindow = null;
        try {
            openedWindow = window.open(destination, '_blank', 'noopener');
        } catch (err) {
            openedWindow = null;
        }
        if (!openedWindow) {
            const fallbackMessage = `${flagInfo.label}：請在網址列輸入 ${destination}`;
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                try {
                    await navigator.clipboard.writeText(destination);
                    showAudioStatus(`${fallbackMessage}（網址已複製）`);
                    return;
                } catch (err) {
                    // Clipboard write failed; fall through to basic message
                }
            }
            showAudioStatus(fallbackMessage);
        }
    };

    flagButton.onclick = navigateToFlags;
    flagButton.dataset.flagUrl = flagInfo.url;
    if (flagInfo.browser) {
        flagButton.dataset.browser = flagInfo.browser;
    } else {
        delete flagButton.dataset.browser;
    }
    flagButton.setAttribute('aria-label', `${flagInfo.label}（開啟瀏覽器實驗功能）`);
    flagButton.title = `${flagInfo.label} - 開啟瀏覽器實驗功能`;
}

function updateRewriterApiFlagButton() {
    const header = document.getElementById('unitHeader');
    if (!header) return;
    const unitHeading = header.querySelector('h2');
    if (!unitHeading) return;

    let flagButton = unitHeading.querySelector('.rewriter-api-flag-btn');

    if (isRewriterSupported()) {
        if (flagButton) {
            flagButton.remove();
        }
        return;
    }

    const flagInfo = getRewriterApiFlagInfo();
    if (!flagInfo) {
        if (flagButton) {
            flagButton.remove();
        }
        return;
    }

    if (!flagButton) {
        flagButton = document.createElement('button');
        flagButton.type = 'button';
        flagButton.className = 'rewriter-api-flag-btn';
        flagButton.innerHTML = '<i class="fas fa-flask"></i><span>啟用 Rewriter API</span>';
        unitHeading.appendChild(flagButton);
    }

    const labelSpan = flagButton.querySelector('span');
    if (labelSpan) {
        labelSpan.textContent = flagInfo.label;
    }

    const navigateToFlags = async (event) => {
        event.stopPropagation();
        event.preventDefault();
        const destination = flagInfo.url;
        let openedWindow = null;
        try {
            openedWindow = window.open(destination, '_blank', 'noopener');
        } catch (err) {
            openedWindow = null;
        }
        if (!openedWindow) {
            const fallbackMessage = `${flagInfo.label}：請在網址列輸入 ${destination}`;
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                try {
                    await navigator.clipboard.writeText(destination);
                    showAudioStatus(`${fallbackMessage}（網址已複製）`);
                    return;
                } catch (err) {
                    // Clipboard write failed; fall through to basic message
                }
            }
            showAudioStatus(fallbackMessage);
        }
    };

    flagButton.onclick = navigateToFlags;
    flagButton.dataset.flagUrl = flagInfo.url;
    if (flagInfo.browser) {
        flagButton.dataset.browser = flagInfo.browser;
    } else {
        delete flagButton.dataset.browser;
    }
    flagButton.setAttribute('aria-label', `${flagInfo.label}（開啟瀏覽器實驗功能）`);
    flagButton.title = `${flagInfo.label} - 開啟瀏覽器實驗功能`;
}

function updateUnitWebButton(unit) {
    const header = document.getElementById('unitHeader');
    if (!header) return;
    const unitHeading = header.querySelector('h2');
    if (!unitHeading) return;

    let webButton = unitHeading.querySelector('.unit-web-btn');
    const webUrl = unit && unit.web ? unit.web.trim() : '';

    if (!webUrl) {
        if (webButton) {
            webButton.remove();
        }
        return;
    }

    if (!webButton) {
        webButton = document.createElement('button');
        webButton.type = 'button';
        webButton.className = 'unit-web-btn';
        webButton.innerHTML = '<i class="fas fa-link"></i>';
        unitHeading.appendChild(webButton);
    }

    webButton.dataset.webUrl = webUrl;
    webButton.setAttribute('aria-label', '開啟單元網頁');
    webButton.title = '開啟單元網頁';
    webButton.onclick = (event) => {
        event.stopPropagation();
        event.preventDefault();
        window.open(webUrl, '_blank', 'noopener');
    };
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Ensure units data is loaded first
    await loadUnitsIndex();

    // Check if a unit was specified in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const unitId = urlParams.get('unit');

    if (unitId) {
        await showUnitDetail(unitId);
    } else {
        displayAllUnits();
    }

    notesVisible = Boolean(getCookie(NOTES_COOKIE_NAME));
    if (notesToggle) {
        notesToggle.checked = notesVisible;
        notesToggle.addEventListener('change', () => {
            notesVisible = notesToggle.checked;
            setCookie(NOTES_COOKIE_NAME, notesVisible);
            applyNotesVisibility();
        });
    }
    applyNotesVisibility();

    // Set up event listeners
    if (backToUnits) {
        backToUnits.addEventListener('click', () => {
            showUnitsList();
            // Update URL without the unit parameter
            window.history.pushState({}, '', 'units.html');
        });
    }

    practiceFlashcards.addEventListener('click', () => {
        window.location.href = `flashcards.html?unit=${currentUnitId}`;
    });

    takeQuiz.addEventListener('click', () => {
        window.location.href = `quiz.html?unit=${currentUnitId}`;
    });

    // Add audio provider selector if available
    if (typeof cloudAudioService !== 'undefined') {
        createAudioProviderSelector();
        createSpeedControlSelector();
        createVoiceSelectorUI();
    }
});

// Create audio provider selector
function createAudioProviderSelector() {
    const headerEl = document.querySelector('#unitHeader');
    if (!headerEl || document.getElementById('audioProviderSelect')) return;

    const providerContainer = audioService.createProviderSelector({
        onChange: (provider) => {
            showAudioStatus(`已更改音訊提供者為 ${provider}`);
        }
    });

    headerEl.appendChild(providerContainer);
}

// Create pronunciation speed control
function createSpeedControlSelector() {
    const headerEl = document.querySelector('#unitHeader');
    if (!headerEl || document.getElementById('speedControl')) return;

    const speedContainer = audioService.createSpeedControl({
        onChange: (speed) => {
            showAudioStatus(`發音速度已設為 ${speed.toFixed(1)}x`);
        }
    });

    headerEl.appendChild(speedContainer);
}

// Create voice selector UI for speech synthesis
function createVoiceSelectorUI() {
    const headerEl = document.querySelector('#unitHeader');
    if (!headerEl || document.getElementById('voiceSelect')) return;

    const voiceSelectorContainer = audioService.createVoiceSelector({
        onChange: (voiceURI) => {
            const voiceName = audioService.voices.find(v => v.voiceURI === voiceURI)?.name || '預設';
            showAudioStatus(`已更改語音：${voiceName}`);
        }
    });

    voiceSelectorContainer.classList.add('form-group');
    headerEl.appendChild(voiceSelectorContainer);
}

// Speech synthesis voices can load asynchronously
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = function() {
        audioService.loadVoices();
        // Update the voice selector if it exists
        const voiceSelect = document.getElementById('voiceSelect');
        if (voiceSelect) {
            audioService.populateVoiceSelector(voiceSelect);
        }
    };
}

// Display status message
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildTokenMarkupWithHighlights(displayToken, highlightWords, baseClass) {
    if (!displayToken) return '';
    if (!highlightWords || highlightWords.size === 0) return escapeHtml(displayToken);

    const htmlSegments = [];
    const wordPartRegex = /[A-Za-z0-9']+/g;
    let lastIndex = 0;
    let match;

    while ((match = wordPartRegex.exec(displayToken)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        if (start > lastIndex) {
            htmlSegments.push(escapeHtml(displayToken.slice(lastIndex, start)));
        }

        const part = match[0];
        const normalized = normalizeWordForHighlight(part);
        if (normalized && highlightWords.has(normalized)) {
            htmlSegments.push(`<span class="${baseClass} highlight-word">${escapeHtml(part)}</span>`);
        } else {
            htmlSegments.push(escapeHtml(part));
        }

        lastIndex = end;
    }

    if (lastIndex < displayToken.length) {
        htmlSegments.push(escapeHtml(displayToken.slice(lastIndex)));
    }

    return htmlSegments.join('');
}

function scheduleTranslatorWarmup() {
    if (!supportsTranslationApi || translatorPromise) {
        return;
    }

    const warmup = async () => {
        if (typeof translationProvider.availability === 'function') {
            try {
                const availability = await translationProvider.availability(translationOptions);
                if (availability === 'downloadable' || availability === 'downloading') {
                    return;
                }
            } catch (err) {
                console.warn('Translator availability check failed:', err);
                return;
            }
        }
        await getExampleTranslator();
    };

    if (typeof window !== 'undefined') {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(() => {
                warmup();
            });
        } else {
            window.setTimeout(() => warmup(), 0);
        }
    } else {
        warmup();
    }
}

async function scheduleWriterWarmup() {
    if (!isWriterSupported() || writerPromise) {
        return;
    }

    const writerProvider = getWriterEntryPoint();
    if (!writerProvider) {
        return;
    }

    // Check availability first - don't try to create if it requires download
    // because that needs a user gesture
    if (typeof writerProvider.availability === 'function') {
        try {
            const availability = await writerProvider.availability();
            // Only warm up if the model is already available
            // Don't try to create when downloadable/downloading as it requires user gesture
            if (availability === 'readily' || availability === 'available' || availability === true) {
                const warmup = () => {
                    getWriter();
                };

                if (typeof window !== 'undefined') {
                    if (typeof window.requestIdleCallback === 'function') {
                        window.requestIdleCallback(() => warmup());
                    } else {
                        window.setTimeout(warmup, 0);
                    }
                } else {
                    warmup();
                }
            }
        } catch (err) {
            console.warn('Writer availability check failed during warmup:', err);
        }
    }
}

function createWriterDownloadUI() {
    // Remove any existing download UI
    const existing = document.getElementById('writerDownloadOverlay');
    if (existing) {
        existing.remove();
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'writerDownloadOverlay';
    overlay.className = 'writer-download-overlay';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'writer-download-modal';

    modal.innerHTML = `
        <div class="writer-download-header">
            <i class="fas fa-download writer-download-icon"></i>
            <h3 class="writer-download-title">下載 Writer 模型</h3>
        </div>
        <p class="writer-download-message">首次使用需要下載語言模型，請稍候片刻…</p>
        <div class="writer-download-progress-container">
            <div class="writer-download-progress-bar">
                <div class="writer-download-progress-fill" id="writerProgressFill" style="width: 0%"></div>
            </div>
            <div class="writer-download-stats">
                <span class="writer-download-percentage" id="writerProgressPercent">0.00%</span>
            </div>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    return {
        overlay,
        updateProgress: (loaded, total) => {
            const percent = total > 0 ? Math.min(100, ((loaded / total) * 100)) : 0;
            const fillElement = document.getElementById('writerProgressFill');
            const percentElement = document.getElementById('writerProgressPercent');

            if (fillElement) fillElement.style.width = `${percent.toFixed(2)}%`;
            if (percentElement) percentElement.textContent = `${percent.toFixed(2)}%`;
        },
        remove: () => {
            if (overlay && overlay.parentNode) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            }
        }
    };
}

function createWriterOptions() {
    if (typeof window === 'undefined') return {};

    let downloadUI = null;

    return {
        monitor: (writer) => {
            if (!writer || typeof writer.addEventListener !== 'function') return;

            writer.addEventListener('downloadprogress', (event) => {
                if (!event || typeof event.loaded !== 'number' || typeof event.total !== 'number' || event.total === 0) {
                    if (!downloadUI) {
                        downloadUI = createWriterDownloadUI();
                    }
                    return;
                }

                // Create UI if not exists
                if (!downloadUI) {
                    downloadUI = createWriterDownloadUI();
                }

                // Update progress
                downloadUI.updateProgress(event.loaded, event.total);

                // Remove UI when complete
                if (event.loaded >= event.total) {
                    setTimeout(() => {
                        if (downloadUI) {
                            downloadUI.remove();
                            downloadUI = null;
                        }
                    }, 1000);
                }
            });
        }
    };
}

async function getWriter() {
    if (!isWriterSupported()) {
        return null;
    }

    const writerProvider = getWriterEntryPoint();
    const createWriterFn = getWriterCreator();
    if (!writerProvider || !createWriterFn) {
        return null;
    }

    if (writerSession) {
        return writerSession;
    }

    if (writerUnavailable) {
        return null;
    }

    if (!writerPromise) {
        writerPromise = (async () => {
            try {
                if (typeof writerProvider.availability === 'function') {
                    const availability = await writerProvider.availability();
                    if (availability === false || availability === 'unavailable') {
                        writerUnavailable = true;
                        return null;
                    }
                    // Don't return null for 'downloadable' or 'downloading'
                    // Let the create() call handle the download automatically
                    if (availability === 'downloadable' || availability === 'downloading') {
                        showAudioStatus('Writer 模型下載中，請稍候…');
                    }
                }

                const sessionOptions = Object.assign(
                    {
                        tone: 'neutral',
                        format: 'plain-text',
                        length: 'short',
                        sharedContext: 'Generate clear, natural example sentences for English vocabulary learning.'
                    },
                    createWriterOptions()
                );
                const session = await createWriterFn(sessionOptions);
                const hasWrite = session && (typeof session.write === 'function' ||
                    typeof session.writeStreaming === 'function');
                if (!hasWrite) {
                    console.warn('Writer session missing write capabilities.');
                    return null;
                }
                writerSession = session;
                showAudioStatus('Writer 已就緒');
                return session;
            } catch (err) {
                console.error('Writer creation failed:', err);

                // If it's a NotAllowedError (user gesture required), reset promise
                // so next user click can retry
                if (err && err.name === 'NotAllowedError') {
                    writerPromise = null;
                    showAudioStatus('請再次點擊按鈕以下載模型');
                } else {
                    showAudioStatus('Writer 初始化失敗');
                }
                return null;
            }
        })();
    }

    const session = await writerPromise;
    if (!session) {
        if (!writerSession && !writerUnavailable) {
            writerPromise = null;
        }
        return null;
    }
    return session;
}

async function runWriterPrompt(session, promptText) {
    if (!session || !promptText) {
        return '';
    }

    const normalizeResponse = (response) => {
        if (!response) return '';
        if (typeof response === 'string') return response;
        if (typeof response.text === 'string') return response.text;
        if (typeof response.output === 'string') return response.output;
        if (typeof response.response === 'string') return response.response;
        if (Array.isArray(response)) return response.join('');
        return '';
    };

    if (typeof session.write === 'function') {
        try {
            const response = await session.write(promptText);
            const normalized = normalizeResponse(response);
            if (normalized) {
                return normalized;
            }
        } catch (err) {
            console.error('Writer write error:', err);
        }
    }

    if (typeof session.writeStreaming === 'function') {
        try {
            let combined = '';
            const stream = session.writeStreaming(promptText);
            // writeStreaming returns an async iterable of chunks
            for await (const chunk of stream) {
                const chunkText = normalizeResponse(chunk) || (typeof chunk === 'string' ? chunk : '');
                combined += chunkText;
            }
            if (combined.trim()) {
                return combined;
            }
        } catch (err) {
            console.error('Writer streaming error:', err);
        }
    }

    return '';
}

async function getRewriter() {
    if (!isRewriterSupported()) {
        return null;
    }

    const rewriterProvider = getRewriterEntryPoint();
    const createRewriterFn = getRewriterCreator();
    if (!rewriterProvider || !createRewriterFn) {
        return null;
    }

    if (rewriterSession) {
        return rewriterSession;
    }

    if (rewriterUnavailable) {
        return null;
    }

    if (!rewriterPromise) {
        rewriterPromise = (async () => {
            try {
                if (typeof rewriterProvider.availability === 'function') {
                    const availability = await rewriterProvider.availability();
                    if (availability === false || availability === 'unavailable') {
                        rewriterUnavailable = true;
                        return null;
                    }
                }

                const session = await createRewriterFn({
                    sharedContext: 'Rewrite English example sentences for vocabulary learning, keeping them clear and natural.'
                });
                const hasRewrite = session && (typeof session.rewrite === 'function' ||
                    typeof session.rewriteStreaming === 'function');
                if (!hasRewrite) {
                    console.warn('Rewriter session missing rewrite capabilities.');
                    return null;
                }
                rewriterSession = session;
                return session;
            } catch (err) {
                console.error('Rewriter creation failed:', err);
                if (err && err.name === 'NotAllowedError') {
                    rewriterPromise = null;
                }
                return null;
            }
        })();
    }

    const session = await rewriterPromise;
    if (!session) {
        if (!rewriterSession && !rewriterUnavailable) {
            rewriterPromise = null;
        }
        return null;
    }
    return session;
}

async function runRewrite(session, inputText, options = {}) {
    if (!session || !inputText) {
        return '';
    }

    const rewriteOptions = typeof options === 'string'
        ? { context: options }
        : (options && typeof options === 'object' ? Object.assign({}, options) : {});

    if (!rewriteOptions.context) {
        rewriteOptions.context = '';
    }

    const normalizeResponse = (response) => {
        if (!response) return '';
        if (typeof response === 'string') return response;
        if (typeof response.text === 'string') return response.text;
        if (typeof response.output === 'string') return response.output;
        if (typeof response.response === 'string') return response.response;
        if (Array.isArray(response)) return response.join('');
        return '';
    };

    if (typeof session.rewrite === 'function') {
        try {
            const response = await session.rewrite(inputText, rewriteOptions);
            const normalized = normalizeResponse(response);
            if (normalized) {
                return normalized;
            }
        } catch (err) {
            console.error('Rewriter rewrite error:', err);
        }
    }

    if (typeof session.rewriteStreaming === 'function') {
        try {
            let combined = '';
            const stream = session.rewriteStreaming(inputText, rewriteOptions);
            for await (const chunk of stream) {
                const chunkText = normalizeResponse(chunk) || (typeof chunk === 'string' ? chunk : '');
                combined += chunkText;
            }
            if (combined.trim()) {
                return combined;
            }
        } catch (err) {
            console.error('Rewriter streaming error:', err);
        }
    }

    return '';
}

function ensureExamplesContainer(wordItem) {
    if (!wordItem) return null;
    let container = wordItem.querySelector('.examples');
    if (!container) {
        const wordMain = wordItem.querySelector('.word-main');
        container = document.createElement('div');
        container.className = 'examples';
        if (wordMain) {
            wordMain.appendChild(container);
        }
    }
    return container;
}

function attachExampleLineHandlers(exampleLine) {
    if (!exampleLine) return;
    const audioBtn = exampleLine.querySelector('.example-audio-btn');
    if (audioBtn) {
        audioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sentence = decodeHtmlEntities(audioBtn.dataset.sentence || '');
            playExampleSentence(sentence, audioBtn);
        });
    }

    if (supportsTranslationApi) {
        const translateBtn = exampleLine.querySelector('.example-translate-btn');
        if (translateBtn) {
            translateBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const sentence = decodeHtmlEntities(translateBtn.dataset.sentence || '');
                await translateExampleSentence(sentence, translateBtn);
            });
        }
    }

    if (isRewriterSupported()) {
        const rewriteBtn = exampleLine.querySelector('.example-rewrite-btn');
        if (rewriteBtn) {
            rewriteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const sentence = decodeHtmlEntities(rewriteBtn.dataset.sentence || '');
                const englishWord = rewriteBtn.dataset.word || '';
                await rewriteExampleSentence(sentence, englishWord, rewriteBtn);
            });
        }
    }
}

function highlightWordInSentence(word, sentence) {
    if (!word || !sentence) return sentence;
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i');
    if (regex.test(sentence)) {
        return sentence.replace(regex, (match) => `[${match}]`);
    }
    return sentence;
}

function appendGeneratedExampleLine(wordItem, englishWord, sentence) {
    const examplesContainer = ensureExamplesContainer(wordItem);
    if (!examplesContainer) return;

    const highlightedSentence = highlightWordInSentence(englishWord, sentence);
    const { html: exampleMarkup, cleanSentence } = buildExampleMarkup(highlightedSentence);
    const encodedSentence = escapeHtml(cleanSentence);
    const encodedWord = escapeHtml(englishWord);

    const translateButtonHTML = supportsTranslationApi ? `
        <button class="example-translate-btn" data-sentence="${encodedSentence}" aria-label="翻譯成繁體中文" title="翻譯成繁體中文">
            <i class="fas fa-language"></i>
        </button>` : '';
    const rewriteButtonHTML = isRewriterSupported() ? `
        <button class="example-rewrite-btn" data-sentence="${encodedSentence}" data-word="${encodedWord}" aria-label="重寫例句" title="重寫例句">
            <i class="fas fa-sync-alt"></i>
        </button>` : '';
    const translationOutputHTML = supportsTranslationApi ? '<div class="example-translation" aria-live="polite"></div>' : '';

    const lineMarkup = `<span class="example-text" data-sentence="${encodedSentence}">${exampleMarkup}</span>
        <div class="example-action-buttons">
            <button class="example-audio-btn" data-sentence="${encodedSentence}" aria-label="Play example sentence">
                <i class="fas fa-volume-up"></i>
            </button>
            ${translateButtonHTML}
            ${rewriteButtonHTML}
        </div>
        ${translationOutputHTML}`;

    const exampleLine = document.createElement('div');
    exampleLine.className = 'example-line generated-example';
    exampleLine.dataset.sentence = encodedSentence;
    exampleLine.innerHTML = lineMarkup;
    examplesContainer.appendChild(exampleLine);

    attachExampleLineHandlers(exampleLine);
}

async function generateExampleForWord(englishWord, wordItem, button) {
    if (!englishWord || !wordItem || !button) return;

    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    button.classList.add('loading');

    const restoreButton = () => {
        button.innerHTML = originalIcon;
        button.disabled = false;
        button.classList.remove('loading');
    };

    try {
        // Check availability before attempting to get writer
        const writerProvider = getWriterEntryPoint();
        if (writerProvider && typeof writerProvider.availability === 'function') {
            const availability = await writerProvider.availability();
            if (availability === 'downloadable') {
                showAudioStatus('首次使用需要下載模型，請稍候…');
            } else if (availability === 'downloading') {
                showAudioStatus('模型下載中，請稍候…');
            }
        }

        const writer = await getWriter();
        if (!writer) {
            showAudioStatus('無法使用例句生成功能');
            return;
        }

        const normalizeSentence = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (!Array.isArray(wordItem._generatedExamples)) {
            wordItem._generatedExamples = [];
        }
        const previousExamples = wordItem._generatedExamples;
        const existingNormalized = new Set(previousExamples.map(example => example.normalized));
        const lastExample = previousExamples.length > 0 ? previousExamples[previousExamples.length - 1].sentence : '';

        var basePrompt = `Write a single example sentence using the word "${englishWord}".`;
        basePrompt += `Use basic grammar and vocabulary suitable for students aged 12–15.`;
        //basePrompt += `The sentence should be short (under 15 words).`;
        basePrompt += `Do not include explanations or translations—just the sentence itself.`;
        let attempt = 0;
        let sentence = '';

        while (attempt < 3 && !sentence) {
            let prompt = basePrompt;

            const candidateRaw = await runWriterPrompt(writer, prompt);
            const candidate = cleanGeneratedSentence(candidateRaw).trim();
            if (!candidate) {
                attempt += 1;
                continue;
            }

            const candidateNormalized = normalizeSentence(candidate);

            if (existingNormalized.has(candidateNormalized)) {
                attempt += 1;
                continue;
            }

            if (!isValidGeneratedSentence(candidate, englishWord)) {
                attempt += 1;
                continue;
            }

            sentence = candidate;
        }

        if (!sentence) {
            sentence = buildFallbackExampleSentence(englishWord);
            if (!sentence) {
                showAudioStatus('無法產生例句');
                return;
            }
            const fallbackNormalized = normalizeSentence(sentence);
            if (existingNormalized.has(fallbackNormalized)) {
                showAudioStatus('無法產生例句');
                return;
            }
        }

        previousExamples.push({
            sentence,
            normalized: normalizeSentence(sentence)
        });
        appendGeneratedExampleLine(wordItem, englishWord, sentence);
        showAudioStatus('已新增例句');
    } catch (error) {
        console.error('Example generation error:', error);
        showAudioStatus('無法產生例句');
    } finally {
        restoreButton();
    }
}

function showAudioStatus(message) {
    // Create status element if it doesn't exist
    let statusEl = document.querySelector('.audio-status');
    
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.className = 'audio-status';
        document.body.appendChild(statusEl);
    }
    
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    // Hide after 2 seconds
    setTimeout(() => {
        statusEl.style.opacity = '0';
        setTimeout(() => {
            statusEl.style.display = 'none';
            statusEl.style.opacity = '1';
        }, 500);
    }, 2000);
}

// Utility helpers for example sentence rendering and highlighting
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeWordForHighlight(word) {
    return word.replace(/[^\w'-]/g, '').toLowerCase();
}

function cleanGeneratedSentence(sentence) {
    if (!sentence) return '';
    let text = sentence.trim();
    if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
        text = text.slice(1, -1).trim();
    }
    return text;
}

function isValidGeneratedSentence(sentence, englishWord) {
    if (!sentence) return false;
    const trimmed = sentence.trim();
    if (!trimmed) return false;
    if (trimmed.length > 200) return false;
    if (/\n/.test(trimmed)) return false;
    if (/[`*•\[\]\{\}]/.test(trimmed)) return false;
    const lowered = trimmed.toLowerCase();
    if (/(okay|i understand|tell me|please tell me|let me know|example sentences|topic:|what topic)/.test(lowered)) {
        return false;
    }
    const endings = trimmed.match(/[.!?]/g) || [];
    if (endings.length > 1) return false;
    const wordRegex = new RegExp(`\\b${escapeRegExp(englishWord)}\\b`, 'i');
    if (!wordRegex.test(trimmed)) return false;
    return true;
}

function buildFallbackExampleSentence(englishWord) {
    const trimmedWord = (englishWord || '').trim();
    if (!trimmedWord) return '';

    const lower = trimmedWord.toLowerCase();
    const capitalized = trimmedWord.charAt(0).toUpperCase() + trimmedWord.slice(1);

    if (/\s/.test(trimmedWord)) {
        return `The phrase ${trimmedWord} is useful in everyday conversations.`;
    }
    if (/ing$/.test(lower)) {
        return `${capitalized} keeps everyone motivated during practice.`;
    }
    if (/ed$/.test(lower)) {
        return `We ${lower} together yesterday afternoon.`;
    }
    if (/ly$/.test(lower)) {
        return `She spoke ${lower} during the presentation.`;
    }
    if (/tion$/.test(lower) || /sion$/.test(lower)) {
        return `The ${lower} will begin after lunch.`;
    }
    if (/ness$/.test(lower) || /ment$/.test(lower)) {
        return `Her ${lower} inspired everyone in the room.`;
    }
    if (/ous$/.test(lower) || /ful$/.test(lower) || /ive$/.test(lower) || /less$/.test(lower)) {
        return `It was a ${lower} experience for the whole class.`;
    }

    const article = /^[aeiou]/i.test(trimmedWord) ? 'an' : 'a';
    return `Learning ${article} ${trimmedWord} helps me grow my vocabulary.`;
}

function decodeHtmlEntities(str) {
    if (!str) return '';
    if (!htmlDecodeElement && typeof document !== 'undefined') {
        htmlDecodeElement = document.createElement('textarea');
    }
    if (!htmlDecodeElement) return str;
    htmlDecodeElement.innerHTML = str;
    return htmlDecodeElement.value;
}

/**
 * Detect if text is primarily in English
 * @param {string} text - The text to check
 * @returns {boolean} - True if text is primarily English
 */
function isEnglishText(text) {
    if (!text || text.trim().length === 0) return false;
    
    // Count English characters (letters, numbers, common punctuation, spaces)
    const englishCharCount = (text.match(/[a-zA-Z0-9\s\-'.,:;!?]/g) || []).length;
    const totalCharCount = text.trim().length;
    
    // If more than 70% of characters are English, consider it English
    return (englishCharCount / totalCharCount) > 0.7;
}

/**
 * Escape special regex characters in a string
 * @param {string} str - The string to escape
 * @returns {string} - The escaped string safe for use in RegExp
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildExampleMarkup(exampleSentence) {
    const highlightMatches = [...exampleSentence.matchAll(/\[([^\]]+)\]/g)];
    const highlightWords = new Set();

    highlightMatches.forEach(match => {
        match[1]
            .split(/\s+/)
            .map(part => normalizeWordForHighlight(part))
            .filter(Boolean)
            .forEach(normalized => highlightWords.add(normalized));
    });

    const cleanSentence = exampleSentence.replace(/\[([^\]]+)\]/g, '$1');
    const htmlSegments = [];
    const wordRegex = /\S+/g;

    let lastIndex = 0;
    let wordIndex = 0;
    let match;

    while ((match = wordRegex.exec(cleanSentence)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        if (start > lastIndex) {
            const spacer = cleanSentence.slice(lastIndex, start);
            htmlSegments.push(escapeHtml(spacer));
        }

        const displayWord = match[0];
        const normalizedWord = normalizeWordForHighlight(displayWord);
        const classes = ['example-word'];

        if (highlightWords.has(normalizedWord)) {
            classes.push('highlight-word');
        }

        htmlSegments.push(
            `<span class="${classes.join(' ')}" data-word-index="${wordIndex}" data-start="${start}" data-end="${end}">${buildTokenMarkupWithHighlights(displayWord, highlightWords, 'example-word')}</span>`
        );

        wordIndex += 1;
        lastIndex = end;
    }

    if (lastIndex < cleanSentence.length) {
        htmlSegments.push(escapeHtml(cleanSentence.slice(lastIndex)));
    }

    return {
        html: htmlSegments.join(''),
        cleanSentence
    };
}

/**
 * Build phrase markup with bracket highlighting support
 * Similar to buildExampleMarkup but for phrases
 * Also automatically marks the vocabulary word if provided
 * @param {string} phraseText - The phrase text with optional [brackets]
 * @param {string} vocabularyWord - The main vocabulary word to mark (optional)
 * @returns {Object} - { html: markup with spans, cleanPhrase: text without brackets }
 */
function buildPhraseMarkup(phraseText, vocabularyWord) {
    // First, add brackets around vocabulary word if it appears unbracketed
    let phraseWithBrackets = phraseText;
    if (vocabularyWord) {
        // Build a set of words to highlight (including vocabulary word)
        const wordsToHighlight = new Set();
        // Normalize vocabulary word for comparison
        wordsToHighlight.add(normalizeWordForHighlight(vocabularyWord));
        
        // Check if vocabulary word is already bracketed in the phrase
        const bracketsRegex = /\[([^\]]+)\]/g;
        let hasBracketed = false;
        let match;
        while ((match = bracketsRegex.exec(phraseText)) !== null) {
            const bracketed = match[1];
            if (normalizeWordForHighlight(bracketed) === normalizeWordForHighlight(vocabularyWord)) {
                hasBracketed = true;
                break;
            }
        }
        
        // If vocabulary word is not bracketed, find and bracket it
        if (!hasBracketed && vocabularyWord) {
            const vocabRegex = new RegExp(`\\b${escapeRegExp(vocabularyWord)}\\b`, 'gi');
            phraseWithBrackets = phraseText.replace(vocabRegex, (match) => {
                // Make sure it's not already in brackets by checking the bracket regex
                const alreadyBracketed = /\[[^\]]*\b\w+\b[^\]]*\]/.test(phraseWithBrackets);
                if (!alreadyBracketed) {
                    return `[${match}]`;
                }
                return match;
            });
        }
    }
    
    // Parse all bracketed words
    const highlightMatches = [...phraseWithBrackets.matchAll(/\[([^\]]+)\]/g)];
    const highlightWords = new Set();

    highlightMatches.forEach(match => {
        match[1]
            .split(/\s+/)
            .map(part => normalizeWordForHighlight(part))
            .filter(Boolean)
            .forEach(normalized => highlightWords.add(normalized));
    });

    const cleanPhrase = phraseWithBrackets.replace(/\[([^\]]+)\]/g, '$1');
    const htmlSegments = [];
    const wordRegex = /\S+/g;

    let lastIndex = 0;
    let wordIndex = 0;
    let match;

    while ((match = wordRegex.exec(cleanPhrase)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        if (start > lastIndex) {
            const spacer = cleanPhrase.slice(lastIndex, start);
            htmlSegments.push(escapeHtml(spacer));
        }

        const displayWord = match[0];
        const normalizedWord = normalizeWordForHighlight(displayWord);
        const classes = ['phrase-word'];

        if (highlightWords.has(normalizedWord)) {
            classes.push('highlight-word');
        }

        htmlSegments.push(
            `<span class="${classes.join(' ')}" data-word-index="${wordIndex}" data-start="${start}" data-end="${end}">${buildTokenMarkupWithHighlights(displayWord, highlightWords, 'phrase-word')}</span>`
        );

        wordIndex += 1;
        lastIndex = end;
    }

    if (lastIndex < cleanPhrase.length) {
        htmlSegments.push(escapeHtml(cleanPhrase.slice(lastIndex)));
    }

    return {
        html: htmlSegments.join(''),
        cleanPhrase
    };
}

function buildSynLabelEntry(type, data) {
    if (!data) {
        return '';
    }

    const values = Array.isArray(data) ? data : [data];
    const cleanedValues = values
        .map(value => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean);

    if (!cleanedValues.length) {
        return '';
    }

    const labelClass = type === 'syn' ? 'syn-label' : 'ant-label';
    const labelText = type === 'syn' ? 'SYN' : 'ANT';
    const formattedValues = cleanedValues.map(value => escapeHtml(value)).join(' / ');

    return `<div class="word-synonym-item"><span class="${labelClass}">${labelText}</span><span class="label-value">${formattedValues}</span></div>`;
}

function buildSynAntSection(word) {
    const entries = [];
    const synEntry = buildSynLabelEntry('syn', word.syn);
    if (synEntry) {
        entries.push(synEntry);
    }
    const antEntry = buildSynLabelEntry('ant', word.ant);
    if (antEntry) {
        entries.push(antEntry);
    }
    if (!entries.length) {
        return '';
    }
    return `<div class="word-synonyms">${entries.join('')}</div>`;
}

function buildNotesSection(word) {
    if (!word.notes) {
        return '';
    }

    const notes = Array.isArray(word.notes) ? word.notes : [word.notes];
    const cleanedNotes = notes
        .map(note => (typeof note === 'string' ? note.trim() : ''))
        .filter(Boolean);

    if (!cleanedNotes.length) {
        return '';
    }

    const noteItems = cleanedNotes.map(note => `<li>${escapeHtml(note)}</li>`).join('');
    return `<div class="word-notes"><span class="notes-label">筆記</span><ul>${noteItems}</ul></div>`;
}

// Display all available units
async function displayAllUnits() {
    unitsContainer.innerHTML = '';
    try {
        // Ensure units index is loaded
        await preloadAllUnits();
        const units = getAllUnits();

        // Sort units: default units first, then others
        units.sort((a, b) => {
            if (a.default && !b.default) return -1;
            if (!a.default && b.default) return 1;
            return 0;
        });

        units.forEach(unit => {
            const hasWords = unit.words && unit.words.length > 0;
            const hasVideo = unit.video && unit.video.trim() !== '';
            const hasWeb = unit.web && unit.web.trim() !== '';

            const unitCard = document.createElement('div');
            unitCard.className = `unit-card ${unit.default ? 'default-unit' : ''} ${!hasWords ? 'disabled' : ''}`;

            // Create video button HTML if available
            const videoButtonHTML = hasVideo ?
                `<button class="btn-small btn-video" data-video-url="${unit.video}" title="觀看單元影片"><i class="fas fa-video"></i></button>`
                : '';
            const webButtonHTML = hasWeb ?
                `<button class="btn-small btn-web" data-web-url="${unit.web}" aria-label="開啟單元網頁" title="開啟單元網頁"><i class="fas fa-link"></i></button>`
                : '';
            const unitButtonsHTML = `${videoButtonHTML}${webButtonHTML}`;

            unitCard.innerHTML = `
                <div class="unit-card-header">
                    <h3>${unit.title} <span class="word-count">(${unit.words.length} 個詞彙)</span> ${unitButtonsHTML}</h3>
                </div>
            `;

            // Make the entire card clickable for units with words
            if (hasWords) {
                unitCard.style.cursor = 'pointer';
                unitCard.addEventListener('click', (e) => {
                    // Don't navigate if clicking on video button
                    if (e.target.closest('.btn-video') || e.target.closest('.btn-web')) {
                        return;
                    }
                    e.preventDefault();
                    showUnitDetail(unit.id);
                    // Update URL with unit parameter
                    window.history.pushState({}, '', `units.html?unit=${unit.id}`);
                });
            } else {
                unitCard.style.cursor = 'not-allowed';
            }

            // Add video button event listener
            if (hasVideo) {
                const videoBtn = unitCard.querySelector('.btn-video');
                videoBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering card click
                    const videoUrl = videoBtn.dataset.videoUrl;
                    window.open(videoUrl, '_blank');
                });
            }

            if (hasWeb) {
                const webBtn = unitCard.querySelector('.btn-web');
                webBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const webUrl = webBtn.dataset.webUrl;
                    window.open(webUrl, '_blank', 'noopener');
                });
            }

            unitsContainer.appendChild(unitCard);
        });
    } catch (error) {
        console.error('Error displaying units:', error);
        unitsContainer.innerHTML = '<p>無法載入單元資料，請稍後再試。</p>';
    }
}

// Show details for a specific unit
async function showUnitDetail(unitId) {
    currentUnitId = unitId;
    const unit = getUnitById(unitId);

    if (unit) {
        // Ensure unit words are loaded
        await getWordsFromUnit(unitId);

        // Update UI with unit details
        if (unitTitle) {
            unitTitle.textContent = unit.title || `單元 ${unit.id}`;
        }
        updateUnitDescription(unit);
        updateUnitWebButton(unit);
        updateWriterApiFlagButton();
        updateRewriterApiFlagButton();
        displayUnitWords(unit);

        // Show unit detail section, hide units list
        unitsList.style.display = 'none';
        unitDetail.style.display = 'block';
    } else {
        // Handle case where unit doesn't exist
        alert('Unit not found!');
        showUnitsList();
    }
}

// Display the words in a unit
function displayUnitWords(unit) {
    wordList.innerHTML = '';
    
    unit.words.forEach((word, index) => {
        const wordProgress = userProgress.getWordProgress(`${unit.id}-${word.english}`);
        const masteredClass = wordProgress.mastered ? 'mastered' : '';
        const wordNumber = index + 1; // Create sequential numbering starting from 1
        
        const wordItem = document.createElement('div');
        wordItem.className = `word-item ${masteredClass}`;

        // Get Chinese translations as array for multi-line display
        const chineseTranslations = getChineseTranslations(word);

        // Grammar term Chinese translations
        const grammarTooltips = {
            'n.': '名詞',
            'adj.': '形容詞',
            'adv.': '副詞',
            'vt.': '及物動詞',
            'vi.': '不及物動詞',
            'v.': '動詞',
            'prep.': '介系詞',
            'conj.': '連接詞',
            'pron.': '代名詞',
            'det.': '限定詞',
            'interj.': '感嘆詞',
            '[c]': '可數名詞',
            '[u]': '不可數名詞',
            '[s]': '單數名詞',
            '[p]': '複數名詞',
            '[sing.]': '單數名詞',
            '[pl.]': '複數名詞'
        };

        // Extract grammatical information (part of speech and countability markers)
        const grammarInfo = [];
        const seenGrammar = new Set(); // Track unique grammar badges to avoid duplicates

        chineseTranslations.forEach(translation => {
            // Match all grammar patterns in the beginning of the translation
            // This will capture patterns like "vt. vi." or "n. [C] [U]"
            const grammarMatch = translation.match(/^([^,，]+?)(?=[\s,，][\u4e00-\u9fff]|$)/);
            if (grammarMatch) {
                const grammarText = grammarMatch[1].trim();

                // Split grammar text into individual parts and create tooltips
                const parts = grammarText.match(/vt\.|vi\.|v\.|n\.|adj\.|adv\.|prep\.|conj\.|pron\.|det\.|interj\.|\[C\]|\[U\]|\[S\]|\[P\]|\[Sing\.\]|\[pl\.\]/gi);
                if (parts) {
                    parts.forEach(part => {
                        const normalizedPart = part.toLowerCase();
                        const key = normalizedPart;

                        // Only add if we haven't seen this grammar badge yet
                        if (!seenGrammar.has(key)) {
                            seenGrammar.add(key);
                            const tooltip = grammarTooltips[normalizedPart] || part;
                            grammarInfo.push({
                                grammar: part,
                                tooltip: tooltip
                            });
                        }
                    });
                }
            }
        });

        // Create grammar badges HTML with tooltips
        const grammarBadgesHTML = grammarInfo.length > 0 ?
            `<div class="grammar-badges">${grammarInfo.map(info =>
                `<span class="grammar-badge" data-tooltip="${info.tooltip}">${info.grammar}</span>`
            ).join('')}</div>` : '';

        const chineseHTML = chineseTranslations.map(translation =>
            `<div class="chinese-line">${translation}</div>`
        ).join('');
        const synonymsSectionHTML = buildSynAntSection(word);
        const notesSectionHTML = buildNotesSection(word);

        // Check if word has example(s)
        const hasExample = word.example && (
            (Array.isArray(word.example) && word.example.length > 0 && word.example.some(ex => ex.trim() !== '')) ||
            (!Array.isArray(word.example) && word.example.trim() !== '')
        );

        // Format examples for display
        let examplesHTML = '';
        if (hasExample) {
            const examples = Array.isArray(word.example) ? word.example : [word.example];
            examplesHTML = examples
                .filter(ex => ex && ex.trim() !== '')
                .map((example) => {
                    const { html: exampleMarkup, cleanSentence } = buildExampleMarkup(example);
                    const encodedSentence = escapeHtml(cleanSentence);
                    const encodedWord = escapeHtml(word.english);
                    
                    // Check if example is in English
                    const isEnglish = isEnglishText(cleanSentence);
                    
                    // Only show buttons if example is in English
                    const translateButtonHTML = (supportsTranslationApi && isEnglish) ? `
                        <button class="example-translate-btn" data-sentence="${encodedSentence}" aria-label="翻譯成繁體中文" title="翻譯成繁體中文">
                            <i class="fas fa-language"></i>
                        </button>` : '';
                    const rewriteButtonHTML = (isRewriterSupported() && isEnglish) ? `
                        <button class="example-rewrite-btn" data-sentence="${encodedSentence}" data-word="${encodedWord}" aria-label="重寫例句" title="重寫例句">
                            <i class="fas fa-sync-alt"></i>
                        </button>` : '';
                    const audioButtonHTML = isEnglish ? `
                        <button class="example-audio-btn" data-sentence="${encodedSentence}" aria-label="Play example sentence">
                            <i class="fas fa-volume-up"></i>
                        </button>` : '';
                    const translationOutputHTML = (supportsTranslationApi && isEnglish) ? `<div class="example-translation" aria-live="polite"></div>` : '';

                    return `<div class="example-line" data-sentence="${encodedSentence}">
                        <span class="example-text" data-sentence="${encodedSentence}">${exampleMarkup}</span>
                        <div class="example-action-buttons">
                            ${audioButtonHTML}
                            ${translateButtonHTML}
                            ${rewriteButtonHTML}
                        </div>
                        ${translationOutputHTML}
                    </div>`;
                })
                .join('');
        }

        const writerAvailable = isWriterSupported();

        // Check if word has video URL
        const hasVideo = word.video && word.video.trim() !== '';
        const exampleGeneratorButtonHTML = writerAvailable ?
            `<button class="generate-example-btn" data-word="${escapeHtml(word.english)}" aria-label="產生新的例句" title="產生新的例句">
                <i class="fas fa-magic"></i>
            </button>` : '';
        const videoButton = hasVideo ?
            `<button class="video-btn" data-video-url="${word.video}" aria-label="Watch video">
                <i class="fas fa-video"></i>
            </button>` : '';
        const examplesWrapperHTML = (hasExample || writerAvailable) ? `<div class="examples">${examplesHTML}</div>` : '';

        // Format pronunciation if available
        const pronunciationHTML = word.pronunciation ? `
            <div class="word-pronunciation">
                <span class="pronunciation-label">發音：</span>
                <span class="pronunciation-value">${Array.isArray(word.pronunciation) ? word.pronunciation.map(p => escapeHtml(p)).join(' / ') : escapeHtml(word.pronunciation)}</span>
                <button class="pronunciation-audio-btn" data-word="${escapeHtml(word.english)}" aria-label="Play pronunciation" title="播放發音">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>` : '';

        // Format phrases if available
        const phrasesHTML = word.phrases && Array.isArray(word.phrases) && word.phrases.length > 0 ? `
            <div class="word-phrases">
                <span class="phrases-label">搭：</span>
                <ul class="phrases-list">
                    ${word.phrases.map(phrase => {
                        // Handle both old string format and new object format
                        if (typeof phrase === 'object' && phrase.english) {
                            // New format: {english, chinese}
                            // Pass the vocabulary word to auto-mark it in the phrase
                            const { html: phraseMarkup, cleanPhrase } = buildPhraseMarkup(phrase.english, word.english);
                            const encodedPhrase = escapeHtml(cleanPhrase);
                            const chinesePhrase = phrase.chinese ? ` ${escapeHtml(phrase.chinese)}` : '';
                            return `<li><strong>${phraseMarkup}</strong>${chinesePhrase} <button class="phrase-audio-btn" data-phrase="${encodedPhrase}" aria-label="Play phrase" title="播放搭配">
                                <i class="fas fa-volume-up"></i>
                            </button></li>`;
                        } else {
                            // Old format: string
                            const { html: phraseMarkup, cleanPhrase } = buildPhraseMarkup(phrase);
                            return `<li>${phraseMarkup}</li>`;
                        }
                    }).join('')}
                </ul>
            </div>` : '';

        // Format related words if available
        const relatedHTML = word.related && Array.isArray(word.related) && word.related.length > 0 ? `
            <div class="word-related">
                <span class="related-label">相關：</span>
                <ul class="related-list">
                    ${word.related.map(related => {
                        // Handle both old string format and new object format
                        if (typeof related === 'object' && related.english) {
                            // New format: {english, pronunciation, chinese}
                            const englishWord = related.english;
                            const pronunciation = related.pronunciation ? ` ${escapeHtml(related.pronunciation)}` : '';
                            const chineseText = Array.isArray(related.chinese) ? ` ${escapeHtml(related.chinese.join('; '))}` : '';
                            
                            // Add tense information if available
                            let tenseText = '';
                            if (related.tense && typeof related.tense === 'object') {
                                const tenseParts = [];
                                if (related.tense.present) tenseParts.push(`現在式: ${escapeHtml(related.tense.present)}`);
                                if (related.tense.past) tenseParts.push(`過去式: ${escapeHtml(related.tense.past)}`);
                                if (related.tense.participle) tenseParts.push(`過去分詞: ${escapeHtml(related.tense.participle)}`);
                                if (tenseParts.length > 0) {
                                    tenseText = ` <span class="related-tense">(${tenseParts.join(', ')})</span>`;
                                }
                            }
                            
                            return `<li><span class="related-first-word">${escapeHtml(englishWord)}</span>${pronunciation}${chineseText}${tenseText} <button class="related-audio-btn" data-word="${escapeHtml(englishWord)}" aria-label="Play related word" title="播放相關詞彙">
                                <i class="fas fa-volume-up"></i>
                            </button></li>`;
                        } else {
                            // Old format: string
                            const parts = related.trim().split(/\s+/);
                            if (parts.length > 1) {
                                const firstWord = parts[0];
                                const restOfText = parts.slice(1).join(' ');
                                return `<li><span class="related-first-word">${escapeHtml(firstWord)}</span> ${escapeHtml(restOfText)}</li>`;
                            } else {
                                return `<li><span class="related-first-word">${escapeHtml(related)}</span></li>`;
                            }
                        }
                    }).join('')}
                </ul>
            </div>` : '';

        // Format tense information if available (for verbs)
        const tenseHTML = word.tense && typeof word.tense === 'object' ? `
            <div class="word-tense">
                <span class="tense-label">時態：</span>
                <div class="tense-list">
                    ${word.tense.present ? `<span class="tense-item"><span class="tense-name">現在式</span> ${escapeHtml(word.tense.present)}</span>` : ''}
                    ${word.tense.past ? `<span class="tense-item"><span class="tense-name">過去式</span> ${escapeHtml(word.tense.past)}</span>` : ''}
                    ${word.tense.participle ? `<span class="tense-item"><span class="tense-name">過去分詞</span> ${escapeHtml(word.tense.participle)}</span>` : ''}
                </div>
            </div>` : '';

        wordItem.innerHTML = `
            <div class="word-content">
                <span class="word-number">${wordNumber}.</span>
                <div class="word-main">
                    <div class="word-header">
                        <span class="english">${word.english}</span>
                        ${grammarBadgesHTML}
                        <button class="audio-btn" aria-label="Play pronunciation">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        ${exampleGeneratorButtonHTML}
                        <button class="play-word-examples-btn" data-word="${escapeHtml(word.english)}" aria-label="Play word and examples" title="播放字彙和例句">
                            <i class="fas fa-play"></i>
                        </button>
                        ${videoButton}
                    </div>
                    <div class="chinese">${chineseHTML}</div>
                    ${synonymsSectionHTML}
                    ${pronunciationHTML}
                    ${tenseHTML}
                    ${examplesWrapperHTML}
                    ${phrasesHTML}
                    ${relatedHTML}
                    ${notesSectionHTML}
                </div>
            </div>
            <div class="word-actions">
                ${wordProgress.mastered ? '<span class="mastery-badge"></span>' : ''}
            </div>
        `;
        
        // Add event listener for audio button
        const audioBtn = wordItem.querySelector('.audio-btn');
        audioBtn.addEventListener('click', () => {
            playAudio(word.english);
        });

        // Add event listener for pronunciation audio button
        const pronunciationAudioBtn = wordItem.querySelector('.pronunciation-audio-btn');
        if (pronunciationAudioBtn) {
            pronunciationAudioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playAudio(word.english);
            });
        }

        // Add event listeners for phrase audio buttons
        const phraseAudioBtns = wordItem.querySelectorAll('.phrase-audio-btn');
        phraseAudioBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const phraseText = btn.dataset.phrase;
                playPhraseWithHighlight(phraseText, btn, wordItem);
            });
        });

        // Add event listeners for related word audio buttons
        const relatedAudioBtns = wordItem.querySelectorAll('.related-audio-btn');
        relatedAudioBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const relatedWord = btn.dataset.word;
                playAudio(relatedWord);
            });
        });

        // Add event listener for video button if it exists
        if (hasVideo) {
            const videoBtn = wordItem.querySelector('.video-btn');
            videoBtn.addEventListener('click', () => {
                const videoUrl = videoBtn.dataset.videoUrl;
                window.open(videoUrl, '_blank');
            });
        }

        if (writerAvailable) {
            const exampleGeneratorBtn = wordItem.querySelector('.generate-example-btn');
            if (exampleGeneratorBtn) {
                exampleGeneratorBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await generateExampleForWord(word.english, wordItem, exampleGeneratorBtn);
                });
            }
        }

        // Add event listener for play word and examples button
        const playWordExamplesBtn = wordItem.querySelector('.play-word-examples-btn');
        if (playWordExamplesBtn) {
            playWordExamplesBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await playWordAndExamples(word.english, wordItem);
            });
        }

        // Add event listeners for example audio buttons
        const exampleAudioBtns = wordItem.querySelectorAll('.example-audio-btn');
        exampleAudioBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const sentence = decodeHtmlEntities(btn.dataset.sentence || '');
                playExampleSentence(sentence, btn);
            });
        });

        if (supportsTranslationApi) {
            const translateButtons = wordItem.querySelectorAll('.example-translate-btn');
            translateButtons.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const sentence = decodeHtmlEntities(btn.dataset.sentence || '');
                    await translateExampleSentence(sentence, btn);
                });
            });
        }

        if (isRewriterSupported()) {
            const rewriteButtons = wordItem.querySelectorAll('.example-rewrite-btn');
            rewriteButtons.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const sentence = decodeHtmlEntities(btn.dataset.sentence || '');
                    const englishWord = decodeHtmlEntities(btn.dataset.word || '');
                    await rewriteExampleSentence(sentence, englishWord, btn);
                });
            });
        }

        // Add keyboard navigation to each word item
        wordItem.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
            
            e.preventDefault();
            
            const wordItems = Array.from(wordList.querySelectorAll('.word-item'));
            const currentIndex = wordItems.indexOf(wordItem);
            let nextIndex = currentIndex;
            
            if (e.key === 'ArrowDown' && currentIndex < wordItems.length - 1) {
                nextIndex = currentIndex + 1;
            } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                nextIndex = currentIndex - 1;
            }
            
            // Focus the first focusable element in the next/previous word item
            const nextWordItem = wordItems[nextIndex];
            const focusableElement = nextWordItem.querySelector('button, [tabindex], .word-item');
            if (focusableElement) {
                focusableElement.focus();
            }
        });

        wordList.appendChild(wordItem);
    });

    // Add keyboard navigation for word items
    wordList.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        
        e.preventDefault();
        
        const wordItems = Array.from(wordList.querySelectorAll('.word-item'));
        const currentFocusedItem = document.activeElement.closest('.word-item');
        
        if (!currentFocusedItem || !wordItems.includes(currentFocusedItem)) {
            // Focus first item if no item is currently focused
            if (wordItems.length > 0) {
                const firstFocusableElement = wordItems[0].querySelector('button, [tabindex]');
                if (firstFocusableElement) {
                    firstFocusableElement.focus();
                }
            }
            return;
        }
        
        const currentIndex = wordItems.indexOf(currentFocusedItem);
        let nextIndex = currentIndex;
        
        if (e.key === 'ArrowDown' && currentIndex < wordItems.length - 1) {
            nextIndex = currentIndex + 1;
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            nextIndex = currentIndex - 1;
        }
        
        // Focus the first focusable element in the next/previous word item
        const nextWordItem = wordItems[nextIndex];
        const focusableElement = nextWordItem.querySelector('button, [tabindex]');
        if (focusableElement) {
            focusableElement.focus();
        }
    });

}

// Show the list of all units
function showUnitsList() {
    unitsList.style.display = 'block';
    unitDetail.style.display = 'none';
    currentUnitId = null;
    updateUnitDescription(null);
}

// Play audio for a word with cloud fallback
function playAudio(word) {
    if (!word) return;

    console.log('Playing audio for word:', word);

    // Show loading state on the button that triggered this
    const audioButtons = document.querySelectorAll('.audio-btn');
    const clickedButton = Array.from(audioButtons).find(btn => btn === document.activeElement);

    // Set loading state
    if (clickedButton) {
        const originalIcon = clickedButton.innerHTML;
        clickedButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        clickedButton.disabled = true;
        clickedButton.classList.add('loading');

        // Function to restore button state
        const restoreButton = () => {
            clickedButton.innerHTML = originalIcon;
            clickedButton.disabled = false;
            clickedButton.classList.remove('loading');
        };

        // Show status message
        showAudioStatus('播放音訊中...');

        // Use audio service
        audioService.playWord(word, {
            onEnd: restoreButton,
            onError: (err) => {
                console.error('Audio playback error:', err);
                showAudioStatus('無法播放音訊');
                restoreButton();
            }
        });
    } else {
        // No active button, just play the audio without visual feedback
        audioService.playWord(word);
    }
}

async function getExampleTranslator() {
    if (!supportsTranslationApi || !createTranslatorFn) {
        return null;
    }
    if (!translatorPromise) {
        translatorPromise = (async () => {
            try {
                const availability = typeof translationProvider.availability === 'function'
                    ? await translationProvider.availability(translationOptions)
                    : 'available';

                if (availability === false || availability === 'unavailable') {
                    return null;
                }

                // Show status if model needs download
                if (availability === 'downloadable') {
                    showAudioStatus('首次使用需要下載翻譯模型，請稍候…');
                } else if (availability === 'downloading') {
                    showAudioStatus('翻譯模型下載中，請稍候…');
                }

                if (typeof translationProvider.requestPermission === 'function') {
                    const permission = await translationProvider.requestPermission(translationOptions);
                    if (permission !== 'granted') {
                        return null;
                    }
                }

                const translator = await createTranslatorFn(translationOptions);
                return translator;
            } catch (err) {
                console.error('Translator creation failed:', err);
                if (err && err.name === 'NotAllowedError') {
                    translatorPromise = null;
                    showAudioStatus('請再次點擊翻譯按鈕以下載模型');
                }
                return null;
            }
        })();
    }
    return translatorPromise;
}

async function translateExampleSentence(sentence, button) {
    if (!supportsTranslationApi || !sentence || !button) return;

    const normalizedSentence = sentence.trim();
    if (!normalizedSentence) return;

    const exampleLine = button.closest('.example-line');
    const translationOutput = exampleLine ? exampleLine.querySelector('.example-translation') : null;

    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    button.classList.add('loading');

    const restoreButton = () => {
        button.innerHTML = originalIcon;
        button.disabled = false;
        button.classList.remove('loading');
    };

    try {
        if (translationCache.has(normalizedSentence)) {
            if (translationOutput) {
                translationOutput.textContent = translationCache.get(normalizedSentence);
            }
            restoreButton();
            return;
        }

        const translator = await getExampleTranslator();
        if (!translator) {
            translatorPromise = null;
            if (translationOutput) {
                translationOutput.textContent = '無法使用翻譯服務';
            }
            restoreButton();
            return;
        }

        if (translationOutput) {
            translationOutput.textContent = '翻譯中...';
        }

        const translated = await translator.translate(normalizedSentence);
        const translatedText = typeof translated === "string" ? translated : (translated && (translated.translatedText || translated.text)) || '';
        translationCache.set(normalizedSentence, translatedText || normalizedSentence);
        if (translationOutput) {
            translationOutput.textContent = translatedText || normalizedSentence;
        }
    } catch (error) {
        console.error('Translation error:', error);
        if (translationOutput) {
            translationOutput.textContent = '翻譯失敗，請稍後再試';
        }
    } finally {
        restoreButton();
    }
}

async function rewriteExampleSentence(sentence, englishWord, button) {
    if (!isRewriterSupported() || !sentence || !button) return;

    const normalizedSentence = sentence.trim();
    if (!normalizedSentence) return;

    const exampleLine = button.closest('.example-line');
    const wordItem = button.closest('.word-item');

    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    button.classList.add('loading');

    const restoreButton = () => {
        button.innerHTML = originalIcon;
        button.disabled = false;
        button.classList.remove('loading');
    };

    try {
        const rewriter = await getRewriter();
        if (!rewriter) {
            showAudioStatus('無法使用重寫功能');
            restoreButton();
            return;
        }

        showAudioStatus('重寫例句中...');

        // Use Rewriter API to rewrite the sentence
        const baseContext = englishWord
            ? `Rewrite this example sentence using the word "${englishWord}". Keep it clear, simple, and natural for vocabulary learning.`
            : 'Rewrite this example sentence to make it clearer and more natural for vocabulary learning.';
        const toneVariant = pickRandomRewriterTone();
        const toneInstruction = toneVariant ? ` ${toneVariant.prompt}` : '';
        const includeWordInstruction = englishWord
            ? ` The rewritten sentence must include the word "${englishWord}" (case-insensitive) and stay natural.`
            : '';
        const contexts = [
            `${baseContext}${toneInstruction}${includeWordInstruction}`.trim()
        ];
        if (englishWord) {
            contexts.push(`${baseContext} Keep the sentence concise and ensure the exact word "${englishWord}" appears somewhere in the sentence.`.trim());
        }

        let rewrittenSentence = '';
        for (let i = 0; i < contexts.length && !rewrittenSentence; i += 1) {
            const context = contexts[i];
            const rewriteOptions = { context };
            const rewritten = await runRewrite(rewriter, normalizedSentence, rewriteOptions);
            const cleaned = cleanGeneratedSentence(rewritten).trim();
            if (!cleaned) {
                continue;
            }
            if (isValidGeneratedSentence(cleaned, englishWord)) {
                rewrittenSentence = cleaned;
                break;
            }
            console.log('Invalid rewritten sentence attempt:', cleaned);
        }

        if (!rewrittenSentence) {
            showAudioStatus('重寫的句子缺少該單字，請再試一次');
            return;
        }

        // Append the rewritten sentence as a new example instead of replacing
        if (wordItem && englishWord) {
            appendGeneratedExampleLine(wordItem, englishWord, rewrittenSentence);
            showAudioStatus('已新增重寫例句');
        }
    } catch (error) {
        console.error('Rewrite error:', error);
        showAudioStatus('重寫失敗，請稍後再試');
    } finally {
        restoreButton();
    }
}

// Play phrase with highlighting
function playPhraseWithHighlight(phraseText, button, wordItem) {
    if (!phraseText) return;

    console.log('Playing phrase:', phraseText);

    if (activePhrasePlayback) {
        const previousPlayback = activePhrasePlayback;
        activePhrasePlayback = null;

        if (typeof previousPlayback.clearWordHighlight === 'function') {
            previousPlayback.clearWordHighlight();
        }

        if (typeof previousPlayback.restoreButton === 'function') {
            previousPlayback.restoreButton();
        } else if (previousPlayback.button) {
            previousPlayback.button.innerHTML = previousPlayback.originalIcon || '<i class="fas fa-volume-up"></i>';
            previousPlayback.button.disabled = false;
            previousPlayback.button.classList.remove('loading');
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }

    // Set loading state
    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    button.classList.add('loading');

    if (wordItem) {
        wordItem.classList.add('playing');
    }

    // Find the phrase list item and strong tag (which contains the phrase text)
    const phraseListItem = button.closest('li');
    if (phraseListItem) {
        phraseListItem.classList.add('playing');
    }

    // Get the strong element that contains the phrase text
    const phraseElement = button.closest('li').querySelector('strong');
    if (!phraseElement) {
        console.error('Could not find phrase element');
        button.innerHTML = originalIcon;
        button.disabled = false;
        return;
    }

    // Parse phrase text into words and create word boundaries
    const words = phraseText.split(/\s+/);
    let charIndex = 0;
    const wordBoundaries = words.map(word => {
        const start = charIndex;
        const end = charIndex + word.length;
        charIndex = end + 1; // +1 for space
        return { word, start, end };
    });

    // Create span elements for each word in the phrase
    let currentWordSpan = null;
    phraseElement.innerHTML = words.map((word, index) => 
        `<span class="phrase-word" data-index="${index}" data-start="${wordBoundaries[index].start}" data-end="${wordBoundaries[index].end}">${escapeHtml(word)}</span>`
    ).join(' ');

    const wordSpans = Array.from(phraseElement.querySelectorAll('.phrase-word'));

    const clearWordHighlight = () => {
        if (currentWordSpan) {
            currentWordSpan.classList.remove('current-word');
            currentWordSpan = null;
        }
        wordSpans.forEach(span => span.classList.remove('current-word'));
    };

    const highlightWordAtChar = (charIndex) => {
        if (!wordBoundaries.length || typeof charIndex !== 'number') {
            return;
        }

        let target = null;
        for (let i = 0; i < wordBoundaries.length; i += 1) {
            const boundary = wordBoundaries[i];
            if (charIndex >= boundary.start && charIndex < boundary.end) {
                target = boundary;
                break;
            }
            if (charIndex >= boundary.end) {
                target = boundary;
            }
        }

        if (!target) {
            target = wordBoundaries[wordBoundaries.length - 1];
        }

        // Find corresponding span
        const targetIndex = wordBoundaries.indexOf(target);
        if (targetIndex >= 0 && targetIndex < wordSpans.length) {
            const targetSpan = wordSpans[targetIndex];
            if (targetSpan !== currentWordSpan) {
                if (currentWordSpan) {
                    currentWordSpan.classList.remove('current-word');
                }
                targetSpan.classList.add('current-word');
                currentWordSpan = targetSpan;
            }
        }
    };

    const cleanupHighlight = () => {
        clearWordHighlight();
        // Restore original text
        phraseElement.innerHTML = escapeHtml(phraseText);
        if (phraseListItem) {
            phraseListItem.classList.remove('playing');
        }
        if (wordItem) {
            wordItem.classList.remove('playing');
        }
    };

    const playbackContext = {
        button,
        originalIcon,
        cleanupHighlight,
        clearWordHighlight
    };

    activePhrasePlayback = playbackContext;

    // Function to restore button state
    const restoreButton = () => {
        button.innerHTML = originalIcon;
        button.disabled = false;
        button.classList.remove('loading');
        cleanupHighlight();
        if (activePhrasePlayback === playbackContext) {
            activePhrasePlayback = null;
        }
    };

    playbackContext.restoreButton = restoreButton;

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(phraseText);
        utterance.lang = 'en-US';
        utterance.rate = 0.9 * (audioService?.pronunciationSpeed || 1.0);

        utterance.onboundary = (event) => {
            if (typeof event.charIndex === 'number') {
                highlightWordAtChar(event.charIndex);
            }
        };

        utterance.onend = () => {
            restoreButton();
        };

        utterance.onerror = (err) => {
            console.error('Speech synthesis error:', err);
            showAudioStatus('無法播放搭配');
            restoreButton();
        };

        playbackContext.utterance = utterance;
        clearWordHighlight();
        window.speechSynthesis.speak(utterance);
    } else {
        showAudioStatus('您的瀏覽器不支援語音合成');
        restoreButton();
    }
}

// Play audio for example sentence using speech synthesis
function playExampleSentence(sentence, button) {
    if (!sentence) return;

    console.log('Playing example sentence:', sentence);

    if (activeExamplePlayback) {
        const previousPlayback = activeExamplePlayback;
        activeExamplePlayback = null;

        if (typeof previousPlayback.clearWordHighlight === 'function') {
            previousPlayback.clearWordHighlight();
        }

        if (typeof previousPlayback.restoreButton === 'function') {
            previousPlayback.restoreButton();
        } else if (previousPlayback.button) {
            previousPlayback.button.innerHTML = previousPlayback.originalIcon || '<i class="fas fa-volume-up"></i>';
            previousPlayback.button.disabled = false;
            previousPlayback.button.classList.remove('loading');
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }

    // Set loading state
    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    button.classList.add('loading');

    const wordItem = button.closest('.word-item');
    const exampleLine = button.closest('.example-line');
    const exampleText = exampleLine ? exampleLine.querySelector('.example-text') : null;
    const wordSpans = exampleText ? Array.from(exampleText.querySelectorAll('.example-word')) : [];
    const wordBoundaries = wordSpans.map(span => ({
        start: Number(span.dataset.start),
        end: Number(span.dataset.end),
        span
    }));
    let currentWordSpan = null;

    if (wordItem) {
        wordItem.classList.add('playing');
    }

    if (exampleLine) {
        exampleLine.classList.add('playing');
    }

    const clearWordHighlight = () => {
        if (currentWordSpan) {
            currentWordSpan.classList.remove('current-word');
            currentWordSpan = null;
        }
        wordSpans.forEach(span => span.classList.remove('current-word'));
    };

    const highlightWordAtChar = (charIndex) => {
        if (!wordBoundaries.length || typeof charIndex !== 'number') {
            return;
        }

        let target = null;
        for (let i = 0; i < wordBoundaries.length; i += 1) {
            const boundary = wordBoundaries[i];
            if (charIndex >= boundary.start && charIndex < boundary.end) {
                target = boundary;
                break;
            }
            if (charIndex >= boundary.end) {
                target = boundary;
            }
        }

        if (!target) {
            target = wordBoundaries[wordBoundaries.length - 1];
        }

        if (target && target.span !== currentWordSpan) {
            if (currentWordSpan) {
                currentWordSpan.classList.remove('current-word');
            }
            target.span.classList.add('current-word');
            currentWordSpan = target.span;
        }
    };

    const cleanupHighlight = () => {
        clearWordHighlight();
        if (exampleLine) {
            exampleLine.classList.remove('playing');
        }
        if (wordItem) {
            wordItem.classList.remove('playing');
        }
    };

    const playbackContext = {
        button,
        originalIcon,
        cleanupHighlight,
        clearWordHighlight,
        restoreButton: null
    };

    activeExamplePlayback = playbackContext;

    // Function to restore button state
    const restoreButton = () => {
        button.innerHTML = originalIcon;
        button.disabled = false;
        button.classList.remove('loading');
        cleanupHighlight();
        if (activeExamplePlayback === playbackContext) {
            activeExamplePlayback = null;
        }
    };

    playbackContext.restoreButton = restoreButton;

    // Show status message
    showAudioStatus('播放例句中...');

    // Use speech synthesis for sentences
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.lang = 'en-US';

        // Apply pronunciation speed (base rate 0.9 * user speed)
        utterance.rate = 0.9 * audioService.getPronunciationSpeed();

        // Use preferred voice if available
        const preferredVoice = audioService.getPreferredVoice();
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            highlightWordAtChar(0);
        };

        utterance.onboundary = (event) => {
            if (typeof event.charIndex === 'number') {
                highlightWordAtChar(event.charIndex);
            }
        };

        utterance.onend = () => {
            restoreButton();
        };

        utterance.onerror = (err) => {
            console.error('Speech synthesis error:', err);
            showAudioStatus('無法播放例句');
            restoreButton();
        };

        playbackContext.utterance = utterance;
        clearWordHighlight();
        window.speechSynthesis.speak(utterance);
    } else {
        showAudioStatus('您的瀏覽器不支援語音合成');
        restoreButton();
    }
}

/**
 * Play the vocabulary word and then all example sentences sequentially
 * @param {string} word - The vocabulary word to play
 * @param {HTMLElement} wordItem - The word item element containing examples
 */
async function playWordAndExamples(word, wordItem) {
    if (!word || !wordItem) return;

    try {
        // Cancel any active playback
        if (activeExamplePlayback) {
            const previousPlayback = activeExamplePlayback;
            activeExamplePlayback = null;

            if (typeof previousPlayback.clearWordHighlight === 'function') {
                previousPlayback.clearWordHighlight();
            }

            if (typeof previousPlayback.restoreButton === 'function') {
                previousPlayback.restoreButton();
            }

            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }

        // Add playing state to word item
        wordItem.classList.add('playing');

        // First, play the vocabulary word
        await new Promise((resolve) => {
            showAudioStatus('播放字彙中...');
            
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.lang = 'en-US';
                utterance.rate = 1.0 * audioService.getPronunciationSpeed();
                
                const preferredVoice = audioService.getPreferredVoice();
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }
                
                utterance.onend = () => {
                    resolve();
                };
                
                utterance.onerror = () => {
                    resolve();
                };
                
                window.speechSynthesis.speak(utterance);
            } else {
                resolve();
            }
        });

        // Then, play each example sentence
        const exampleButtons = wordItem.querySelectorAll('.example-audio-btn');
        if (exampleButtons.length === 0) {
            showAudioStatus('此字彙沒有例句');
            wordItem.classList.remove('playing');
            return;
        }

        for (let btnIndex = 0; btnIndex < exampleButtons.length; btnIndex++) {
            const btn = exampleButtons[btnIndex];
            const sentence = decodeHtmlEntities(btn.dataset.sentence || '');
            if (!sentence) continue;

            const exampleLine = btn.closest('.example-line');
            const exampleText = exampleLine ? exampleLine.querySelector('.example-text') : null;
            const wordSpans = exampleText ? Array.from(exampleText.querySelectorAll('.example-word')) : [];
            const wordBoundaries = wordSpans.map(span => ({
                start: Number(span.dataset.start),
                end: Number(span.dataset.end),
                span
            }));
            let currentWordSpan = null;

            if (exampleLine) {
                exampleLine.classList.add('playing');
            }

            const clearWordHighlight = () => {
                if (currentWordSpan) {
                    currentWordSpan.classList.remove('current-word');
                    currentWordSpan = null;
                }
                wordSpans.forEach(span => span.classList.remove('current-word'));
            };

            const highlightWordAtChar = (charIndex) => {
                if (!wordBoundaries.length || typeof charIndex !== 'number') {
                    return;
                }

                let target = null;
                for (let i = 0; i < wordBoundaries.length; i += 1) {
                    const boundary = wordBoundaries[i];
                    if (charIndex >= boundary.start && charIndex < boundary.end) {
                        target = boundary;
                        break;
                    }
                    if (charIndex >= boundary.end) {
                        target = boundary;
                    }
                }

                if (!target) {
                    target = wordBoundaries[wordBoundaries.length - 1];
                }

                if (target && target.span !== currentWordSpan) {
                    if (currentWordSpan) {
                        currentWordSpan.classList.remove('current-word');
                    }
                    target.span.classList.add('current-word');
                    currentWordSpan = target.span;
                }
            };

            const cleanupLineHighlight = () => {
                clearWordHighlight();
                if (exampleLine) {
                    exampleLine.classList.remove('playing');
                }
            };

            await new Promise((resolve) => {
                showAudioStatus(`播放例句 (${btnIndex + 1}/${exampleButtons.length})...`);
                
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(sentence);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.9 * audioService.getPronunciationSpeed();
                    
                    const preferredVoice = audioService.getPreferredVoice();
                    if (preferredVoice) {
                        utterance.voice = preferredVoice;
                    }

                    utterance.onstart = () => {
                        highlightWordAtChar(0);
                    };

                    utterance.onboundary = (event) => {
                        if (typeof event.charIndex === 'number') {
                            highlightWordAtChar(event.charIndex);
                        }
                    };
                    
                    utterance.onend = () => {
                        cleanupLineHighlight();
                        resolve();
                    };
                    
                    utterance.onerror = () => {
                        cleanupLineHighlight();
                        resolve();
                    };
                    
                    window.speechSynthesis.speak(utterance);
                } else {
                    resolve();
                }
            });

            // Add a small delay between sentences
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        wordItem.classList.remove('playing');
        showAudioStatus('播放完成');
    } catch (err) {
        console.error('Error playing word and examples:', err);
        wordItem.classList.remove('playing');
        showAudioStatus('播放出錯');
    }
}
