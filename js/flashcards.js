// DOM elements
const flashcard = document.getElementById('flashcard');
const frontWord = document.getElementById('frontWord');
const backWord = document.getElementById('backWord');
const playAudioBtn = document.getElementById('playAudio');
const prevCard = document.getElementById('prevCard');
const nextCard = document.getElementById('nextCard');
const shuffleCards = document.getElementById('shuffleCards');
const startOver = document.getElementById('startOver');
const cardDirection = document.getElementById('cardDirection');
const currentCardNumber = document.getElementById('currentCardNumber');
const totalCards = document.getElementById('totalCards');
const voiceSelect = document.getElementById('voiceSelect');
const refreshVoicesBtn = document.getElementById('refreshVoices');
const startFlashcardsBtn = document.getElementById('startFlashcards');

// State variables
let currentWords = [];
let currentIndex = 0;
let currentDirection = 'english-chinese'; // or 'chinese-english'
let selectedUnitIds = []; // Array of selected unit IDs
let audioLoading = false;
let allUnitWords = []; // Store all words from the unit for range selection

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Populate unit checkboxes
    await populateUnitCheckboxes();

    // Check if a unit was specified in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const unitId = urlParams.get('unit');

    // Set initial unit if specified in URL
    if (unitId) {
        const checkbox = document.querySelector(`input[value="${unitId}"]`);
        if (checkbox) {
            checkbox.checked = true;
            handleUnitCheckboxChange();
        }
    } else {
        // Select default units
        selectDefaultUnits();
    }

    // Create vocabulary range selector
    await createVocabRangeSelector();

    // Load words based on initial settings
    await loadWords();

    // Set up event listeners
    flashcard.addEventListener('click', flipCard);
    prevCard.addEventListener('click', showPreviousCard);
    nextCard.addEventListener('click', showNextCard);
    shuffleCards.addEventListener('click', shuffleCurrentWords);
    startOver.addEventListener('click', resetFlashcards);
    cardDirection.addEventListener('change', handleDirectionChange);
    startFlashcardsBtn.addEventListener('click', handleStartFlashcards);
    playAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the card from flipping
        playCurrentAudio();
    });

    // Create audio provider selector if it doesn't exist
    createAudioProviderSelector();

    // Create speed control selector
    createSpeedControlSelector();

    // Initialize voice selector
    initializeVoiceSelector();

    // Add keyboard shortcuts
    setupKeyboardShortcuts();

    // Update progress bar width
    updateProgressBar();
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

    // Create options for available providers
    const providers = [
        { value: 'FreeDictionaryAPI', text: '英文詞典 API' },
        { value: 'speechSynthesis', text: '瀏覽器語音合成' }
    ];

    // Add options for each provider
    providers.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider.value;
        option.textContent = provider.text;
        providerSelect.appendChild(option);
    });

    // Set default value - FreeDictionaryAPI
    providerSelect.value = 'FreeDictionaryAPI';

    // Add change event listener
    providerSelect.addEventListener('change', () => {
        // Update audio service provider
        audioService.setProvider(providerSelect.value);

        // If user selects speech synthesis, reload and update voice list
        if (providerSelect.value === 'speechSynthesis') {
            updateAudioStatus(`已更改為直接使用瀏覽器語音合成`);

            // Reload voices and update the voice selector
            audioService.loadVoices();
            if (voiceSelect) {
                audioService.populateVoiceSelector(voiceSelect);
            }
        } else {
            updateAudioStatus(`已更改音訊提供者為 ${providerSelect.value}`);
        }
    });

    // Append elements
    providerFormGroup.appendChild(providerLabel);
    providerFormGroup.appendChild(providerSelect);

    // Insert before the start button
    const startButton = document.getElementById('startFlashcards');
    if (startButton) {
        settingsContainer.insertBefore(providerFormGroup, startButton);
    } else {
        settingsContainer.appendChild(providerFormGroup);
    }
}

// Create pronunciation speed control
function createSpeedControlSelector() {
    const settingsContainer = document.querySelector('.flashcard-settings');
    if (!settingsContainer || document.getElementById('speedControl')) return;

    const speedControlDiv = audioService.createSpeedControl({
        onChange: (speed) => {
            updateAudioStatus(`發音速度已設為 ${speed.toFixed(1)}x`);
        }
    });

    // Add form-group class for consistent styling
    speedControlDiv.classList.add('form-group');

    // Insert before the start button
    const startButton = document.getElementById('startFlashcards');
    if (startButton) {
        settingsContainer.insertBefore(speedControlDiv, startButton);
    } else {
        settingsContainer.appendChild(speedControlDiv);
    }
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

// Populate unit checkboxes
async function populateUnitCheckboxes() {
    await loadUnitsIndex();
    const units = getAllUnits();
    const container = document.getElementById('unitCheckboxContainer');

    units.forEach(unit => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = `unit-checkbox-item${unit.default ? ' default-unit' : ''}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `unit-${unit.id}`;
        checkbox.value = unit.id;
        checkbox.addEventListener('change', handleUnitCheckboxChange);

        const label = document.createElement('label');
        label.setAttribute('for', `unit-${unit.id}`);
        label.textContent = unit.title;

        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        container.appendChild(checkboxItem);
    });

    // Setup "all units" checkbox
    const allCheckbox = document.getElementById('unit-all');
    allCheckbox.addEventListener('change', handleAllUnitsCheckbox);
}

// Select default units on page load
function selectDefaultUnits() {
    const units = getAllUnits();
    units.forEach(unit => {
        if (unit.default) {
            const checkbox = document.querySelector(`input[value="${unit.id}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        }
    });
    handleUnitCheckboxChange();
}

// Handle "all units" checkbox
function handleAllUnitsCheckbox() {
    const allCheckbox = document.getElementById('unit-all');
    const unitCheckboxes = document.querySelectorAll('.unit-checkbox-item input[type="checkbox"]:not(#unit-all)');

    unitCheckboxes.forEach(checkbox => {
        checkbox.checked = allCheckbox.checked;
    });

    handleUnitCheckboxChange();
}

// Handle individual unit checkbox change
async function handleUnitCheckboxChange() {
    const allCheckbox = document.getElementById('unit-all');
    const unitCheckboxes = document.querySelectorAll('.unit-checkbox-item input[type="checkbox"]:not(#unit-all)');

    // Update selected units array
    selectedUnitIds = Array.from(unitCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => parseInt(cb.value));

    // Update "all units" checkbox state
    const allChecked = Array.from(unitCheckboxes).every(cb => cb.checked);
    allCheckbox.checked = allChecked;

    // Update checkbox item styling
    unitCheckboxes.forEach(checkbox => {
        const parent = checkbox.closest('.unit-checkbox-item');
        if (checkbox.checked) {
            parent.classList.add('selected');
        } else {
            parent.classList.remove('selected');
        }
    });

    // Update the "all units" checkbox item styling
    const allCheckboxItem = allCheckbox.closest('.unit-checkbox-item');
    if (allCheckbox.checked) {
        allCheckboxItem.classList.add('selected');
    } else {
        allCheckboxItem.classList.remove('selected');
    }

    // Load words from selected units
    await loadWords();
}

// Handle start flashcards button
async function handleStartFlashcards() {
    if (selectedUnitIds.length === 0) {
        alert('請至少選擇一個單元');
        return;
    }

    // Reload words and start flashcards
    await loadWords();

    // Collapse the settings panel
    collapseSettingsPanel();

    // Show feedback
    updateAudioStatus(`已載入 ${currentWords.length} 個詞彙`);
}

// Collapse settings panel
function collapseSettingsPanel() {
    const settingsPanel = document.querySelector('.flashcard-settings');
    if (!settingsPanel) return;

    // Add collapsed class
    settingsPanel.classList.add('collapsed');

    // Create or update summary text
    let summaryDiv = settingsPanel.querySelector('.settings-summary');
    if (!summaryDiv) {
        summaryDiv = document.createElement('div');
        summaryDiv.className = 'settings-summary';
        summaryDiv.innerHTML = '<i class="fas fa-cog"></i> <span class="summary-text"></span> <i class="fas fa-chevron-down"></i>';
        settingsPanel.insertBefore(summaryDiv, settingsPanel.firstChild);

        // Add click handler to expand
        summaryDiv.addEventListener('click', toggleSettingsPanel);
    }

    // Update summary text
    const summaryText = summaryDiv.querySelector('.summary-text');
    const unitCount = selectedUnitIds.length;
    const wordCount = currentWords.length;
    const direction = cardDirection.value === 'english-chinese' ? '英文→中文' : '中文→英文';
    summaryText.textContent = `${unitCount} 個單元 · ${wordCount} 個詞彙 · ${direction}`;
}

// Expand settings panel
function expandSettingsPanel() {
    const settingsPanel = document.querySelector('.flashcard-settings');
    if (!settingsPanel) return;

    settingsPanel.classList.remove('collapsed');
}

// Toggle settings panel
function toggleSettingsPanel() {
    const settingsPanel = document.querySelector('.flashcard-settings');
    if (!settingsPanel) return;

    if (settingsPanel.classList.contains('collapsed')) {
        expandSettingsPanel();
    } else {
        collapseSettingsPanel();
    }
}

// Load words based on current unit and settings
async function loadWords() {
    // Store all words from selected units
    if (selectedUnitIds.length === 0) {
        allUnitWords = [];
    } else {
        allUnitWords = await getWordsFromUnits(selectedUnitIds);
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

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (!prevCard.disabled) showPreviousCard();
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (!nextCard.disabled) showNextCard();
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                flipCard();
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                playCurrentAudio();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                shuffleCurrentWords();
                break;
        }
    });
}

// Update progress bar width
function updateProgressBar() {
    const progressElement = document.querySelector('.flashcard-progress');
    if (progressElement && currentWords.length > 0) {
        const progressPercent = ((currentIndex + 1) / currentWords.length) * 100;
        progressElement.style.setProperty('--progress-width', `${progressPercent}%`);
    }
}

// Update the flashcard display
function updateCardDisplay() {
    if (currentWords.length === 0) return;

    const word = currentWords[currentIndex];

    // Get Chinese translations as array for multi-line display
    const chineseTranslations = getChineseTranslations(word);

    if (currentDirection === 'english-chinese') {
        // English on front, Chinese on back (multi-line)
        frontWord.textContent = word.english;

        // Clear and rebuild backWord with multiple lines
        backWord.innerHTML = '';
        chineseTranslations.forEach(translation => {
            const line = document.createElement('div');
            line.className = 'chinese-line';
            line.textContent = translation;
            backWord.appendChild(line);
        });
    } else {
        // Chinese on front (multi-line), English on back
        frontWord.innerHTML = '';
        chineseTranslations.forEach(translation => {
            const line = document.createElement('div');
            line.className = 'chinese-line';
            line.textContent = translation;
            frontWord.appendChild(line);
        });

        backWord.textContent = word.english;
    }

    // Remove flipped class if present
    flashcard.classList.remove('flipped');

    // Update card counter
    currentCardNumber.textContent = (currentIndex + 1).toString();

    // Update progress bar
    updateProgressBar();

    // Preload audio for smoother experience
    preloadWordAudio(word);
}

// Preload audio for the current word
function preloadWordAudio(word) {
    // Only preload if in English-to-Chinese mode
    if (currentDirection === 'english-chinese') {
        // Silently preload from audio service
        audioService.getWordAudio(word.english)
            .then(() => {
                // Audio is now cached in the service
            })
            .catch(() => {
                // Ignore errors during preloading - we'll use speech synthesis as fallback when needed
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

    // Use audio service
    audioService.playWord(word.english, {
        onStart: () => {
            updateAudioStatus('正在播放發音...');
        },
        onEnd: () => {
            toggleAudioLoading(false);
            audioLoading = false;
        },
        onError: (err) => {
            console.error('Audio error:', err);
            updateAudioStatus('無法播放音訊');
            toggleAudioLoading(false);
            audioLoading = false;
        }
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

// Create vocabulary range selector (now using vocab-range-container like quiz)
async function createVocabRangeSelector() {
    const container = document.getElementById('vocabRangeContainer');
    if (!container) return;

    // Wait for words to be loaded
    if (allUnitWords.length === 0) {
        await loadWords();
    }

    // Create start input
    const startLabel = document.createElement('label');
    startLabel.textContent = '起始：';

    const startInput = document.createElement('input');
    startInput.type = 'number';
    startInput.id = 'vocabRangeStart';
    startInput.min = '1';
    startInput.max = allUnitWords.length.toString();
    startInput.value = '1';

    // Create end input
    const endLabel = document.createElement('label');
    endLabel.textContent = '結束：';

    const endInput = document.createElement('input');
    endInput.type = 'number';
    endInput.id = 'vocabRangeEnd';
    endInput.min = '1';
    endInput.max = allUnitWords.length.toString();
    endInput.value = allUnitWords.length.toString();

    // Append elements
    container.appendChild(startLabel);
    container.appendChild(startInput);
    container.appendChild(endLabel);
    container.appendChild(endInput);

    // Add event listeners to handle range changes
    startInput.addEventListener('change', () => {
        if (parseInt(startInput.value) > parseInt(endInput.value)) {
            startInput.value = endInput.value;
        }
        applyVocabRange();
    });

    endInput.addEventListener('change', () => {
        if (parseInt(endInput.value) < parseInt(startInput.value)) {
            endInput.value = startInput.value;
        }
        applyVocabRange();
    });
}

// Update vocab range inputs when units change
function updateVocabRangeInputs() {
    const startInput = document.getElementById('vocabRangeStart');
    const endInput = document.getElementById('vocabRangeEnd');

    if (startInput && endInput && allUnitWords.length > 0) {
        startInput.max = allUnitWords.length.toString();
        endInput.max = allUnitWords.length.toString();
        endInput.value = allUnitWords.length.toString();
    }
}

// Apply vocabulary range filter
function applyVocabRange() {
    const startInput = document.getElementById('vocabRangeStart');
    const endInput = document.getElementById('vocabRangeEnd');

    if (!startInput || !endInput) return;

    const start = parseInt(startInput.value);
    const end = parseInt(endInput.value);

    if (start && end && start <= end) {
        currentWords = allUnitWords.slice(start - 1, end);

        if (currentWords.length > 0) {
            currentIndex = 0;
            updateCardDisplay();
            updateNavigationButtons();
            totalCards.textContent = currentWords.length;
            updateAudioStatus(`已套用詞彙範圍：${start} 到 ${end}`);
        }
    }
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
    // Use audio service to populate the selector
    audioService.populateVoiceSelector(voiceSelect);

    // Add event listener
    voiceSelect.addEventListener('change', function() {
        audioService.setPreferredVoice(this.value);
        updateAudioStatus(`已更改語音合成聲音`);
    });

    // Add refresh button event listener
    refreshVoicesBtn.addEventListener('click', () => {
        audioService.loadVoices();
        audioService.populateVoiceSelector(voiceSelect);
        updateAudioStatus('已更新可用語音列表');
    });
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