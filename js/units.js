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
            const hasWords = unit.words && unit.words.length > 0;

            const unitCard = document.createElement('div');
            unitCard.className = 'unit-card';
            unitCard.innerHTML = `
                <h3>${unit.title}</h3>
                <p>${unit.words.length} 個詞彙</p>
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
            '[p]': '複數名詞'
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
                const parts = grammarText.match(/vt\.|vi\.|v\.|n\.|adj\.|adv\.|prep\.|conj\.|pron\.|det\.|interj\.|\[C\]|\[U\]|\[S\]|\[P\]/gi);
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
                .map((example, exIndex) => {
                    // Replace [word] with highlighted word (remove brackets, add blue color)
                    const formattedExample = example.replace(/\[([^\]]+)\]/g, '<span class="highlight-word">$1</span>');
                    // Extract the clean sentence for TTS (remove brackets but keep the word)
                    const cleanSentence = example.replace(/\[([^\]]+)\]/g, '$1');
                    return `<div class="example-line">
                        <span class="example-text">${formattedExample}</span>
                        <button class="example-audio-btn" data-sentence="${cleanSentence.replace(/"/g, '&quot;')}" aria-label="Play example sentence">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>`;
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
                <div class="word-main">
                    <div class="word-header">
                        <span class="english">${word.english}</span>
                        ${grammarBadgesHTML}
                        <button class="audio-btn" aria-label="Play pronunciation">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        ${videoButton}
                    </div>
                    <div class="chinese">${chineseHTML}</div>
                    ${hasExample ? `<div class="examples">${examplesHTML}</div>` : ''}
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

        // Add event listeners for example audio buttons
        const exampleAudioBtns = wordItem.querySelectorAll('.example-audio-btn');
        exampleAudioBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const sentence = btn.dataset.sentence;
                playExampleSentence(sentence, btn);
            });
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

// Play audio for example sentence using speech synthesis
function playExampleSentence(sentence, button) {
    if (!sentence) return;

    console.log('Playing example sentence:', sentence);

    // Set loading state
    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    button.classList.add('loading');

    // Function to restore button state
    const restoreButton = () => {
        button.innerHTML = originalIcon;
        button.disabled = false;
        button.classList.remove('loading');
    };

    // Show status message
    showAudioStatus('播放例句中...');

    // Use speech synthesis for sentences
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.lang = 'en-US';
        utterance.rate = 0.9; // Slightly slower for better comprehension

        utterance.onend = () => {
            restoreButton();
        };

        utterance.onerror = (err) => {
            console.error('Speech synthesis error:', err);
            showAudioStatus('無法播放例句');
            restoreButton();
        };

        window.speechSynthesis.speak(utterance);
    } else {
        showAudioStatus('您的瀏覽器不支援語音合成');
        restoreButton();
    }
}