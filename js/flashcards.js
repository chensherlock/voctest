// DOM elements
const flashcard = document.getElementById('flashcard');
const frontWord = document.getElementById('frontWord');
const backWord = document.getElementById('backWord');
const frontHint = document.getElementById('frontHint');
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
const flashcardBack = document.querySelector('.flashcard-back');

// State variables
let currentWords = [];
let currentIndex = 0;
let currentDirection = 'english-chinese'; // or 'chinese-english'
let selectedUnitIds = []; // Array of selected unit IDs
let audioLoading = false;
let allUnitWords = []; // Store all words from the unit for range selection

function fitTextToDivFast(container, textElement, translations) {
  // Get available space from the container (flashcard-back)
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // Handle both array (multi-line) and string (single line) inputs
  const isMultiLine = Array.isArray(translations);

  // Set the text content based on type
  if (isMultiLine) {
    // Create multi-line structure
    textElement.innerHTML = '';
    translations.forEach(translation => {
      const line = document.createElement('div');
      line.className = 'chinese-line';
      line.textContent = translation;
      textElement.appendChild(line);
    });
  } else {
    // Single line text
    textElement.textContent = translations;
  }

  // Account for hint and audio button space
  const hint = container.querySelector('.flashcard-front-hint');
  const audioBtn = container.querySelector('.audio-btn');

  let reservedHeight = 40; // Base padding
  if (hint) reservedHeight += hint.offsetHeight + 20; // Hint + margin
  if (audioBtn) reservedHeight += audioBtn.offsetHeight + 20; // Audio button + margin

  const maxWidth = containerWidth - 40; // Account for padding
  const maxHeight = containerHeight - reservedHeight;

  let min = 10, max = 200, mid;
  while (min <= max) {
    mid = Math.floor((min + max) / 2);
    textElement.style.fontSize = mid + 'px';

    // For multi-line, check if all lines fit within the container
    if (textElement.scrollWidth <= maxWidth && textElement.scrollHeight <= maxHeight) {
      min = mid + 1; // try bigger
    } else {
      max = mid - 1; // too big
    }
  }
  textElement.style.fontSize = max + 'px';
}

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

    // Sort units: default units first, then others
    units.sort((a, b) => {
        if (a.default && !b.default) return -1;
        if (!a.default && b.default) return 1;
        return 0;
    });

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

    // Scroll to top of page
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

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

    currentWords = [...allUnitWords]; // Start with main words

    // Add phrases as vocabulary items
    for (const word of allUnitWords) {
        if (word.phrases && Array.isArray(word.phrases) && word.phrases.length > 0) {
            for (const phrase of word.phrases) {
                if (typeof phrase === 'object' && phrase.english && phrase.chinese) {
                    // Create a vocabulary item from the phrase
                    const phraseItem = {
                        english: phrase.english,
                        chinese: [phrase.chinese],
                        type: 'phrase',
                        parentWord: word.english,
                        pronunciation: word.pronunciation,
                        example: [`Example: ${word.example ? word.example[0] : ''}`]
                    };
                    currentWords.push(phraseItem);
                }
            }
        }
    }

    // Add related words as vocabulary items
    for (const word of allUnitWords) {
        if (word.related && Array.isArray(word.related) && word.related.length > 0) {
            for (const relatedWord of word.related) {
                if (typeof relatedWord === 'object' && relatedWord.english) {
                    // Create a vocabulary item from the related word
                    const relatedItem = {
                        english: relatedWord.english,
                        pronunciation: relatedWord.pronunciation || word.pronunciation,
                        chinese: Array.isArray(relatedWord.chinese) ? relatedWord.chinese : [relatedWord.chinese],
                        type: 'related',
                        parentWord: word.english,
                        example: [`Related to: ${word.english}`]
                    };
                    currentWords.push(relatedItem);
                }
            }
        }
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

    // Clear and update back of card with main content + related words if available
    const flashcardBack = document.querySelector('.flashcard-back');
    if (flashcardBack) {
        flashcardBack.innerHTML = '';
        
        // Create front hint
        const hintElement = document.createElement('div');
        hintElement.className = 'flashcard-front-hint';
        hintElement.id = 'frontHint';
        if (currentDirection === 'english-chinese') {
            hintElement.textContent = word.english;
        } else {
            hintElement.textContent = chineseTranslations.join(' / ');
        }
        flashcardBack.appendChild(hintElement);

        // Create main word/translation element
        const backWordElement = document.createElement('div');
        backWordElement.className = 'flashcard-word';
        backWordElement.id = 'backWord';
        
        if (currentDirection === 'english-chinese') {
            // Display Chinese translations
            chineseTranslations.forEach(translation => {
                const line = document.createElement('div');
                line.className = 'chinese-line';
                line.textContent = translation;
                backWordElement.appendChild(line);
            });
        } else {
            // Display English word
            backWordElement.textContent = word.english;
        }
        
        flashcardBack.appendChild(backWordElement);

        // Add parent word indicator for phrase or related items
        if (word.type === 'phrase' || word.type === 'related') {
            const parentContainer = document.createElement('div');
            parentContainer.className = 'flashcard-item-type';
            
            const typeLabel = document.createElement('span');
            typeLabel.className = `item-type-label ${word.type}`;
            typeLabel.textContent = word.type === 'phrase' ? 'Phrase' : 'Related Word';
            parentContainer.appendChild(typeLabel);
            
            const parentLabel = document.createElement('span');
            parentLabel.className = 'parent-word-label';
            parentLabel.textContent = ` from: ${word.parentWord}`;
            parentContainer.appendChild(parentLabel);
            
            flashcardBack.appendChild(parentContainer);
        }

        // Add related words if available (only for main vocabulary words, not for phrase/related items)
        if (word.related && Array.isArray(word.related) && word.related.length > 0 && !word.type) {
            const relatedContainer = document.createElement('div');
            relatedContainer.className = 'flashcard-related';
            
            const relatedLabel = document.createElement('div');
            relatedLabel.className = 'flashcard-related-label';
            relatedLabel.textContent = '相關詞彙 (點擊查看)';
            relatedContainer.appendChild(relatedLabel);
            
            const relatedList = document.createElement('div');
            relatedList.className = 'flashcard-related-list';
            
            word.related.forEach(related => {
                const relatedItem = document.createElement('button');
                relatedItem.className = 'flashcard-related-item-btn';
                relatedItem.type = 'button';
                
                if (typeof related === 'object' && related.english) {
                    // New format: {english, pronunciation, chinese}
                    const englishSpan = document.createElement('span');
                    englishSpan.className = 'related-english';
                    englishSpan.textContent = related.english;
                    relatedItem.appendChild(englishSpan);
                    
                    if (related.pronunciation) {
                        const pronouncationSpan = document.createElement('span');
                        pronouncationSpan.className = 'related-pronunciation';
                        pronouncationSpan.textContent = ' ' + related.pronunciation;
                        relatedItem.appendChild(pronouncationSpan);
                    }
                    
                    if (related.chinese && Array.isArray(related.chinese)) {
                        const chineseSpan = document.createElement('span');
                        chineseSpan.className = 'related-chinese';
                        chineseSpan.textContent = ' ' + related.chinese.join('; ');
                        relatedItem.appendChild(chineseSpan);
                    }
                    
                    // Add click handler to navigate to related word
                    relatedItem.addEventListener('click', () => {
                        const relatedWordIndex = currentWords.findIndex(w => w.english === related.english);
                        if (relatedWordIndex !== -1) {
                            currentIndex = relatedWordIndex;
                            updateCardDisplay();
                            updateNavigationButtons();
                            currentCardNumber.textContent = (currentIndex + 1).toString();
                            updateProgressBar();
                        }
                    });
                } else {
                    // Old format: string
                    relatedItem.textContent = related;
                }
                
                relatedList.appendChild(relatedItem);
            });
            
            relatedContainer.appendChild(relatedList);
            flashcardBack.appendChild(relatedContainer);
        }

        // Create audio button
        const audioBtn = document.createElement('button');
        audioBtn.className = 'audio-btn';
        audioBtn.id = 'playAudio';
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        flashcardBack.appendChild(audioBtn);
    }

    if (currentDirection === 'english-chinese') {
        // English on front, Chinese on back (multi-line)
        frontWord.textContent = word.english;
    } else {
        // Chinese on front (multi-line), English on back
        frontWord.innerHTML = '';
        chineseTranslations.forEach(translation => {
            const line = document.createElement('div');
            line.className = 'chinese-line';
            line.textContent = translation;
            frontWord.appendChild(line);
        });
    }

    // Remove flipped class if present
    flashcard.classList.remove('flipped');

    // Update card counter
    currentCardNumber.textContent = (currentIndex + 1).toString();

    // Update progress bar
    updateProgressBar();

    // Adjust font size for main word/translation
    adjustBackWordFontSize(currentDirection === 'english-chinese' ? chineseTranslations : word.english);

    // Preload audio for smoother experience
    preloadWordAudio(word);
}

// Adjust back word font size based on content length
function adjustBackWordFontSize(translations) {
    if (!backWord || !flashcardBack) return;

    // Use fitTextToDivFast to dynamically adjust font size
    // Pass the container (flashcard-back), the text element (backWord), and the translations (array or string)
    fitTextToDivFast(flashcardBack, backWord, translations);
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