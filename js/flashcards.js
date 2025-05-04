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

// State variables
let currentWords = [];
let currentIndex = 0;
let currentDirection = 'english-chinese'; // or 'chinese-english'
let currentUnitId = 'all';
let audioLoading = false;

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
    if (currentUnitId === 'all') {
        currentWords = getAllWords();
    } else {
        currentWords = getWordsFromUnit(currentUnitId);
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
        const audioUrl = word.audioUrl;
        
        if (audioUrl) {
            // Try to load local audio first
            const audio = new Audio(audioUrl);
            
            audio.onerror = () => {
                // If local audio fails, silently preload from cloud
                cloudAudioService.getWordAudio(word.english)
                    .then(() => {
                        // Audio is now cached in the service
                    })
                    .catch(() => {
                        // Ignore errors during preloading
                    });
            };
            
            audio.load();
        } else {
            // No local audio, preload from cloud
            cloudAudioService.getWordAudio(word.english)
                .then(() => {
                    // Audio is now cached in the service
                })
                .catch(() => {
                    // Ignore errors during preloading
                });
        }
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
    
    if (word.audioUrl) {
        // Try local audio first
        const audio = new Audio(word.audioUrl);
        
        audio.onloadeddata = () => {
            audio.play()
                .then(() => {
                    toggleAudioLoading(false);
                    audioLoading = false;
                })
                .catch(err => {
                    console.error('音訊播放錯誤:', err);
                    fallbackToCloudAudio(word.english);
                });
        };
        
        audio.onerror = () => {
            // If local audio fails, use cloud audio
            fallbackToCloudAudio(word.english);
        };
        
        audio.load();
    } else {
        // No local audio, use cloud directly
        fallbackToCloudAudio(word.english);
    }
}

// Fallback to cloud audio
function fallbackToCloudAudio(word) {
    cloudAudioService.getWordAudio(word)
        .then(cloudUrl => {
            updateAudioStatus('正在使用雲端音訊...');
            const cloudAudio = new Audio(cloudUrl);
            
            cloudAudio.onloadeddata = () => {
                cloudAudio.play()
                    .then(() => {
                        toggleAudioLoading(false);
                        audioLoading = false;
                    })
                    .catch(err => {
                        console.error('雲端音訊播放錯誤:', err);
                        toggleAudioLoading(false);
                        audioLoading = false;
                        updateAudioStatus('無法播放音訊');
                    });
            };
            
            cloudAudio.onerror = () => {
                console.error('雲端音訊載入錯誤');
                toggleAudioLoading(false);
                audioLoading = false;
                updateAudioStatus('無法載入音訊');
            };
            
            cloudAudio.load();
        })
        .catch(err => {
            console.error('雲端音訊獲取錯誤:', err);
            toggleAudioLoading(false);
            audioLoading = false;
            updateAudioStatus('無法獲取音訊');
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