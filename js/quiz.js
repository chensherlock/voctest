// DOM elements
const quizSetup = document.getElementById('quizSetup');
const quizQuestions = document.getElementById('quizQuestions');
const quizResults = document.getElementById('quizResults');
const quizContainer = document.querySelector('.quiz-container');
const unitCheckboxContainer = document.getElementById('unitCheckboxContainer');
const quizType = document.getElementById('quizType');
const questionCount = document.getElementById('questionCount');
const startQuiz = document.getElementById('startQuiz');
const submitAnswer = document.getElementById('submitAnswer');
const prevQuestion = document.getElementById('prevQuestion');
const nextQuestion = document.getElementById('nextQuestion');
const currentQuestion = document.getElementById('currentQuestion');
const totalQuestions = document.getElementById('totalQuestions');
const quizProgress = document.getElementById('quizProgress');
const scoreValue = document.getElementById('scoreValue');
const totalScore = document.getElementById('totalScore');
const resultMessage = document.getElementById('resultMessage');
const quizSummary = document.getElementById('quizSummary');
const retakeQuiz = document.getElementById('retakeQuiz');
const newQuiz = document.getElementById('newQuiz');
const reviewMissed = document.getElementById('reviewMissed');

// State variables
let currentQuizWords = [];
let currentQuizIndex = 0;
let currentQuizScore = 0;
let selectedAnswers = [];
let missedWords = [];
let selectedUnitIds = []; // Array of selected unit IDs
let quizTypeValue = 'multiple-choice';
let quizQuestionCount = 10;
let allUnitWords = []; // Store all words from the selected units for range selection
let autoAdvanceQuestions = true; // Auto-advance to next question after answering

// Helper function to escape HTML special characters
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Cookie helper functions
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

// Helper function to check if a word has valid examples for fill-in-blank
function hasValidExampleForFillInBlank(word) {
    if (!word.example) return false;

    const examples = Array.isArray(word.example) ? word.example : [word.example];
    return examples.some(ex => ex && ex.trim() !== '' && ex.includes('[') && ex.includes(']'));
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Populate unit checkboxes
    await populateUnitSelect();

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

    // Set up event listeners
    startQuiz.addEventListener('click', handleStartQuiz);
    submitAnswer.addEventListener('click', handleSubmitAnswer);
    prevQuestion.addEventListener('click', handlePrevQuestion);
    nextQuestion.addEventListener('click', handleNextQuestion);
    retakeQuiz.addEventListener('click', handleRetakeQuiz);
    newQuiz.addEventListener('click', handleNewQuiz);
    reviewMissed.addEventListener('click', handleReviewMissed);

    // Add listeners for auto-advance checkbox
    const quizType = document.getElementById('quizType');
    const autoAdvanceGroup = document.getElementById('autoAdvanceGroup');
    const autoAdvanceCheckbox = document.getElementById('autoAdvanceQuestions');

    // Initialize checkbox visibility based on current quiz type
    if (quizType.value === 'fill-in-blank') {
        autoAdvanceGroup.style.display = 'block';
    }

    // Show/hide auto-advance checkbox based on quiz type
    quizType.addEventListener('change', () => {
        if (quizType.value === 'fill-in-blank') {
            autoAdvanceGroup.style.display = 'block';
        } else {
            autoAdvanceGroup.style.display = 'none';
        }
    });

    // Update auto-advance state when checkbox changes
    autoAdvanceCheckbox.addEventListener('change', () => {
        autoAdvanceQuestions = autoAdvanceCheckbox.checked;
    });
});

// Populate the unit checkboxes
async function populateUnitSelect() {
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

// Select default units on page load or restore from cookies
function selectDefaultUnits() {
    const units = getAllUnits();
    
    // Try to load saved units from cookie
    const savedUnitIds = getCookie('selectedUnitIds');
    const unitIdsToSelect = savedUnitIds && savedUnitIds.length > 0 ? savedUnitIds : units.filter(u => u.default).map(u => u.id);
    
    units.forEach(unit => {
        const checkbox = document.querySelector(`input[value="${unit.id}"]`);
        if (checkbox) {
            checkbox.checked = unitIdsToSelect.includes(unit.id);
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

    // Save selected units to cookie
    setCookie('selectedUnitIds', selectedUnitIds);

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
    await loadUnitWords();
}

// Load all words from the selected units
async function loadUnitWords() {
    // Store all words from selected units
    if (selectedUnitIds.length === 0) {
        allUnitWords = [];
    } else {
        allUnitWords = await getWordsFromUnits(selectedUnitIds);
    }
}

// Handle unit change
// Unit change handling is now done directly in the checkbox event listeners

// Start a new quiz
async function handleStartQuiz() {
    // Get quiz settings
    // selectedUnitIds is now maintained by the checkbox event listeners
    // so we don't need to update it here

    quizTypeValue = quizType.value;
    quizQuestionCount = parseInt(questionCount.value);

    // Prepare quiz words
    await prepareQuizWords();

    if (currentQuizWords.length > 0) {
        // Reset quiz state
        currentQuizIndex = 0;
        currentQuizScore = 0;
        selectedAnswers = [];
        missedWords = [];

        // Update UI
        totalQuestions.textContent = currentQuizWords.length;
        totalScore.textContent = currentQuizWords.length;

        // Show first question
        displayCurrentQuestion();

        // Show quiz questions section
        quizSetup.style.display = 'none';
        quizQuestions.style.display = 'block';
        quizResults.style.display = 'none';
    } else {
        alert('No words available for this quiz. Please select a different unit.');
    }
}

// Prepare words for the quiz
async function prepareQuizWords() {
    let words = [];

    // Merge words from all selected units and add unitId to each word
    for (const unitId of selectedUnitIds) {
        const unitWords = await getWordsFromUnit(unitId);
        if (!unitWords || unitWords.length === 0) {
            console.warn(`No words found for unit ID: ${unitId}`);
            continue;
        }

        const wordsWithUnitId = unitWords.map(word => ({
            ...word,
            unitId: unitId // Add unitId to each word
        }));
        words = words.concat(wordsWithUnitId);

        // Add phrases as vocabulary items
        for (const word of unitWords) {
            if (word.phrases && Array.isArray(word.phrases) && word.phrases.length > 0) {
                for (const phrase of word.phrases) {
                    if (typeof phrase === 'object' && phrase.english && phrase.chinese) {
                        const phraseItem = {
                            english: phrase.english,
                            chinese: [phrase.chinese],
                            type: 'phrase',
                            parentWord: word.english,
                            pronunciation: word.pronunciation,
                            example: [`Example from: ${word.english}`],
                            unitId: unitId
                        };
                        words.push(phraseItem);
                    }
                }
            }
        }

        // Add related words as vocabulary items
        for (const word of unitWords) {
            if (word.related && Array.isArray(word.related) && word.related.length > 0) {
                for (const relatedWord of word.related) {
                    if (typeof relatedWord === 'object' && relatedWord.english) {
                        const relatedItem = {
                            english: relatedWord.english,
                            pronunciation: relatedWord.pronunciation || word.pronunciation,
                            chinese: Array.isArray(relatedWord.chinese) ? relatedWord.chinese : [relatedWord.chinese],
                            type: 'related',
                            parentWord: word.english,
                            example: [`Related to: ${word.english}`],
                            unitId: unitId
                        };
                        words.push(relatedItem);
                    }
                }
            }
        }
    }

    // Filter words based on quiz type requirements
    if (quizTypeValue === 'fill-in-blank') {
        // Only include words with valid examples containing blanks
        words = words.filter(word => hasValidExampleForFillInBlank(word));

        if (words.length === 0) {
            alert('所選單元中沒有包含填空範例的詞彙。請選擇其他測驗類型或不同的單元。');
            return;
        }
    }

    // Shuffle and limit to question count
    currentQuizWords = [...words]
        .sort(() => 0.5 - Math.random())
        .slice(0, quizQuestionCount);
}

// Display the current quiz question
async function displayCurrentQuestion() {
    console.log('=== displayCurrentQuestion called ===');
    console.log('Current index:', currentQuizIndex);
    
    if (currentQuizIndex < currentQuizWords.length) {
        const word = currentQuizWords[currentQuizIndex];

        // Update progress
        currentQuestion.textContent = (currentQuizIndex + 1).toString();
        quizProgress.style.width = `${((currentQuizIndex + 1) / currentQuizWords.length) * 100}%`;

        // Clear previous question and data attributes
        quizContainer.innerHTML = '';
        quizContainer.classList.remove('fill-in-blank-mode');
        delete quizContainer.dataset.currentOptions;
        delete quizContainer.dataset.correctAnswer;

        // Create question based on quiz type
        switch (quizTypeValue) {
            case 'multiple-choice':
                await createMultipleChoiceQuestion(word);
                break;
            case 'matching':
                await createMatchingQuestion(word);
                break;
            case 'spelling':
                createSpellingQuestion(word);
                break;
            case 'pronunciation':
                await createPronunciationQuestion(word);
                break;
            case 'fill-in-blank':
                await createFillInBlankQuestion(word);
                break;
        }
          // Show/hide submit button based on quiz type and auto-advance setting
        if (quizTypeValue === 'spelling') {
            submitAnswer.style.display = 'block';
            prevQuestion.style.display = 'none';
            nextQuestion.style.display = 'none';
        } else if (quizTypeValue === 'fill-in-blank') {
            if (autoAdvanceQuestions) {
                // Auto-advance enabled: hide all buttons
                submitAnswer.style.display = 'none';
                prevQuestion.style.display = 'none';
                nextQuestion.style.display = 'none';
            } else {
                // Auto-advance disabled: show submit and navigation buttons
                submitAnswer.style.display = 'inline-block';
                updateNavigationButtons();
            }
        } else {
            submitAnswer.style.display = 'none';
            prevQuestion.style.display = 'none';
            nextQuestion.style.display = 'none';
        }
        
        submitAnswer.disabled = false;
    } else {
        // End of quiz
        showQuizResults();
    }
}

// Create a multiple choice question
async function createMultipleChoiceQuestion(word) {
    // Get options (1 correct + 3 random)
    const options = await getRandomOptions(word);

    // Store options in a data attribute for later validation
    quizContainer.dataset.currentOptions = JSON.stringify(options);

    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question';
    questionElement.innerHTML = `
        <h3>"${word.english}" 的中文意思是什麼？</h3>
    `;

    // Add parent word indicator for phrase or related items
    if (word.type === 'phrase' || word.type === 'related') {
        const parentContainer = document.createElement('div');
        parentContainer.className = 'quiz-item-type';
        parentContainer.innerHTML = `
            <span class="quiz-type-label ${word.type}">${word.type === 'phrase' ? 'Phrase' : 'Related Word'}</span>
            <span class="quiz-parent-label"> from: ${escapeHtml(word.parentWord)}</span>
        `;
        questionElement.appendChild(parentContainer);
    }
    
    // Add related words as clickable buttons if available (only for main vocabulary words)
    if (word.related && Array.isArray(word.related) && word.related.length > 0 && !word.type) {
        const relatedSection = document.createElement('div');
        relatedSection.className = 'quiz-related-section';
        
        const relatedLabel = document.createElement('p');
        relatedLabel.className = 'quiz-related-label';
        relatedLabel.textContent = '相關詞彙 (點擊查看)：';
        relatedSection.appendChild(relatedLabel);
        
        const relatedItems = document.createElement('div');
        relatedItems.className = 'quiz-related-items';
        
        word.related.forEach(related => {
            const relatedBtn = document.createElement('button');
            relatedBtn.className = 'quiz-related-item-btn';
            relatedBtn.type = 'button';
            
            if (typeof related === 'object' && related.english) {
                const pronunciation = related.pronunciation ? ` ${related.pronunciation}` : '';
                const chinese = related.chinese && Array.isArray(related.chinese) ? ` - ${related.chinese.join('; ')}` : '';
                relatedBtn.innerHTML = `<strong>${escapeHtml(related.english)}</strong>${escapeHtml(pronunciation)}<span class="quiz-related-meaning hidden">${escapeHtml(chinese)}</span>`;
            } else {
                relatedBtn.textContent = escapeHtml(related);
            }
            
            // Toggle showing/hiding the Chinese meaning on click
            relatedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const meaningSpan = relatedBtn.querySelector('.quiz-related-meaning');
                if (meaningSpan) {
                    meaningSpan.classList.toggle('hidden');
                }
            });
            
            relatedItems.appendChild(relatedBtn);
        });
        
        relatedSection.appendChild(relatedItems);
        questionElement.appendChild(relatedSection);
    }
    
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quiz-options';
    optionsDiv.innerHTML = `
        ${options.map((option, index) => `
            <label>
                <input type="radio" name="answer" value="${index}" class="auto-submit-option">
                ${formatChineseDisplay(option)}
            </label>
        `).join('')}
    `;
    questionElement.appendChild(optionsDiv);

    quizContainer.appendChild(questionElement);

    // Add event listeners to auto-submit when an option is selected
    const radioButtons = document.querySelectorAll('.auto-submit-option');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', handleSubmitAnswer);
    });
}

// Create a matching question
async function createMatchingQuestion(word) {
    // Get options (1 correct + 3 random)
    const options = await getRandomOptions(word, 4);

    // Store options in a data attribute for later validation
    quizContainer.dataset.currentOptions = JSON.stringify(options);

    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question matching';
    questionElement.innerHTML = `
        <h3>請選擇 "${word.english}" 的正確翻譯</h3>
    `;

    // Add parent word indicator for phrase or related items
    if (word.type === 'phrase' || word.type === 'related') {
        const parentContainer = document.createElement('div');
        parentContainer.className = 'quiz-item-type';
        parentContainer.innerHTML = `
            <span class="quiz-type-label ${word.type}">${word.type === 'phrase' ? 'Phrase' : 'Related Word'}</span>
            <span class="quiz-parent-label"> from: ${escapeHtml(word.parentWord)}</span>
        `;
        questionElement.appendChild(parentContainer);
    }
    
    // Add related words as clickable buttons if available (only for main vocabulary words)
    if (word.related && Array.isArray(word.related) && word.related.length > 0 && !word.type) {
        const relatedSection = document.createElement('div');
        relatedSection.className = 'quiz-related-section';
        
        const relatedLabel = document.createElement('p');
        relatedLabel.className = 'quiz-related-label';
        relatedLabel.textContent = '相關詞彙 (點擊查看)：';
        relatedSection.appendChild(relatedLabel);
        
        const relatedItems = document.createElement('div');
        relatedItems.className = 'quiz-related-items';
        
        word.related.forEach(related => {
            const relatedBtn = document.createElement('button');
            relatedBtn.className = 'quiz-related-item-btn';
            relatedBtn.type = 'button';
            
            if (typeof related === 'object' && related.english) {
                const pronunciation = related.pronunciation ? ` ${related.pronunciation}` : '';
                const chinese = related.chinese && Array.isArray(related.chinese) ? ` - ${related.chinese.join('; ')}` : '';
                relatedBtn.innerHTML = `<strong>${escapeHtml(related.english)}</strong>${escapeHtml(pronunciation)}<span class="quiz-related-meaning hidden">${escapeHtml(chinese)}</span>`;
            } else {
                relatedBtn.textContent = escapeHtml(related);
            }
            
            // Toggle showing/hiding the Chinese meaning on click
            relatedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const meaningSpan = relatedBtn.querySelector('.quiz-related-meaning');
                if (meaningSpan) {
                    meaningSpan.classList.toggle('hidden');
                }
            });
            
            relatedItems.appendChild(relatedBtn);
        });
        
        relatedSection.appendChild(relatedItems);
        questionElement.appendChild(relatedSection);
    }
    
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quiz-options';
    optionsDiv.innerHTML = `
        ${options.map((option, index) => `
            <label>
                <input type="radio" name="answer" value="${index}" class="auto-submit-option">
                ${formatChineseDisplay(option)}
            </label>
        `).join('')}
    `;
    questionElement.appendChild(optionsDiv);

    quizContainer.appendChild(questionElement);

    // Add event listeners to auto-submit when an option is selected
    const radioButtons = document.querySelectorAll('.auto-submit-option');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', handleSubmitAnswer);
    });
}

// Create a spelling question
function createSpellingQuestion(word) {
    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question';

    // Format Chinese translations (supports both string and array)
    const chineseDisplay = formatChineseDisplay(word);

    questionElement.innerHTML = `
        <h3>"${chineseDisplay}" 的英文單詞是什麼？</h3>
        <div class="spelling-input">
            <input type="text" id="spelling-answer" placeholder="請在此輸入答案" autocomplete="off">
        </div>
    `;

    quizContainer.appendChild(questionElement);

    // Focus on the input field
    setTimeout(() => {
        const spellingInput = document.getElementById('spelling-answer');
        spellingInput.focus();

        // Add event listener for Enter key
        spellingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmitAnswer();
            }
        });
    }, 100);
}

// Create a pronunciation question
async function createPronunciationQuestion(word) {
    // Get options (1 correct + 3 random)
    const options = await getRandomOptions(word);

    // Store options in a data attribute for later validation
    quizContainer.dataset.currentOptions = JSON.stringify(options);
    
    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question';
    questionElement.innerHTML = `
        <h3>請聽發音並選擇正確的單字</h3>
        <div class="audio-container">
            <button class="audio-btn" onclick="playWordAudio('${word.english}')">
                <i class="fas fa-volume-up"></i>
            </button>
            <div class="audio-source" id="audioSource-${word.english.replace(/\s+/g, '-')}"></div>
        </div>
    `;

    // Add parent word indicator for phrase or related items
    if (word.type === 'phrase' || word.type === 'related') {
        const parentContainer = document.createElement('div');
        parentContainer.className = 'quiz-item-type';
        parentContainer.innerHTML = `
            <span class="quiz-type-label ${word.type}">${word.type === 'phrase' ? 'Phrase' : 'Related Word'}</span>
            <span class="quiz-parent-label"> from: ${escapeHtml(word.parentWord)}</span>
        `;
        questionElement.appendChild(parentContainer);
    }
    
    // Add related words as clickable buttons if available (only for main vocabulary words)
    if (word.related && Array.isArray(word.related) && word.related.length > 0 && !word.type) {
        const relatedSection = document.createElement('div');
        relatedSection.className = 'quiz-related-section';
        
        const relatedLabel = document.createElement('p');
        relatedLabel.className = 'quiz-related-label';
        relatedLabel.textContent = '相關詞彙 (點擊查看)：';
        relatedSection.appendChild(relatedLabel);
        
        const relatedItems = document.createElement('div');
        relatedItems.className = 'quiz-related-items';
        
        word.related.forEach(related => {
            const relatedBtn = document.createElement('button');
            relatedBtn.className = 'quiz-related-item-btn';
            relatedBtn.type = 'button';
            
            if (typeof related === 'object' && related.english) {
                const pronunciation = related.pronunciation ? ` ${related.pronunciation}` : '';
                const chinese = related.chinese && Array.isArray(related.chinese) ? ` - ${related.chinese.join('; ')}` : '';
                relatedBtn.innerHTML = `<strong>${escapeHtml(related.english)}</strong>${escapeHtml(pronunciation)}<span class="quiz-related-meaning hidden">${escapeHtml(chinese)}</span>`;
            } else {
                relatedBtn.textContent = escapeHtml(related);
            }
            
            // Toggle showing/hiding the Chinese meaning on click
            relatedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const meaningSpan = relatedBtn.querySelector('.quiz-related-meaning');
                if (meaningSpan) {
                    meaningSpan.classList.toggle('hidden');
                }
            });
            
            relatedItems.appendChild(relatedBtn);
        });
        
        relatedSection.appendChild(relatedItems);
        questionElement.appendChild(relatedSection);
    }
    
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quiz-options';
    optionsDiv.innerHTML = `
        ${options.map((option, index) => `
            <label>
                <input type="radio" name="answer" value="${index}" class="auto-submit-option">
                ${option.english}
            </label>
        `).join('')}
    `;
    questionElement.appendChild(optionsDiv);
    
    quizContainer.appendChild(questionElement);
    
    // Play audio automatically after a short delay
    setTimeout(() => {
        playWordAudio(word.english);
    }, 500);
    
    // Add event listeners to auto-submit when an option is selected
    const radioButtons = document.querySelectorAll('.auto-submit-option');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', handleSubmitAnswer);
    });
}

// Create a fill-in-blank question
async function createFillInBlankQuestion(word) {
    // Add class to widen the container
    quizContainer.classList.add('fill-in-blank-mode');

    // Get examples and find one with [...]
    const examples = Array.isArray(word.example) ? word.example : [word.example];
    const examplesWithBlanks = examples.filter(ex => ex && ex.trim() !== '' && ex.includes('[') && ex.includes(']'));

    // This should not happen if prepareQuizWords filtered correctly, but just in case
    if (examplesWithBlanks.length === 0) {
        console.error('Fill-in-blank question created for word without valid example:', word);
        await createMultipleChoiceQuestion(word);
        return;
    }

    // Pick a random example with blank
    const selectedExample = examplesWithBlanks[Math.floor(Math.random() * examplesWithBlanks.length)];

    // Extract the correct answer from brackets
    const correctAnswerMatch = selectedExample.match(/\[([^\]]+)\]/);
    const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1] : word.english;

    // Replace [word] with _____ for display
    const displayExample = selectedExample.replace(/\[([^\]]+)\]/g, '_____');

    // Get options (1 correct + 3 random = 4 total)
    const options = await getRandomOptions(word, 4);

    // Replace the base form in options with the correct form from the bracket
    // This ensures "combined" appears in options, not "combine"
    const optionsDisplay = options.map(option => {
        if (option.english === word.english) {
            // Replace the base word with the correct form
            return { ...option, english: correctAnswer };
        }
        return option;
    });

    console.log('Fill-in-blank options generated:', optionsDisplay.length, optionsDisplay);
    console.log('Correct answer for this question:', correctAnswer);

    // Store options and correct answer in data attributes for later validation
    // Store just the english values for easier comparison
    quizContainer.dataset.currentOptions = JSON.stringify(optionsDisplay.map(o => o.english));
    quizContainer.dataset.correctAnswer = correctAnswer;

    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question fill-in-blank';
    questionElement.innerHTML = `
        <div class="fill-blank-sentence">${displayExample}</div>
        <div class="quiz-options">
            ${optionsDisplay.map((option, index) => `
                <label>
                    <input type="radio" name="answer" value="${index}" class="auto-submit-option">
                    ${option.english}
                </label>
            `).join('')}
        </div>
    `;

    quizContainer.appendChild(questionElement);

    // Add event listeners to auto-submit when an option is selected (only if auto-advance is enabled)
    if (autoAdvanceQuestions) {
        const radioButtons = document.querySelectorAll('.auto-submit-option');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', handleSubmitAnswer);
        });
    }
}

// Get random options for multiple choice questions
async function getRandomOptions(correctWord, optionCount = 4) {
    const options = [correctWord];

    // Start with currentQuizWords if available, otherwise use all words
    let wordPool;
    if (currentQuizWords.length >= optionCount) {
        // Use quiz words if we have enough
        wordPool = currentQuizWords;
    } else {
        // Otherwise use all words
        wordPool = await getAllWords();
    }

    // Filter out the correct answer
    let otherWords = wordPool.filter(word => word.english !== correctWord.english);

    // Calculate how many random options we need
    const neededOptions = optionCount - 1;

    // If we don't have enough other words from the current pool, get more from all words
    if (otherWords.length < neededOptions) {
        console.warn(`Not enough options in word pool (${otherWords.length}), fetching from all words`);
        const allWords = await getAllWords();
        otherWords = allWords.filter(word => word.english !== correctWord.english);
    }

    // Shuffle and get the needed number of random words
    const randomWords = [...otherWords]
        .sort(() => 0.5 - Math.random())
        .slice(0, neededOptions);

    // Final check: if we STILL don't have enough (shouldn't happen), log error
    if (randomWords.length < neededOptions) {
        console.error(`Could not generate ${neededOptions} random options. Only got ${randomWords.length}. Total words available: ${otherWords.length}`);
        // Fill with duplicates as last resort
        while (randomWords.length < neededOptions && randomWords.length > 0) {
            randomWords.push(randomWords[randomWords.length % randomWords.length]);
        }
    }

    // Combine and shuffle options
    const finalOptions = [...options, ...randomWords].sort(() => 0.5 - Math.random());

    console.log(`Generated ${finalOptions.length} options for word "${correctWord.english}"`);

    return finalOptions;
}

// Handle answer submission
function handleSubmitAnswer() {
    console.log('=== handleSubmitAnswer called ===');
    console.log('Quiz type:', quizTypeValue);
    console.log('Auto-advance enabled:', autoAdvanceQuestions);
    
    const word = currentQuizWords[currentQuizIndex];
    let isCorrect = false;
    let userAnswer = '';
      switch (quizTypeValue) {
        case 'multiple-choice':
        case 'matching':
        case 'pronunciation':
        case 'fill-in-blank':
            const selectedOption = document.querySelector('input[name="answer"]:checked');

            if (selectedOption) {
                const optionIndex = parseInt(selectedOption.value);
                const options = document.querySelectorAll('input[name="answer"]');

                // Get the correct labels based on quiz type
                // All quiz types now use .quiz-options
                const answerLabels = document.querySelectorAll('.quiz-options label');

                // Get the selected answer text from the correct label
                userAnswer = answerLabels[optionIndex].textContent.trim();

                // Get stored options from data attribute
                const currentOptions = JSON.parse(quizContainer.dataset.currentOptions);

                // Check if the selected option is correct
                if (quizTypeValue === 'fill-in-blank') {
                    // For fill-in-blank, compare against the extracted correct answer
                    const correctAnswer = quizContainer.dataset.correctAnswer;
                    isCorrect = currentOptions[optionIndex] === correctAnswer;
                } else if (quizTypeValue === 'pronunciation') {
                    isCorrect = currentOptions[optionIndex] === word.english;
                } else {
                    isCorrect = currentOptions[optionIndex] === word.english;
                }

                // Highlight correct and incorrect answers
                let storedOptions;
                try {
                    storedOptions = JSON.parse(quizContainer.dataset.currentOptions);
                } catch (e) {
                    console.error('Failed to parse stored options:', e);
                    storedOptions = [];
                }
                
                console.log('storedOptions:', storedOptions);
                console.log('Quiz type:', quizTypeValue);
                console.log('quizContainer.dataset.correctAnswer:', quizContainer.dataset.correctAnswer);
                
                options.forEach((option, index) => {
                    const label = answerLabels[index];
                    const optionEnglish = storedOptions[index];

                    // Determine correct answer based on quiz type
                    let correctAnswerToCheck = word.english;
                    if (quizTypeValue === 'fill-in-blank') {
                        correctAnswerToCheck = quizContainer.dataset.correctAnswer;
                    }
                    
                    console.log(`Option ${index}: "${optionEnglish}" (type: ${typeof optionEnglish}) vs correct "${correctAnswerToCheck}" (type: ${typeof correctAnswerToCheck})`);
                    
                    // Ensure we're comparing strings
                    const optionStr = String(optionEnglish || '').trim();
                    const correctStr = String(correctAnswerToCheck || '').trim();
                    
                    console.log(`  After trim: "${optionStr}" vs "${correctStr}"`);
                    console.log(`  Match: ${optionStr === correctStr}`);
                    
                    if (optionStr && optionStr === correctStr) {
                        label.classList.add('correct');
                        console.log(`  ✓ Added correct class`);
                    } else if (index === optionIndex) {
                        label.classList.add('incorrect');
                        console.log(`  ✗ Added incorrect class`);
                    }

                    option.disabled = true;
                });
            } else {
                alert('請選擇一個答案');
                return;
            }
            break;
            
        case 'spelling':
            const spellingInput = document.getElementById('spelling-answer');
            userAnswer = spellingInput.value.trim().toLowerCase();
            
            isCorrect = userAnswer === word.english.toLowerCase();
            
            // Show the correct answer
            spellingInput.disabled = true;
            
            const feedbackElement = document.createElement('div');
            feedbackElement.className = isCorrect ? 'correct-feedback' : 'incorrect-feedback';
            feedbackElement.innerHTML = isCorrect 
                ? `<i class="fas fa-check"></i> 正確！` 
                : `<i class="fas fa-times"></i> 不正確。正確答案是 "${word.english}"。`;
            
            spellingInput.parentNode.appendChild(feedbackElement);
            break;
    }
    
    // Record the answer
    const answerRecord = {
        word: word,
        userAnswer: userAnswer,
        isCorrect: isCorrect
    };
    
    // For fill-in-blank, also store the question with the correct answer filled in
    if (quizTypeValue === 'fill-in-blank') {
        const fillBlankSentence = document.querySelector('.fill-blank-sentence');
        const correctAnswer = quizContainer.dataset.correctAnswer;
        if (fillBlankSentence && correctAnswer) {
            // Replace underscores with the correct answer to show what should have been answered
            const questionWithAnswer = fillBlankSentence.textContent.trim().replace(/_{5,}/g, `「${correctAnswer}」`);
            answerRecord.question = questionWithAnswer;
        }
    }
    
    selectedAnswers.push(answerRecord);
      // Update score
    if (isCorrect) {
        currentQuizScore++;
        
        // Update user progress - use word.unitId instead of quizUnitId
        userProgress.updateWordProgress(`${word.unitId}-${word.english}`, true);
    } else {
        missedWords.push(word);
        
        // Update user progress - use word.unitId instead of quizUnitId
        userProgress.updateWordProgress(`${word.unitId}-${word.english}`, false);
    }
    
    // Disable submit button to prevent multiple submissions
    submitAnswer.disabled = true;

    // Automatically advance to the next question after a delay (only if auto-advance is enabled)
    if (autoAdvanceQuestions && quizTypeValue === 'fill-in-blank') {
        // Wait longer for incorrect answers (3 seconds) to allow review
        const delay = isCorrect ? 1500 : 3000;
        setTimeout(() => {
            currentQuizIndex++;
            displayCurrentQuestion();
            submitAnswer.disabled = false;
            updateNavigationButtons();
        }, delay);
    } else {
        // If not auto-advancing, wait a moment to show colors, then show navigation buttons
        if (quizTypeValue === 'fill-in-blank' && !autoAdvanceQuestions) {
            // Wait to show colors before revealing navigation
            const delay = isCorrect ? 800 : 1500;
            setTimeout(() => {
                submitAnswer.style.display = 'none';
                submitAnswer.disabled = false;
                updateNavigationButtons();
            }, delay);
        } else {
            submitAnswer.disabled = false;
        }
    }
}

// Update navigation button visibility and state
function updateNavigationButtons() {
    const isFirstQuestion = currentQuizIndex === 0;
    const isLastQuestion = currentQuizIndex === currentQuizWords.length - 1;
    
    // Show/hide based on question position
    prevQuestion.style.display = isFirstQuestion ? 'none' : 'inline-block';
    nextQuestion.style.display = isLastQuestion ? 'none' : 'inline-block';
}

// Move to the previous question
function handlePrevQuestion() {
    if (currentQuizIndex > 0) {
        currentQuizIndex--;
        displayCurrentQuestion();
        updateNavigationButtons();
    }
}
function handleNextQuestion() {
    if (currentQuizIndex < currentQuizWords.length - 1) {
        currentQuizIndex++;
        displayCurrentQuestion();
        updateNavigationButtons();
    }
}

// Show quiz results
function showQuizResults() {
    // Update score
    scoreValue.textContent = currentQuizScore;
    totalScore.textContent = currentQuizWords.length;
    
    // Calculate percentage
    const percentage = Math.round((currentQuizScore / currentQuizWords.length) * 100);
    
    // Set result message
    if (percentage >= 90) {
        resultMessage.innerHTML = `<strong>太棒了！</strong> 您已經掌握了這些單詞。`;
    } else if (percentage >= 70) {
        resultMessage.innerHTML = `<strong>做得好！</strong> 您正在取得良好的進步。`;
    } else if (percentage >= 50) {
        resultMessage.innerHTML = `<strong>繼續練習！</strong> 您正在正確的道路上。`;
    } else {
        resultMessage.innerHTML = `<strong>不要放棄！</strong> 更多的練習將幫助您提高。`;
    }
    
    // Generate quiz summary
    quizSummary.innerHTML = '<h4>測驗摘要：</h4>';

    selectedAnswers.forEach((answer, index) => {
        // Format Chinese translations (supports both string and array)
        const chineseDisplay = formatChineseDisplay(answer.word);

        let summaryContent = `
            <div class="summary-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <span class="question-number">${index + 1}.</span>
        `;
        
        // For fill-in-blank, show the question
        if (answer.question) {
            summaryContent += `
                <div class="fill-blank-question">${answer.question}</div>
            `;
        }
        
        summaryContent += `
                <span class="question-word">${answer.word.english}</span>
                <span class="question-answer">${answer.isCorrect ?
                    `<i class="fas fa-check"></i> ${answer.userAnswer}` :
                    `<i class="fas fa-times"></i> 您的答案：「${answer.userAnswer}」（正確答案：「${chineseDisplay}」）`}
                </span>
            </div>
        `;
        
        quizSummary.innerHTML += summaryContent;
    });
    
    // Show results section
    quizSetup.style.display = 'none';
    quizQuestions.style.display = 'none';
    quizResults.style.display = 'block';
    
    // Enable review missed button only if there are missed words
    reviewMissed.disabled = missedWords.length === 0;
}

// Handle retaking the same quiz
function handleRetakeQuiz() {
    // Reset quiz with same words
    currentQuizIndex = 0;
    currentQuizScore = 0;
    selectedAnswers = [];
    missedWords = [];
    
    // Show first question
    displayCurrentQuestion();
    
    // Show quiz questions section
    quizSetup.style.display = 'none';
    quizQuestions.style.display = 'block';
    quizResults.style.display = 'none';
}

// Handle creating a new quiz
function handleNewQuiz() {
    // Show setup section
    quizSetup.style.display = 'block';
    quizQuestions.style.display = 'none';
    quizResults.style.display = 'none';
}

// Handle reviewing missed words
function handleReviewMissed() {
    // Redirect to flashcards with only missed words
    const missedWordIds = missedWords.map(word => word.english).join(',');
    window.location.href = `flashcards.html?missed=${missedWordIds}`;
}

// Play audio for a word
function playWordAudio(word) {
    if (!word) return;

    // Add loading indicator
    const audioButtons = document.querySelectorAll('.quiz-question .audio-btn');
    audioButtons.forEach(btn => {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
    });

    const audioSourceElement = document.getElementById(`audioSource-${word.replace(/\s+/g, '-')}`);

    // Reset button function
    const resetButtons = () => {
        audioButtons.forEach(btn => {
            btn.innerHTML = '<i class="fas fa-volume-up"></i>';
            btn.disabled = false;
        });
    };

    // Use audio service
    audioService.playWord(word, {
        onStart: () => {
            if (audioSourceElement) {
                audioSourceElement.textContent = '正在播放發音';
                audioSourceElement.className = 'audio-source';
            }
        },
        onEnd: resetButtons,
        onError: (err) => {
            console.error('Audio playback error:', err);
            if (audioSourceElement) {
                audioSourceElement.textContent = '無法播放音訊';
                audioSourceElement.className = 'audio-source error';
            }
            resetButtons();
        }
    });
}