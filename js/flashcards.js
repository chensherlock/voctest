// DOM elements
const flashcard = document.getElementById('flashcard');
const frontWord = document.getElementById('frontWord');
const backWord = document.getElementById('backWord');
const playAudioBtn = document.getElementById('playAudio');
const prevCard = document.getElementById('prevCard');
const nextCard = document.getElementById('nextCard');
const shuffleCards = document.getElementById('shuffleCards');
const startOver = document.getElementById('startOver');
const unitSelect = document.getElementById('unitSelect');
const cardDirection = document.getElementById('cardDirection');
const currentCardNumber = document.getElementById('currentCardNumber');
const totalCards = document.getElementById('totalCards');
const voiceSelect = document.getElementById('voiceSelect');
const refreshVoicesBtn = document.getElementById('refreshVoices');

// State variables
let currentWords = [];
let currentIndex = 0;
let currentDirection = 'english-chinese'; // or 'chinese-english'
let currentUnitId = 'all';
let audioLoading = false;
let allUnitWords = []; // Store all words from the unit for range selection

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Check if a unit was specified in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const unitId = urlParams.get('unit');
    
    // Populate unit select dropdown
    populateUnitSelect();
    
    // Set initial unit if specified in URL
    if (unitId) {
        unitSelect.value = unitId;
        currentUnitId = unitId;
    }
    
    // Load words based on initial settings
    loadWords();
    
    // Set up event listeners
    flashcard.addEventListener('click', flipCard);
    prevCard.addEventListener('click', showPreviousCard);
    nextCard.addEventListener('click', showNextCard);
    shuffleCards.addEventListener('click', shuffleCurrentWords);
    startOver.addEventListener('click', resetFlashcards);
    unitSelect.addEventListener('change', handleUnitChange);
    cardDirection.addEventListener('change', handleDirectionChange);
    playAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the card from flipping
        playCurrentAudio();
    });
    
    // Create audio provider selector if it doesn't exist
    createAudioProviderSelector();
    
    // Create vocabulary range selector
    createVocabRangeSelector();
    
    // Initialize voice selector
    initializeVoiceSelector();
});

// Create audio provider selector dropdown
function createAudioProviderSelector() {
    const settingsContainer = document.querySelector('.flashcard-settings');
    
    if (!settingsContainer) return;
    
    // Check if the selector already exists
    if (document.getElementById('audioProviderSelect')) return;
    
    const providerFormGroup = document.createElement('div');
    providerFormGroup.className = 'form-group';
    
    const providerLabel = document.createElement('label');
    providerLabel.setAttribute('for', 'audioProviderSelect');
    providerLabel.textContent = '音訊提供者：';
    
    const providerSelect = document.createElement('select');
    providerSelect.id = 'audioProviderSelect';
    
    // Get available providers from the cloud service
    const providers = cloudAudioService.getAvailableProviders();
    
    // Add options for each provider
    providers.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider;
        
        // Translate provider names to Traditional Chinese
        switch(provider) {
            case 'google':
                option.textContent = 'Google 語音合成';
                break;
            case 'microsoft':
                option.textContent = 'Microsoft Azure 語音';
                break;
            case 'forvo':
                option.textContent = 'Forvo 使用者發音';
                break;
            default:
                option.textContent = provider;
        }
        
        providerSelect.appendChild(option);
    });
    
    // Set default value
    providerSelect.value = cloudAudioService.currentProvider;
    
    // Add change event listener
    providerSelect.addEventListener('change', () => {
        cloudAudioService.setProvider(providerSelect.value);
        // Update status
        updateAudioStatus(`已更改音訊提供者為 ${providerSelect.value}`);
    });
    
    // Append elements
    providerFormGroup.appendChild(providerLabel);
    providerFormGroup.appendChild(providerSelect);
    settingsContainer.appendChild(providerFormGroup);
}

// Update audio status indicator
function updateAudioStatus(message) {
    // Create status element if it doesn't exist
    let statusEl = document.querySelector('.audio-status');
    
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.className = 'audio-status';
        const container = document.querySelector('.flashcard-container');
        if (container) {
            container.appendChild(statusEl);
        }
    }
    
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    // Hide the status after 2 seconds
    setTimeout(() => {
        statusEl.style.opacity = '0';
        setTimeout(() => {
            statusEl.style.display = 'none';
            statusEl.style.opacity = '1';
        }, 500);
    }, 2000);
}

// Populate the unit select dropdown
function populateUnitSelect() {
    const units = getAllUnits();
    
    units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.id;
        option.textContent = unit.title;
        unitSelect.appendChild(option);
    });
}

// Load words based on current unit and settings
function loadWords() {
    // Store all words from the current unit
    if (currentUnitId === 'all') {
        allUnitWords = getAllWords();
    } else {
        allUnitWords = getWordsFromUnit(currentUnitId);
    }
    
    // Check if we need to apply a range filter
    const rangeSelect = document.getElementById('vocabRangeSelect');
    if (rangeSelect && rangeSelect.value !== 'all') {
        const [start, end] = rangeSelect.value.split('-').map(Number);
        currentWords = allUnitWords.slice(start - 1, end);
    } else {
        currentWords = [...allUnitWords]; // Use all words if no range is selected
    }
    
    if (currentWords.length > 0) {
        // Shuffle words initially
        shuffleCurrentWords();
        // Reset to first card
        currentIndex = 0;
        updateCardDisplay();
        updateNavigationButtons();
        totalCards.textContent = currentWords.length;
    } else {
        frontWord.textContent = "無詞彙可用";
        backWord.textContent = "";
        totalCards.textContent = "0";
        currentCardNumber.textContent = "0";
        disableNavigationButtons();
    }
    
    // Update custom range selection options based on the number of words
    updateCustomRangeOptions();
}

// Update the flashcard display
function updateCardDisplay() {
    if (currentWords.length === 0) return;
    
    const word = currentWords[currentIndex];
    
    if (currentDirection === 'english-chinese') {
        frontWord.textContent = word.english;
        backWord.textContent = word.chinese;
    } else {
        frontWord.textContent = word.chinese;
        backWord.textContent = word.english;
    }
    
    // Remove flipped class if present
    flashcard.classList.remove('flipped');
    
    // Update card counter
    currentCardNumber.textContent = (currentIndex + 1).toString();
    
    // Preload audio for smoother experience
    preloadWordAudio(word);
}

// Preload audio for the current word
function preloadWordAudio(word) {
    // Only preload if in English-to-Chinese mode
    if (currentDirection === 'english-chinese') {
        // Silently preload from cloud
        cloudAudioService.getWordAudio(word.english)
            .then(() => {
                // Audio is now cached in the service
            })
            .catch(() => {
                // Ignore errors during preloading
            });
    }
}

// Flip the current flashcard
function flipCard() {
    flashcard.classList.toggle('flipped');
}

// Show the next card
function showNextCard() {
    if (currentIndex < currentWords.length - 1) {
        currentIndex++;
        updateCardDisplay();
        updateNavigationButtons();
    }
}

// Show the previous card
function showPreviousCard() {
    if (currentIndex > 0) {
        currentIndex--;
        updateCardDisplay();
        updateNavigationButtons();
    }
}

// Shuffle the current words
function shuffleCurrentWords() {
    currentWords = [...currentWords].sort(() => 0.5 - Math.random());
    currentIndex = 0;
    updateCardDisplay();
    updateNavigationButtons();
}

// Reset flashcards to beginning
function resetFlashcards() {
    currentIndex = 0;
    updateCardDisplay();
    updateNavigationButtons();
}

// Handle unit selection change
function handleUnitChange() {
    currentUnitId = unitSelect.value;
    loadWords();
}

// Handle direction change
function handleDirectionChange() {
    currentDirection = cardDirection.value;
    updateCardDisplay();
}

// Update navigation button states
function updateNavigationButtons() {
    prevCard.disabled = currentIndex === 0;
    nextCard.disabled = currentIndex === currentWords.length - 1;
}

// Disable all navigation buttons
function disableNavigationButtons() {
    prevCard.disabled = true;
    nextCard.disabled = true;
    shuffleCards.disabled = true;
    startOver.disabled = true;
}

// Play audio for current word
function playCurrentAudio() {
    if (currentWords.length === 0) return;
    if (audioLoading) return; // Prevent multiple clicks
    
    const word = currentWords[currentIndex];
    updateAudioStatus('載入音訊中...');
    audioLoading = true;
    
    // Show loading state
    toggleAudioLoading(true);
    
    // Use cloud audio service directly
    cloudAudioService.getWordAudio(word.english)
        .then(cloudUrl => {
            updateAudioStatus('正在播放音訊...');
            const cloudAudio = new Audio();
            cloudAudio.crossOrigin = 'anonymous'; // Allow cross-origin requests
            cloudAudio.src = cloudUrl;
            
            cloudAudio.onloadeddata = () => {
                cloudAudio.play()
                    .then(() => {
                        toggleAudioLoading(false);
                        audioLoading = false;
                    })
                    .catch(err => {
                        console.error('音訊播放錯誤:', err);
                        toggleAudioLoading(false);
                        audioLoading = false;
                        updateAudioStatus('無法播放音訊');
                    });
            };
            
            cloudAudio.onerror = () => {
                console.error('音訊載入錯誤');
                
                // Fallback to browser's native speech synthesis
                if ('speechSynthesis' in window && currentDirection === 'english-chinese') {
                    const wordToSpeak = currentWords[currentIndex].english;
                    const utterance = new SpeechSynthesisUtterance(wordToSpeak);
                    utterance.lang = 'en-US';
                    
                    // Use the user's preferred voice if available
                    const preferredVoice = getSpeechSynthesisVoice();
                    if (preferredVoice) {
                        utterance.voice = preferredVoice;
                    }
                    
                    // Show voice selector when using speech synthesis
                    const voiceSelectorContainer = document.getElementById('voiceSelectorContainer') || createVoiceSelector();
                    if (voiceSelectorContainer) {
                        voiceSelectorContainer.style.display = 'block';
                    }
                    
                    speechSynthesis.speak(utterance);
                    updateAudioStatus('使用瀏覽器語音合成');
                } else {
                    updateAudioStatus('無法載入音訊');
                }
                
                toggleAudioLoading(false);
                audioLoading = false;
            };
            
            cloudAudio.load();
        })
        .catch(err => {
            console.error('音訊獲取錯誤:', err);
            
            // Fallback to browser's native speech synthesis on network errors too
            if ('speechSynthesis' in window && currentDirection === 'english-chinese') {
                const wordToSpeak = currentWords[currentIndex].english;
                const utterance = new SpeechSynthesisUtterance(wordToSpeak);
                utterance.lang = 'en-US';
                
                // Use the user's preferred voice if available
                const preferredVoice = getSpeechSynthesisVoice();
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }
                
                // Show voice selector when using speech synthesis
                const voiceSelectorContainer = document.getElementById('voiceSelectorContainer') || createVoiceSelector();
                if (voiceSelectorContainer) {
                    voiceSelectorContainer.style.display = 'block';
                }
                
                speechSynthesis.speak(utterance);
                updateAudioStatus('使用瀏覽器語音合成');
            } else {
                updateAudioStatus('無法獲取音訊');
            }
            
            toggleAudioLoading(false);
            audioLoading = false;
        });
}

// Toggle audio loading state
function toggleAudioLoading(isLoading) {
    if (!playAudioBtn) return;
    
    if (isLoading) {
        playAudioBtn.classList.add('loading');
        playAudioBtn.querySelector('i').className = 'fas fa-spinner fa-spin';
    } else {
        playAudioBtn.classList.remove('loading');
        playAudioBtn.querySelector('i').className = 'fas fa-volume-up';
    }
}

// Create vocabulary range selector
function createVocabRangeSelector() {
    const settingsContainer = document.querySelector('.flashcard-settings');
    
    if (!settingsContainer) return;
    
    // Check if the selector already exists
    if (document.getElementById('vocabRangeSelectContainer')) return;
    
    // Create container for all range selection elements
    const rangeContainer = document.createElement('div');
    rangeContainer.id = 'vocabRangeSelectContainer';
    rangeContainer.className = 'form-group range-selector-container';
    
    // Create label
    const rangeLabel = document.createElement('label');
    rangeLabel.textContent = '詞彙範圍：';
    
    // Create standard range selector
    const rangeSelect = document.createElement('select');
    rangeSelect.id = 'vocabRangeSelect';
    rangeSelect.className = 'range-select';
    
    // Add option for all words
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = '全部';
    rangeSelect.appendChild(allOption);
    
    // Add option for custom range
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = '自定義範圍';
    rangeSelect.appendChild(customOption);
    
    // Add common predefined ranges
    const ranges = [
        { value: '1-10', text: '1-10' },
        { value: '11-20', text: '11-20' },
        { value: '21-30', text: '21-30' }
    ];
    
    ranges.forEach(range => {
        const option = document.createElement('option');
        option.value = range.value;
        option.textContent = range.text;
        rangeSelect.appendChild(option);
    });
    
    // Set default value
    rangeSelect.value = 'all';
    
    // Create custom range div (initially hidden)
    const customRangeDiv = document.createElement('div');
    customRangeDiv.id = 'customRangeDiv';
    customRangeDiv.className = 'custom-range-inputs';
    customRangeDiv.style.display = 'none';
    
    // Create start range selector
    const startContainer = document.createElement('div');
    startContainer.className = 'custom-range-input';
    
    const startLabel = document.createElement('label');
    startLabel.setAttribute('for', 'startVocabSelect');
    startLabel.textContent = '起始詞彙：';
    
    const startSelect = document.createElement('select');
    startSelect.id = 'startVocabSelect';
    
    // Create end range selector
    const endContainer = document.createElement('div');
    endContainer.className = 'custom-range-input';
    
    const endLabel = document.createElement('label');
    endLabel.setAttribute('for', 'endVocabSelect');
    endLabel.textContent = '結束詞彙：';
    
    const endSelect = document.createElement('select');
    endSelect.id = 'endVocabSelect';
    
    // Apply button for custom range
    const applyBtn = document.createElement('button');
    applyBtn.textContent = '應用範圍';
    applyBtn.id = 'applyCustomRange';
    applyBtn.className = 'btn-apply-range';
    applyBtn.type = 'button';
    
    // Append elements
    startContainer.appendChild(startLabel);
    startContainer.appendChild(startSelect);
    
    endContainer.appendChild(endLabel);
    endContainer.appendChild(endSelect);
    
    customRangeDiv.appendChild(startContainer);
    customRangeDiv.appendChild(endContainer);
    customRangeDiv.appendChild(applyBtn);
    
    rangeContainer.appendChild(rangeLabel);
    rangeContainer.appendChild(rangeSelect);
    rangeContainer.appendChild(customRangeDiv);
    
    settingsContainer.appendChild(rangeContainer);
    
    // Add event listeners
    rangeSelect.addEventListener('change', () => {
        if (rangeSelect.value === 'custom') {
            customRangeDiv.style.display = 'block';
            updateCustomRangeOptions();
        } else {
            customRangeDiv.style.display = 'none';
            handleRangeChange(rangeSelect.value);
        }
    });
    
    applyBtn.addEventListener('click', applyCustomRange);
    
    // Update unit change handler to update custom range options
    unitSelect.addEventListener('change', () => {
        if (rangeSelect.value === 'custom') {
            updateCustomRangeOptions();
        }
    });
}

// Handle range selection change
function handleRangeChange(range) {
    if (range === 'all') {
        currentWords = allUnitWords;
    } else if (range === 'custom') {
        // Do nothing, will be handled by applyCustomRange
        return;
    } else {
        const [start, end] = range.split('-').map(Number);
        currentWords = allUnitWords.slice(start - 1, end);
    }
    
    if (currentWords.length > 0) {
        // Reset to first card
        currentIndex = 0;
        updateCardDisplay();
        updateNavigationButtons();
        totalCards.textContent = currentWords.length;
        updateAudioStatus(`已套用詞彙範圍，共 ${currentWords.length} 個詞彙`);
    } else {
        frontWord.textContent = "無詞彙可用";
        backWord.textContent = "";
        totalCards.textContent = "0";
        currentCardNumber.textContent = "0";
        disableNavigationButtons();
    }
}

// Update custom range dropdown options
function updateCustomRangeOptions() {
    const startSelect = document.getElementById('startVocabSelect');
    const endSelect = document.getElementById('endVocabSelect');
    
    if (!startSelect || !endSelect) return;
    
    // Clear existing options
    startSelect.innerHTML = '';
    endSelect.innerHTML = '';
    
    if (allUnitWords.length === 0) return;
    
    // Populate options with vocabulary words
    allUnitWords.forEach((word, index) => {
        const startOption = document.createElement('option');
        startOption.value = index;
        startOption.textContent = `${index + 1}. ${word.english}`;
        startSelect.appendChild(startOption);
        
        const endOption = document.createElement('option');
        endOption.value = index;
        endOption.textContent = `${index + 1}. ${word.english}`;
        endSelect.appendChild(endOption);
    });
    
    // Set default selections (first and last words)
    startSelect.value = '0';
    endSelect.value = (allUnitWords.length - 1).toString();
    
    // Add event listeners for validation
    startSelect.addEventListener('change', validateCustomRange);
    endSelect.addEventListener('change', validateCustomRange);
}

// Validate that the start index is not greater than the end index
function validateCustomRange() {
    const startSelect = document.getElementById('startVocabSelect');
    const endSelect = document.getElementById('endVocabSelect');
    
    if (!startSelect || !endSelect) return;
    
    const startIndex = parseInt(startSelect.value);
    const endIndex = parseInt(endSelect.value);
    
    if (startIndex > endIndex) {
        // If start is after end, set end to start
        endSelect.value = startSelect.value;
    }
}

// Apply custom vocabulary range
function applyCustomRange() {
    const startSelect = document.getElementById('startVocabSelect');
    const endSelect = document.getElementById('endVocabSelect');
    
    if (!startSelect || !endSelect) return;
    
    const startIndex = parseInt(startSelect.value);
    const endIndex = parseInt(endSelect.value);
    
    // Slice the vocabulary list based on the selected range
    currentWords = allUnitWords.slice(startIndex, endIndex + 1);
    
    // Reset to first card
    currentIndex = 0;
    updateCardDisplay();
    updateNavigationButtons();
    totalCards.textContent = currentWords.length;
    
    // Show feedback to user
    const startWord = allUnitWords[startIndex].english;
    const endWord = allUnitWords[endIndex].english;
    updateAudioStatus(`已套用詞彙範圍：${startWord} 到 ${endWord}`);
}

// Initialize voice selector for speech synthesis
function initializeVoiceSelector() {
    // Populate with available voices
    populateVoiceSelector(voiceSelect);
    
    // Add event listener
    voiceSelect.addEventListener('change', function() {
        const voiceURI = this.value;
        localStorage.setItem('preferredVoice', voiceURI);
        updateAudioStatus(`已更改語音合成聲音`);
    });
    
    // Add refresh button event listener
    refreshVoicesBtn.addEventListener('click', () => {
        populateVoiceSelector(voiceSelect);
        updateAudioStatus('已更新可用語音列表');
    });
}

// Populate voice selector with available voices
function populateVoiceSelector(selectElement) {
    if (!selectElement) return;
    
    // Clear existing options
    selectElement.innerHTML = '';
    
    // Get all available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '預設語音';
    selectElement.appendChild(defaultOption);
    
    // Filter for English voices first, then add others
    const englishVoices = voices.filter(voice => voice.lang.includes('en'));
    const otherVoices = voices.filter(voice => !voice.lang.includes('en'));
    
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
    
    // Set selected value from localStorage if available
    const preferredVoice = localStorage.getItem('preferredVoice');
    if (preferredVoice) {
        selectElement.value = preferredVoice;
    }
}

// Get the user's preferred speech synthesis voice
function getSpeechSynthesisVoice() {
    const preferredVoiceURI = localStorage.getItem('preferredVoice');
    if (!preferredVoiceURI) return null;
    
    const voices = window.speechSynthesis.getVoices();
    return voices.find(voice => voice.voiceURI === preferredVoiceURI);
}

// Speech synthesis voices can load asynchronously
if ('speechSynthesis' in window) {
    // Check if voices are already loaded
    if (window.speechSynthesis.getVoices().length > 0) {
        initializeVoiceSelector();
    }
    
    // Add event listener for when voices change/load
    window.speechSynthesis.onvoiceschanged = function() {
        initializeVoiceSelector();
    };
}