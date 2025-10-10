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

    const providerContainer = audioService.createProviderSelector({
        onChange: (provider) => {
            showAudioStatus(`已更改音訊提供者為 ${provider}`);
        }
    });

    headerEl.appendChild(providerContainer);
}

// Create voice selector for speech synthesis
function createVoiceSelector() {
    // Check if selector already exists
    if (document.getElementById('voiceSelectorContainer')) return;

    const voiceSelectorContainer = audioService.createVoiceSelector({
        onChange: (voiceURI) => {
            showAudioStatus('已更改語音合成聲音');
        }
    });

    voiceSelectorContainer.id = 'voiceSelectorContainer';
    voiceSelectorContainer.style.display = 'none'; // Hidden by default

    // Add to page - after audio provider if it exists
    const audioProviderContainer = document.querySelector('.audio-provider-container');
    if (audioProviderContainer) {
        audioProviderContainer.parentNode.insertBefore(voiceSelectorContainer, audioProviderContainer.nextSibling);
    } else {
        const unitHeader = document.querySelector('#unitHeader');
        if (unitHeader) {
            unitHeader.appendChild(voiceSelectorContainer);
        }
    }

    return voiceSelectorContainer;
}

// Speech synthesis voices can load asynchronously
if ('speechSynthesis' in window) {
    // Check if voices are already loaded
    if (window.speechSynthesis.getVoices().length > 0) {
        createVoiceSelector();
    }

    // Add event listener for when voices change/load
    window.speechSynthesis.onvoiceschanged = function() {
        createVoiceSelector();
    };
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
        // Ensure units index is loaded
        await preloadAllUnits();
        const units = getAllUnits();

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
async function showUnitDetail(unitId) {
    currentUnitId = unitId;
    const unit = getUnitById(unitId);

    if (unit) {
        // Ensure unit words are loaded
        await getWordsFromUnit(unitId);

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

        // Get Chinese translations as array for multi-line display
        const chineseTranslations = getChineseTranslations(word);
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
                .map(example => {
                    // Replace [word] with highlighted word (remove brackets, add blue color)
                    const formattedExample = example.replace(/\[([^\]]+)\]/g, '<span class="highlight-word">$1</span>');
                    return `<div class="example-line">${formattedExample}</div>`;
                })
                .join('');
        }

        // Check if word has video URL
        const hasVideo = word.video && word.video.trim() !== '';
        const videoButton = hasVideo ?
            `<button class="video-btn" data-video-url="${word.video}" aria-label="Watch video">
                <i class="fas fa-video"></i>
            </button>` : '';

        wordItem.innerHTML = `
            <div class="word-content">
                <span class="word-number">${wordNumber}.</span>
                <span class="english">${word.english}</span>
                <div class="chinese">${chineseHTML}</div>
                ${hasExample ? `<div class="examples">${examplesHTML}</div>` : ''}
            </div>
            <div class="word-actions">
                ${videoButton}
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

        // Add event listener for video button if it exists
        if (hasVideo) {
            const videoBtn = wordItem.querySelector('.video-btn');
            videoBtn.addEventListener('click', () => {
                const videoUrl = videoBtn.dataset.videoUrl;
                window.open(videoUrl, '_blank');
            });
        }

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