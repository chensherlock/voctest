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

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Check if a unit was specified in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const unitId = urlParams.get('unit');
    
    if (unitId) {
        showUnitDetail(unitId);
    } else {
        displayAllUnits();
    }
    
    // Set up event listeners
    backToUnits.addEventListener('click', () => {
        showUnitsList();
        // Update URL without the unit parameter
        window.history.pushState({}, '', 'units.html');
    });
    
    practiceFlashcards.addEventListener('click', () => {
        window.location.href = `flashcards.html?unit=${currentUnitId}`;
    });
    
    takeQuiz.addEventListener('click', () => {
        window.location.href = `quiz.html?unit=${currentUnitId}`;
    });
    
    // Add audio provider selector if available
    if (typeof cloudAudioService !== 'undefined') {
        createAudioProviderSelector();
    }
});

// Create audio provider selector
function createAudioProviderSelector() {
    const headerEl = document.querySelector('#unitHeader');
    if (!headerEl || document.getElementById('audioProviderSelect')) return;
    
    const providerContainer = document.createElement('div');
    providerContainer.className = 'audio-provider-container';
    
    const providerLabel = document.createElement('label');
    providerLabel.setAttribute('for', 'audioProviderSelect');
    providerLabel.textContent = '音訊提供者：';
    
    const providerSelect = document.createElement('select');
    providerSelect.id = 'audioProviderSelect';
    
    // Get available providers
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
        showAudioStatus(`已更改音訊提供者為 ${providerSelect.value}`);
    });
    
    // Append elements
    providerContainer.appendChild(providerLabel);
    providerContainer.appendChild(providerSelect);
    headerEl.appendChild(providerContainer);
}

// Display status message
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

// Display all available units
async function displayAllUnits() {
    unitsContainer.innerHTML = '';
    try {
        const units = await getAllUnits();

        units.forEach(unit => {
            const unitProgress = userProgress.getUnitProgress(unit.id);
            const hasWords = unit.words && unit.words.length > 0;

            const unitCard = document.createElement('div');
            unitCard.className = 'unit-card';
            unitCard.innerHTML = `
                <h3>${unit.title}</h3>
                <p>${unit.words.length} 個詞彙</p>
                <div class="progress-display">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${unitProgress.percentage}%"></div>
                    </div>
                    <span class="progress-text">${unitProgress.percentage}% 完成</span>
                </div>
                <a href="units.html?unit=${unit.id}" class="btn-small ${!hasWords ? 'disabled' : ''}">${hasWords ? '學習' : '無詞彙'}</a>
            `;

            const studyButton = unitCard.querySelector('a');

            if (hasWords) {
                studyButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    showUnitDetail(unit.id);
                    // Update URL with unit parameter
                    window.history.pushState({}, '', `units.html?unit=${unit.id}`);
                });
            } else {
                // Prevent navigation for empty units
                studyButton.addEventListener('click', (e) => {
                    e.preventDefault();
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
function showUnitDetail(unitId) {
    currentUnitId = unitId;
    const unit = getUnitById(unitId);
    
    if (unit) {
        // Update UI with unit details
        unitNumber.textContent = unit.id;
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
        wordItem.innerHTML = `
            <div class="word-content">
                <span class="word-number">${wordNumber}.</span>
                <span class="english">${word.english}</span>
                <span class="chinese">${word.chinese}</span>
            </div>
            <div class="word-actions">
                <button class="audio-btn" aria-label="Play pronunciation">
                    <i class="fas fa-volume-up"></i>
                </button>
                ${wordProgress.mastered ? '<span class="mastery-badge"><i class="fas fa-check-circle"></i></span>' : ''}
            </div>
        `;
        
        // Add event listener for audio button
        const audioBtn = wordItem.querySelector('.audio-btn');
        audioBtn.addEventListener('click', () => {
            playAudio(word.english);
        });
        
        wordList.appendChild(wordItem);
    });
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
        
        // Use cloud service directly
        useCloudAudio(word, restoreButton);
    } else {
        // No active button, just play the audio without visual feedback
        useCloudAudio(word);
    }
}

// Local fallback if global playAudio isn't available
function localPlayAudio(audioUrl, word, callback) {
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        
        audio.onerror = () => {
            console.log('本地音訊檔案未找到:', audioUrl);
            if (word && typeof cloudAudioService !== 'undefined') {
                useCloudAudio(word, callback);
            } else if (callback) {
                callback();
            }
        };
        
        audio.play().catch(err => {
            console.error('音訊播放錯誤:', err);
            if (word && typeof cloudAudioService !== 'undefined') {
                useCloudAudio(word, callback);
            } else if (callback) {
                callback();
            }
        });
    } else if (word && typeof cloudAudioService !== 'undefined') {
        useCloudAudio(word, callback);
    } else if (callback) {
        callback();
    }
}

// Use cloud audio service for playback
function useCloudAudio(word, callback) {
    //showAudioStatus('使用雲端音訊服務...');
    
    cloudAudioService.getWordAudio(word)
        .then(cloudUrl => {
            console.log('Audio URL:', cloudUrl);

            const cloudAudio = new Audio();
            cloudAudio.crossOrigin = "anonymous"; // Enable CORS handling
            cloudAudio.src = cloudUrl;
            
            cloudAudio.onloadeddata = () => {
                cloudAudio.play()
                    .then(() => {
                        if (callback) callback();
                    })
                    .catch(err => {
                        console.error('雲端音訊播放錯誤:', err);
                        showAudioStatus('無法播放音訊');
                        if (callback) callback();
                    });
            };
            
            cloudAudio.onerror = () => {
                console.error('雲端音訊載入錯誤', cloudAudio.error);
                showAudioStatus('嘗試使用瀏覽器語音合成...');
                                
                // Fallback to browser's native speech synthesis
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(word);
                    utterance.lang = 'en-US';
                    speechSynthesis.speak(utterance);
                    showAudioStatus('使用瀏覽器語音合成');
                } else {
                    showAudioStatus('無法播放音訊');
                }
                                
                if (callback) callback();
            };
            
            cloudAudio.load();
        })
        .catch(err => {
            console.error('雲端音訊獲取錯誤:', err);
            showAudioStatus('無法獲取音訊');
            if (callback) callback();
        });
}