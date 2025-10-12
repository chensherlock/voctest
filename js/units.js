// DOM elements
const unitsContainer = document.getElementById('unitsContainer');
const unitDetail = document.getElementById('unitDetail');
const unitsList = document.getElementById('unitsList');
const unitNumber = document.getElementById('unitNumber');
const wordList = document.getElementById('wordList');
const backToUnits = document.getElementById('backToUnits');
const practiceFlashcards = document.getElementById('practiceFlashcards');
const takeQuiz = document.getElementById('takeQuiz');

// Current unit being viewed
let currentUnitId = null;
let activeExamplePlayback = null;
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
let languageModelPromise = null;
let languageModelSession = null;
let languageModelUnavailable = false;
let translatorPromise = null;
const translationCache = new Map();
let htmlDecodeElement = null;
const translationOptions = {
    sourceLanguage: 'en',
    targetLanguage: 'zh-Hant'
};

function getLanguageModelEntryPoint() {
    if (typeof globalThis === 'undefined') {
        return null;
    }
    if (globalThis.LanguageModel) {
        return globalThis.LanguageModel;
    }
    if (globalThis.ai && globalThis.ai.languageModel) {
        return globalThis.ai.languageModel;
    }
    return null;
}

function isLanguageModelSupported() {
    return !!getLanguageModelEntryPoint();
}

function getLanguageModelCreator() {
    const entryPoint = getLanguageModelEntryPoint();
    if (!entryPoint) {
        return null;
    }
    const createFn = entryPoint.create;
    if (typeof createFn === 'function') {
        return createFn.bind(entryPoint);
    }
    return null;
}

function getPromptApiFlagInfo() {
    if (typeof navigator === 'undefined') {
        return null;
    }

    const userAgent = navigator.userAgent || '';
    const isEdge = /Edg\//.test(userAgent);
    const isChrome = !isEdge && /Chrome\//.test(userAgent);

    if (isEdge) {
        return {
            browser: 'edge',
            url: 'edge://flags/#edge-llm-prompt-api-for-phi-mini',
            label: '啟用 Prompt API'
        };
    }

    if (isChrome) {
        return {
            browser: 'chrome',
            url: 'chrome://flags/#prompt-api-for-gemini-nano',
            label: '啟用 Prompt API'
        };
    }

    return null;
}

function updateLanguageModelFlagButton() {
    const header = document.getElementById('unitHeader');
    if (!header) return;
    const unitHeading = header.querySelector('h2');
    if (!unitHeading) return;

    let flagButton = unitHeading.querySelector('.prompt-api-flag-btn');

    if (isLanguageModelSupported()) {
        if (flagButton) {
            flagButton.remove();
        }
        return;
    }

    const flagInfo = getPromptApiFlagInfo();
    if (!flagInfo) {
        if (flagButton) {
            flagButton.remove();
        }
        return;
    }

    if (!flagButton) {
        flagButton = document.createElement('button');
        flagButton.type = 'button';
        flagButton.className = 'prompt-api-flag-btn';
        flagButton.innerHTML = '<i class="fas fa-flask"></i><span>啟用 Prompt API</span>';
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

function scheduleLanguageModelWarmup() {
    if (!isLanguageModelSupported() || languageModelPromise) {
        return;
    }

    const warmup = () => {
        getLanguageModel();
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

function createLanguageModelOptions() {
    if (typeof window === 'undefined') return {};
    return {
        monitor: (model) => {
            if (!model || typeof model.addEventListener !== 'function') return;
            model.addEventListener('downloadprogress', (event) => {
                if (!event || typeof event.loaded !== 'number' || typeof event.total !== 'number' || event.total === 0) {
                    showAudioStatus('語言模型下載中…');
                    return;
                }
                const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
                showAudioStatus(`語言模型下載中 ${percent}%`);
            });
        }
    };
}

async function getLanguageModel() {
    if (!isLanguageModelSupported()) {
        return null;
    }

    const languageModelProvider = getLanguageModelEntryPoint();
    const createLanguageModelFn = getLanguageModelCreator();
    if (!languageModelProvider || !createLanguageModelFn) {
        return null;
    }

    if (languageModelSession) {
        return languageModelSession;
    }

    if (languageModelUnavailable) {
        return null;
    }

    if (!languageModelPromise) {
        languageModelPromise = (async () => {
            try {
                if (typeof languageModelProvider.requestPermission === 'function') {
                    const permission = await languageModelProvider.requestPermission();
                    if (permission !== 'granted') {
                        languageModelUnavailable = true;
                        return null;
                    }
                }

                if (typeof languageModelProvider.availability === 'function') {
                    const availability = await languageModelProvider.availability();
                    if (availability === false || availability === 'unavailable') {
                        languageModelUnavailable = true;
                        return null;
                    }
                    if (availability === 'downloadable' || availability === 'downloading') {
                        showAudioStatus('語言模型準備中…');
                        return null;
                    }
                }

                const sessionOptions = Object.assign(
                    {
                        temperature: 0.8,
                        topK: 5,
                        outputLanguage: 'en',
                        responseLanguage: 'en',
                        output: {
                            format: 'text',
                            language: 'en'
                        },
                        response: {
                            language: 'en'
                        }
                    },
                    createLanguageModelOptions()
                );
                const session = await createLanguageModelFn(sessionOptions);
                const hasPrompt = session && (typeof session.prompt === 'function' ||
                    typeof session.promptStreaming === 'function');
                if (!hasPrompt) {
                    console.warn('Language model session missing prompt capabilities.');
                    return null;
                }
                if (session && typeof session === 'object') {
                    if ('outputLanguage' in session && session.outputLanguage !== 'en') {
                        try {
                            session.outputLanguage = 'en';
                        } catch (err) {
                            console.warn('Unable to set session.outputLanguage:', err);
                        }
                    }
                    if ('responseLanguage' in session && session.responseLanguage !== 'en') {
                        try {
                            session.responseLanguage = 'en';
                        } catch (err) {
                            console.warn('Unable to set session.responseLanguage:', err);
                        }
                    }
                    if ('output' in session && session.output && typeof session.output === 'object') {
                        session.output.language = session.output.language || 'en';
                        if (!session.output.format) {
                            session.output.format = 'text';
                        }
                    }
                    if ('response' in session && session.response && typeof session.response === 'object') {
                        session.response.language = session.response.language || 'en';
                    }
                }
                languageModelSession = session;
                return session;
            } catch (err) {
                console.error('Language model creation failed:', err);
                return null;
            }
        })();
    }

    const session = await languageModelPromise;
    if (!session) {
        if (!languageModelSession && !languageModelUnavailable) {
            languageModelPromise = null;
        }
        return null;
    }
    return session;
}

async function runLanguageModelPrompt(session, promptText) {
    if (!session || !promptText) {
        return '';
    }

    const outputOptions = {
        format: 'text',
        language: 'en'
    };
    const promptOptions = {
        outputLanguage: 'en',
        responseLanguage: 'en',
        response: {
            language: 'en'
        },
        output: outputOptions
    };
    const promptRequest = {
        prompt: promptText,
        outputLanguage: 'en',
        responseLanguage: 'en',
        response: {
            language: 'en'
        },
        output: outputOptions
    };

    const normalizeResponse = (response) => {
        if (!response) return '';
        if (typeof response === 'string') return response;
        if (typeof response.text === 'string') return response.text;
        if (typeof response.output === 'string') return response.output;
        if (typeof response.response === 'string') return response.response;
        if (Array.isArray(response)) return response.join('');
        if (Array.isArray(response.output)) {
            return response.output.filter(chunk => typeof chunk === 'string').join('');
        }
        return '';
    };

    if (typeof session.prompt === 'function') {
        try {
            const response = await session.prompt(promptRequest);
            const normalized = normalizeResponse(response);
            if (normalized) {
                return normalized;
            }
        } catch (err) {
            console.error('Language model prompt error (object signature):', err);
        }

        try {
            const response = await session.prompt(promptText, promptOptions);
            const normalized = normalizeResponse(response);
            if (normalized) {
                return normalized;
            }
        } catch (err) {
            console.error('Language model prompt error (legacy signature):', err);
        }
    }

    if (typeof session.promptStreaming === 'function') {
        try {
            let combined = '';
            const stream = session.promptStreaming(promptRequest);
            // promptStreaming returns an async iterable of chunks
            for await (const chunk of stream) {
                const chunkText = normalizeResponse(chunk) || (typeof chunk === 'string' ? chunk : '');
                combined += chunkText;
            }
            if (combined.trim()) {
                return combined;
            }
        } catch (err) {
            console.error('Language model streaming error (object signature):', err);
        }

        try {
            let combined = '';
            const stream = session.promptStreaming(promptText, promptOptions);
            for await (const chunk of stream) {
                const chunkText = normalizeResponse(chunk) || (typeof chunk === 'string' ? chunk : '');
                combined += chunkText;
            }
            if (combined.trim()) {
                return combined;
            }
        } catch (err) {
            console.error('Language model streaming error (legacy signature):', err);
        }
    }

    const languageModelProvider = getLanguageModelEntryPoint();
    if (languageModelProvider && typeof languageModelProvider.prompt === 'function') {
        try {
            const response = await languageModelProvider.prompt(promptRequest);
            return normalizeResponse(response);
        } catch (err) {
            console.error('Language model provider prompt error (object signature):', err);
        }

        try {
            const response = await languageModelProvider.prompt(promptText, promptOptions);
            return normalizeResponse(response);
        } catch (err) {
            console.error('Language model provider prompt error (legacy signature):', err);
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
}

function highlightWordInSentence(word, sentence) {
    if (!word || !sentence) return sentence;
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i');
    if (regex.test(sentence)) {
        return sentence.replace(regex, (match) => `[${match}]`);
    }
    return `[${word}] ${sentence}`;
}

function appendGeneratedExampleLine(wordItem, englishWord, sentence) {
    const examplesContainer = ensureExamplesContainer(wordItem);
    if (!examplesContainer) return;

    const highlightedSentence = highlightWordInSentence(englishWord, sentence);
    const { html: exampleMarkup, cleanSentence } = buildExampleMarkup(highlightedSentence);
    const encodedSentence = escapeHtml(cleanSentence);

    const translateButtonHTML = supportsTranslationApi ? `
        <button class="example-translate-btn" data-sentence="${encodedSentence}" aria-label="翻譯成繁體中文" title="翻譯成繁體中文">
            <i class="fas fa-language"></i>
        </button>` : '';
    const translationOutputHTML = supportsTranslationApi ? '<div class="example-translation" aria-live="polite"></div>' : '';

    const lineMarkup = `<span class="example-text" data-sentence="${encodedSentence}">${exampleMarkup}</span>
        <div class="example-action-buttons">
            <button class="example-audio-btn" data-sentence="${encodedSentence}" aria-label="Play example sentence">
                <i class="fas fa-volume-up"></i>
            </button>
            ${translateButtonHTML}
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
        const model = await getLanguageModel();
        if (!model) {
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

        const basePrompt = `make a sentence with "${englishWord}"`;
        let attempt = 0;
        let sentence = '';

        while (attempt < 3 && !sentence) {
            let prompt = basePrompt;
            //prompt += ' Return only the sentence.';

            const candidateRaw = await runLanguageModelPrompt(model, prompt);
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
            `<span class="${classes.join(' ')}" data-word-index="${wordIndex}" data-start="${start}" data-end="${end}">${escapeHtml(displayWord)}</span>`
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

            const unitCard = document.createElement('div');
            unitCard.className = `unit-card ${unit.default ? 'default-unit' : ''} ${!hasWords ? 'disabled' : ''}`;

            // Create video button HTML if available
            const videoButtonHTML = hasVideo ?
                `<button class="btn-small btn-video" data-video-url="${unit.video}" title="觀看單元影片"><i class="fas fa-video"></i></button>`
                : '';

            unitCard.innerHTML = `
                <div class="unit-card-header">
                    <h3>${unit.title} <span class="word-count">(${unit.words.length} 個詞彙)</span> ${videoButtonHTML || ''}</h3>
                </div>
            `;

            // Make the entire card clickable for units with words
            if (hasWords) {
                unitCard.style.cursor = 'pointer';
                unitCard.addEventListener('click', (e) => {
                    // Don't navigate if clicking on video button
                    if (e.target.closest('.btn-video')) {
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
        unitNumber.textContent = unit.id;
        updateLanguageModelFlagButton();
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
                    const translateButtonHTML = supportsTranslationApi ? `
                        <button class="example-translate-btn" data-sentence="${encodedSentence}" aria-label="翻譯成繁體中文" title="翻譯成繁體中文">
                            <i class="fas fa-language"></i>
                        </button>` : '';
                    const translationOutputHTML = supportsTranslationApi ? `<div class="example-translation" aria-live="polite"></div>` : '';

                    return `<div class="example-line" data-sentence="${encodedSentence}">
                        <span class="example-text" data-sentence="${encodedSentence}">${exampleMarkup}</span>
                        <div class="example-action-buttons">
                            <button class="example-audio-btn" data-sentence="${encodedSentence}" aria-label="Play example sentence">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            ${translateButtonHTML}
                        </div>
                        ${translationOutputHTML}
                    </div>`;
                })
                .join('');
        }

        const languageModelAvailable = isLanguageModelSupported();

        // Check if word has video URL
        const hasVideo = word.video && word.video.trim() !== '';
        const exampleGeneratorButtonHTML = languageModelAvailable ?
            `<button class="generate-example-btn" data-word="${escapeHtml(word.english)}" aria-label="產生新的例句" title="產生新的例句">
                <i class="fas fa-magic"></i>
            </button>` : '';
        const videoButton = hasVideo ?
            `<button class="video-btn" data-video-url="${word.video}" aria-label="Watch video">
                <i class="fas fa-video"></i>
            </button>` : '';
        const examplesWrapperHTML = (hasExample || languageModelAvailable) ? `<div class="examples">${examplesHTML}</div>` : '';

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
                        ${videoButton}
                    </div>
                    <div class="chinese">${chineseHTML}</div>
                    ${examplesWrapperHTML}
                </div>
            </div>
            <div class="word-actions">
                ${wordProgress.mastered ? '<span class="mastery-badge"><i class="fas fa-check-circle"></i></span>' : ''}
            </div>
        `;
        
        // Add event listener for audio button
        const audioBtn = wordItem.querySelector('.audio-btn');
        audioBtn.addEventListener('click', () => {
            playAudio(word.english);
        });

        // Add event listener for video button if it exists
        if (hasVideo) {
            const videoBtn = wordItem.querySelector('.video-btn');
            videoBtn.addEventListener('click', () => {
                const videoUrl = videoBtn.dataset.videoUrl;
                window.open(videoUrl, '_blank');
            });
        }

        if (languageModelAvailable) {
            const exampleGeneratorBtn = wordItem.querySelector('.generate-example-btn');
            if (exampleGeneratorBtn) {
                exampleGeneratorBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await generateExampleForWord(word.english, wordItem, exampleGeneratorBtn);
                });
            }
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

        wordList.appendChild(wordItem);
    });

    scheduleLanguageModelWarmup();
}

// Show the list of all units
function showUnitsList() {
    unitsList.style.display = 'block';
    unitDetail.style.display = 'none';
    currentUnitId = null;
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
                if (typeof translationProvider.requestPermission === 'function') {
                    const permission = await translationProvider.requestPermission(translationOptions);
                    if (permission !== 'granted') {
                        return null;
                    }
                }

                const availability = typeof translationProvider.availability === 'function'
                    ? await translationProvider.availability(translationOptions)
                    : 'available';

                if (availability === false || availability === 'unavailable') {
                    return null;
                }

                return await createTranslatorFn(translationOptions);
            } catch (err) {
                console.error('Translator creation failed:', err);
                if (err && err.name === 'NotAllowedError') {
                    translatorPromise = null;
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
