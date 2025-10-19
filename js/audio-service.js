/**
 * Centralized Audio & Voice Service
 * Handles all audio playback and voice synthesis functionality
 */

const audioService = {
    // Cloud audio providers
    providers: {
        FREEDIC: 'FreeDictionaryAPI',
        GOOGLE_TTS: 'GoogleTTS',
        SPEECH_SYNTHESIS: 'speechSynthesis'
    },

    // Current provider - can be changed in settings
    // Note: FreeDictionaryAPI and Google TTS are disabled due to CORS/availability issues
    // Using browser speech synthesis as default
    currentProvider: 'speechSynthesis',

    // Cache for audio URLs to prevent redundant API calls
    cache: {},

    // Voice management
    voices: [],
    preferredVoiceURI: null,

    // Pronunciation speed (0.5 to 2.0, default 1.0)
    pronunciationSpeed: 1.0,

    /**
     * Initialize the audio service
     */
    init() {
        this.loadPreferredVoice();
        this.loadPronunciationSpeed();
        this.loadVoices();

        // Speech synthesis voices can load asynchronously
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    },

    /**
     * Load available voices
     */
    loadVoices() {
        if ('speechSynthesis' in window) {
            this.voices = window.speechSynthesis.getVoices();
        }
    },

    /**
     * Load preferred voice from localStorage
     */
    loadPreferredVoice() {
        this.preferredVoiceURI = localStorage.getItem('preferredVoice');
    },

    /**
     * Set preferred voice
     * @param {string} voiceURI - Voice URI to set as preferred
     */
    setPreferredVoice(voiceURI) {
        this.preferredVoiceURI = voiceURI;
        localStorage.setItem('preferredVoice', voiceURI);
    },

    /**
     * Load pronunciation speed from localStorage
     */
    loadPronunciationSpeed() {
        const savedSpeed = localStorage.getItem('pronunciationSpeed');
        if (savedSpeed) {
            this.pronunciationSpeed = parseFloat(savedSpeed);
        }
    },

    /**
     * Set pronunciation speed
     * @param {number} speed - Speed value between 0.25 and 2.0
     */
    setPronunciationSpeed(speed) {
        // Clamp speed between 0.25 and 2.0
        speed = Math.max(0.25, Math.min(2.0, speed));
        this.pronunciationSpeed = speed;
        localStorage.setItem('pronunciationSpeed', speed.toString());
    },

    /**
     * Get current pronunciation speed
     * @returns {number} - Current speed value
     */
    getPronunciationSpeed() {
        return this.pronunciationSpeed;
    },

    /**
     * Get the preferred voice object
     * @returns {SpeechSynthesisVoice|null}
     */
    getPreferredVoice() {
        if (!this.preferredVoiceURI) return null;
        return this.voices.find(voice => voice.voiceURI === this.preferredVoiceURI);
    },

    /**
     * Get audio for a word from the cloud service
     * @param {string} word - The English word to get audio for
     * @returns {Promise<string>} - Promise resolving to audio URL
     */
    getWordAudio(word) {
        // Check cache first
        if (this.cache[word]) {
            console.log('Using cached audio URL for:', word);
            return Promise.resolve(this.cache[word]);
        }

        // Use provider-specific implementation with fallback chain
        switch(this.currentProvider) {
            case this.providers.FREEDIC:
                // Try FreeDictionary first, then fallback to Google TTS on error
                return this.getFreeDictionaryAPI(word)
                    .catch(error => {
                        if (error === 'USE_GOOGLE_TTS' || error === 'USE_SPEECH_SYNTHESIS') {
                            console.log('Falling back to Google TTS for:', word);
                            return this.getGoogleTTS(word);
                        }
                        throw error;
                    });
            case this.providers.GOOGLE_TTS:
                return this.getGoogleTTS(word);
            case this.providers.SPEECH_SYNTHESIS:
                return Promise.reject('USE_SPEECH_SYNTHESIS');
            default:
                console.error(`Provider ${this.currentProvider} not supported. Falling back to Google TTS.`);
                return this.getGoogleTTS(word);
        }
    },

    /**
     * Get audio from FreeDictionaryAPI
     * @param {string} word - The word to get audio for
     * @returns {Promise<string>} - Audio URL
     */
    getFreeDictionaryAPI(word) {
        const dictionaryUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

        return fetch(dictionaryUrl, {
            mode: 'cors',
            credentials: 'omit'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data[0] && data[0].phonetics && data[0].phonetics.length > 0) {
                    // Find the first phonetic with audio
                    const phoneticWithAudio = data[0].phonetics.find(p => p.audio);
                    if (phoneticWithAudio && phoneticWithAudio.audio) {
                        const audioUrl = phoneticWithAudio.audio;
                        this.cache[word] = audioUrl;
                        return audioUrl;
                    }
                }
                // If no audio found in dictionary, return a special marker for speech synthesis
                console.log('No pronunciation audio found in FreeDictionaryAPI. Will use speech synthesis for:', word);
                return Promise.reject('USE_SPEECH_SYNTHESIS');
            })
            .catch((error) => {
                console.log('FreeDictionaryAPI fetch error:', word, error);
                // Return a fallback to use Google TTS or speech synthesis
                return Promise.reject('USE_GOOGLE_TTS');
            });
    },

    /**
     * Get audio from Google TTS (Text-to-Speech)
     * @param {string} word - The word to get audio for
     * @returns {Promise<string>} - Audio URL
     */
    getGoogleTTS(word) {
        const encodedWord = encodeURIComponent(word.toLowerCase());
        const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedWord}&tl=en&client=tw-ob`;

        return new Promise((resolve, reject) => {
            console.log('Using Google TTS for:', word);
            resolve(googleTTSUrl);
        });
    },

    /**
     * Set the current TTS provider
     * @param {string} provider - Provider name from this.providers
     */
    setProvider(provider) {
        if (Object.values(this.providers).includes(provider)) {
            this.currentProvider = provider;
            // Clear cache when changing providers to ensure fresh URLs
            this.cache = {};
        } else {
            console.error(`Invalid provider: ${provider}. Using default.`);
            this.currentProvider = this.providers.FREEDIC;
        }
    },

    /**
     * Get available providers
     * @returns {Array<string>} - List of provider names
     */
    getAvailableProviders() {
        return [this.providers.FREEDIC, this.providers.SPEECH_SYNTHESIS];
    },

    /**
     * Play audio for a word with automatic fallback
     * @param {string} word - The word to pronounce
     * @param {Object} options - Options for playback
     * @param {Function} options.onStart - Callback when audio starts
     * @param {Function} options.onEnd - Callback when audio ends
     * @param {Function} options.onError - Callback on error
     * @returns {Promise<void>}
     */
    playWord(word, options = {}) {
        const { onStart, onEnd, onError } = options;

        if (onStart) onStart();

        // If speech synthesis is the primary provider, use it directly
        if (this.currentProvider === this.providers.SPEECH_SYNTHESIS) {
            return this.speakWord(word, { onEnd, onError });
        }

        // Try to get audio from cloud service
        return this.getWordAudio(word)
            .then(audioUrl => {
                return this.playAudioFromUrl(audioUrl, word, { onEnd, onError });
            })
            .catch(err => {
                if (err === 'USE_SPEECH_SYNTHESIS') {
                    return this.speakWord(word, { onEnd, onError });
                } else {
                    console.error('Failed to get audio:', err);
                    if (onError) onError(err);
                    // Fallback to speech synthesis anyway
                    return this.speakWord(word, { onEnd, onError });
                }
            });
    },

    /**
     * Play audio from a URL with error handling
     * @param {string} url - The audio URL to play
     * @param {string} word - Word for fallback
     * @param {Object} options - Callbacks
     * @returns {Promise<void>}
     */
    playAudioFromUrl(url, word, options = {}) {
        const { onEnd, onError } = options;

        return new Promise((resolve, reject) => {
            if (!url || url === '') {
                this.speakWord(word, { onEnd, onError });
                resolve();
                return;
            }

            const audio = new Audio();
            audio.crossOrigin = "anonymous";
            audio.src = url;

            // Apply pronunciation speed to audio playback
            audio.playbackRate = this.pronunciationSpeed;

            audio.addEventListener('error', (e) => {
                console.log('Audio error, falling back to speech synthesis:', e);
                this.speakWord(word, { onEnd, onError });
                resolve();
            });

            audio.addEventListener('ended', () => {
                if (onEnd) onEnd();
                resolve();
            });

            audio.play().catch(err => {
                console.error('Audio playback error, falling back to speech synthesis:', err);
                this.speakWord(word, { onEnd, onError });
                resolve();
            });
        });
    },

    /**
     * Speak a word using browser speech synthesis
     * @param {string} word - The word to speak
     * @param {Object} options - Options
     * @param {Function} options.onEnd - Callback when speaking ends
     * @param {Function} options.onError - Callback on error
     * @returns {Promise<void>}
     */
    speakWord(word, options = {}) {
        const { onEnd, onError } = options;

        return new Promise((resolve, reject) => {
            if (!('speechSynthesis' in window)) {
                console.error('Speech synthesis not available');
                if (onError) onError(new Error('Speech synthesis not available'));
                reject(new Error('Speech synthesis not available'));
                return;
            }

            try {
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.lang = 'en-US';

                // Apply pronunciation speed (base rate 0.9 * user speed)
                utterance.rate = 0.9 * this.pronunciationSpeed;

                // Use preferred voice if available
                const preferredVoice = this.getPreferredVoice();
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }

                utterance.onend = () => {
                    if (onEnd) onEnd();
                    resolve();
                };

                utterance.onerror = (err) => {
                    console.error('Speech synthesis failed:', err);
                    if (onError) onError(err);
                    reject(err);
                };

                window.speechSynthesis.speak(utterance);
            } catch (err) {
                console.error('Speech synthesis failed:', err);
                if (onError) onError(err);
                reject(err);
            }
        });
    },

    /**
     * Create voice selector UI element
     * @param {Object} options - Configuration options
     * @param {Function} options.onChange - Callback when voice changes
     * @returns {HTMLElement} - Voice selector container
     */
    createVoiceSelector(options = {}) {
        const { onChange } = options;

        const container = document.createElement('div');
        container.className = 'audio-provider-container'; // Match audio provider styling

        const label = document.createElement('label');
        label.setAttribute('for', 'voiceSelect');
        label.textContent = '語音合成聲音：';

        const select = document.createElement('select');
        select.id = 'voiceSelect';

        // Populate with voices
        this.populateVoiceSelector(select);

        // Add event listener
        select.addEventListener('change', () => {
            this.setPreferredVoice(select.value);
            if (onChange) onChange(select.value);
        });

        container.appendChild(label);
        container.appendChild(select);

        return container;
    },

    /**
     * Populate a voice selector element with available voices
     * @param {HTMLSelectElement} selectElement - The select element to populate
     */
    populateVoiceSelector(selectElement) {
        if (!selectElement) return;

        // Clear existing options
        selectElement.innerHTML = '';

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '預設語音';
        selectElement.appendChild(defaultOption);

        // Filter for English voices first, then add others
        const englishVoices = this.voices.filter(voice => voice.lang.includes('en'));
        const otherVoices = this.voices.filter(voice => !voice.lang.includes('en'));

        // Add English voices with a group
        if (englishVoices.length > 0) {
            const englishGroup = document.createElement('optgroup');
            englishGroup.label = '英文語音';

            englishVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.voiceURI;
                option.textContent = `${voice.name} (${voice.lang})`;
                englishGroup.appendChild(option);
            });

            selectElement.appendChild(englishGroup);
        }

        // Add other voices with a group
        if (otherVoices.length > 0) {
            const otherGroup = document.createElement('optgroup');
            otherGroup.label = '其他語音';

            otherVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.voiceURI;
                option.textContent = `${voice.name} (${voice.lang})`;
                otherGroup.appendChild(option);
            });

            selectElement.appendChild(otherGroup);
        }

        // Set selected value from stored preference
        if (this.preferredVoiceURI) {
            selectElement.value = this.preferredVoiceURI;
        }
    },

    /**
     * Create audio provider selector UI element
     * @param {Object} options - Configuration options
     * @param {Function} options.onChange - Callback when provider changes
     * @returns {HTMLElement} - Provider selector container
     */
    createProviderSelector(options = {}) {
        const { onChange } = options;

        const container = document.createElement('div');
        container.className = 'audio-provider-container';

        const label = document.createElement('label');
        label.setAttribute('for', 'audioProviderSelect');
        label.textContent = '音訊提供者：';

        const select = document.createElement('select');
        select.id = 'audioProviderSelect';

        // Get available providers
        const providers = this.getAvailableProviders();

        // Add options for each provider
        providers.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider;

            // Translate provider names to Traditional Chinese
            switch(provider) {
                case this.providers.FREEDIC:
                    option.textContent = '英文詞典 API';
                    break;
                case this.providers.SPEECH_SYNTHESIS:
                    option.textContent = '瀏覽器語音合成';
                    break;
                default:
                    option.textContent = provider;
            }

            select.appendChild(option);
        });

        // Set default value
        select.value = this.currentProvider;

        // Add change event listener
        select.addEventListener('change', () => {
            this.setProvider(select.value);
            if (onChange) onChange(select.value);
        });

        container.appendChild(label);
        container.appendChild(select);

        return container;
    },

    /**
     * Create pronunciation speed control UI element
     * @param {Object} options - Configuration options
     * @param {Function} options.onChange - Callback when speed changes
     * @returns {HTMLElement} - Speed control container
     */
    createSpeedControl(options = {}) {
        const { onChange } = options;

        const container = document.createElement('div');
        container.className = 'speed-control-container';

        const label = document.createElement('label');
        label.setAttribute('for', 'speedControl');
        label.textContent = '發音速度：';

        const controlGroup = document.createElement('div');
        controlGroup.className = 'speed-control-group';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = 'speedControl';
        slider.className = 'speed-slider';
        slider.min = '0.25';
        slider.max = '2.0';
        slider.step = '0.05';
        slider.value = this.pronunciationSpeed.toString();

        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'speed-value';
        valueDisplay.textContent = `${this.pronunciationSpeed.toFixed(1)}x`;

        // Update display and call onChange when slider changes
        slider.addEventListener('input', () => {
            const speed = parseFloat(slider.value);
            valueDisplay.textContent = `${speed.toFixed(1)}x`;
            this.setPronunciationSpeed(speed);
            if (onChange) onChange(speed);
        });

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.className = 'speed-reset-btn';
        resetBtn.textContent = '重置';
        resetBtn.title = '重置為預設速度 (1.0x)';
        resetBtn.addEventListener('click', () => {
            slider.value = '1.0';
            valueDisplay.textContent = '1.0x';
            this.setPronunciationSpeed(1.0);
            if (onChange) onChange(1.0);
        });

        controlGroup.appendChild(slider);
        controlGroup.appendChild(valueDisplay);
        controlGroup.appendChild(resetBtn);

        container.appendChild(label);
        container.appendChild(controlGroup);

        return container;
    }
};

// Initialize the audio service when the script loads
audioService.init();

// Maintain backward compatibility with old cloudAudioService reference
const cloudAudioService = audioService;
