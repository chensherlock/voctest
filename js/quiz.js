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
let selectedUnitIds = ['all']; // Changed to array to support multiple unit selection
let quizTypeValue = 'multiple-choice';
let quizQuestionCount = 10;
let allUnitWords = []; // Store all words from the selected units for range selection

// Helper function to validate and fix unit IDs
function ensureValidUnitIds() {
    if (!Array.isArray(selectedUnitIds)) {
        console.warn("selectedUnitIds was not an array, resetting to ['all']");
        selectedUnitIds = ['all'];
    } else if (selectedUnitIds.length === 0) {
        console.warn("selectedUnitIds was empty, resetting to ['all']");
        selectedUnitIds = ['all'];
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Ensure we have valid unit IDs to start with
    ensureValidUnitIds();
    
    // Check if a unit was specified in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const unitId = urlParams.get('unit');
    
    // Populate unit checkboxes (this will pre-select default units)
    populateUnitSelect();
    
    // Set initial unit if specified in URL
    if (unitId) {
        // Validate the unit ID
        const unitExists = getAllUnits().some(unit => unit.id.toString() === unitId);
        if (!unitExists) {
            console.warn(`Unit with ID ${unitId} not found!`);
        } else {
            // Uncheck "all" checkbox
            const allCheckbox = document.getElementById('unit-all');
            if (allCheckbox) {
                allCheckbox.checked = false;
                allCheckbox.parentElement.classList.remove('selected');
            }
            
            // Check the specified unit checkbox
            const checkbox = document.getElementById(`unit-${unitId}`);
            if (checkbox) {
                checkbox.checked = true;
                checkbox.parentElement.classList.add('selected');
                selectedUnitIds = [unitId.toString()]; // Ensure it's a string
                
                // Uncheck any default units
                getAllUnits().forEach(unit => {
                    if (unit.default && unit.id.toString() !== unitId) {
                        const cb = document.getElementById(`unit-${unit.id}`);
                        if (cb) {
                            cb.checked = false;
                            cb.parentElement.classList.remove('selected');
                        }
                    }
                });
            } else {
                console.warn(`Checkbox for unit ID ${unitId} not found!`);
            }
        }
    }
    
    // Load all words from selected units
    loadUnitWords();
    
    // Create vocabulary range selector
    createVocabRangeSelector();
    
    // Set up event listeners
    startQuiz.addEventListener('click', handleStartQuiz);
    submitAnswer.addEventListener('click', handleSubmitAnswer);
    //nextQuestion.addEventListener('click', handleNextQuestion);
    retakeQuiz.addEventListener('click', handleRetakeQuiz);
    newQuiz.addEventListener('click', handleNewQuiz);
    reviewMissed.addEventListener('click', handleReviewMissed);
});

// Populate the unit checkboxes
function populateUnitSelect() {
    const units = getAllUnits();
    if (!units || units.length === 0) {
        console.error("No units found!");
        return;
    }
    
    const unitCheckboxContainer = document.getElementById('unitCheckboxContainer');
    if (!unitCheckboxContainer) {
        console.error("Unit checkbox container not found!");
        return;
    }
    
    // Set up the "all" checkbox handler first
    const allCheckbox = document.getElementById('unit-all');
    if (!allCheckbox) {
        console.error("'All' checkbox not found!");
        return;
    }
    
    allCheckbox.addEventListener('change', (e) => {
        const unitCheckboxes = document.querySelectorAll('.unit-checkbox-item input[type="checkbox"]:not(#unit-all)');
        
        if (e.target.checked) {
            // If "all" is checked, uncheck all other units
            unitCheckboxes.forEach(cb => {
                cb.checked = false;
                cb.parentElement.classList.remove('selected');
            });
            selectedUnitIds = ['all'];
            e.target.parentElement.classList.add('selected');
        } else {
            // If "all" is unchecked, we need at least one selection
            let anyChecked = false;
            unitCheckboxes.forEach(cb => {
                if (cb.checked) anyChecked = true;
            });
            
            if (!anyChecked) {
                e.target.checked = true; // Keep "all" checked if nothing else is selected
                selectedUnitIds = ['all'];
                e.target.parentElement.classList.add('selected');
            } else {
                selectedUnitIds = [];
                e.target.parentElement.classList.remove('selected');
            }
        }
        
        loadUnitWords();
        createVocabRangeSelector();
    });
    
    // Initialize selectedUnitIds as an empty array if not already defined
    if (!selectedUnitIds) {
        selectedUnitIds = [];
    }
    
    // Clear selectedUnitIds if it currently has only 'all'
    if (selectedUnitIds.length === 1 && selectedUnitIds[0] === 'all') {
        selectedUnitIds = [];
    }
    
    // Add unit checkboxes
    units.forEach(unit => {
        const unitItem = document.createElement('div');
        unitItem.className = 'unit-checkbox-item';
        if (unit.default) {
            unitItem.classList.add('default-unit');
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `unit-${unit.id}`;
        checkbox.value = unit.id;
        
        const label = document.createElement('label');
        label.htmlFor = `unit-${unit.id}`;
        label.textContent = unit.title;
        
        // Pre-select units marked as default
        if (unit.default) {
            checkbox.checked = true;
            unitItem.classList.add('selected');
            
            // Add to selectedUnitIds if not already included
            if (!selectedUnitIds.includes(unit.id.toString())) {
                selectedUnitIds.push(unit.id.toString());
            }
            
            // Uncheck the "all" option if default units are selected
            const allCheckbox = document.getElementById('unit-all');
            allCheckbox.checked = false;
            allCheckbox.parentElement.classList.remove('selected');
        }
          // Add event listener to each checkbox
        checkbox.addEventListener('change', (e) => {
            const unitId = e.target.value.toString(); // Ensure unitId is a string
            
            if (e.target.checked) {
                unitItem.classList.add('selected');
                
                // Add to selectedUnitIds if not already included
                if (!selectedUnitIds.includes(unitId)) {
                    selectedUnitIds.push(unitId);
                }
                
                // Uncheck the "all" option when individual units are selected
                const allCheckbox = document.getElementById('unit-all');
                allCheckbox.checked = false;
                allCheckbox.parentElement.classList.remove('selected');
            } else {
                unitItem.classList.remove('selected');
                
                // Remove from selectedUnitIds
                selectedUnitIds = selectedUnitIds.filter(id => id !== unitId);
                
                // If no units are selected, check the "all" option
                if (selectedUnitIds.length === 0) {
                    const allCheckbox = document.getElementById('unit-all');
                    allCheckbox.checked = true;
                    allCheckbox.parentElement.classList.add('selected');
                    selectedUnitIds = ['all'];
                }
            }
            
            loadUnitWords();
            createVocabRangeSelector();
        });
        
        unitItem.appendChild(checkbox);
        unitItem.appendChild(label);
        unitCheckboxContainer.appendChild(unitItem);
    });
    
    // If no units were selected as default, select 'all'
    if (selectedUnitIds.length === 0) {
        const allCheckbox = document.getElementById('unit-all');
        allCheckbox.checked = true;
        allCheckbox.parentElement.classList.add('selected');
        selectedUnitIds = ['all'];
    }
}

// Load all words from the selected units
function loadUnitWords() {
    // Ensure we have valid unit IDs
    ensureValidUnitIds();
    
    if (selectedUnitIds.length === 1 && selectedUnitIds[0] === 'all') {
        allUnitWords = getAllWords();
    } else {
        // Merge words from all selected units
        allUnitWords = [];
        selectedUnitIds.forEach(unitId => {
            // Ensure unitId is treated as a number when needed
            const parsedUnitId = parseInt(unitId);
            if (isNaN(parsedUnitId)) {
                console.error(`Invalid unit ID: ${unitId}`);
                return; // Skip this iteration
            }
            
            const unitWords = getWordsFromUnit(parsedUnitId);
            if (unitWords && unitWords.length > 0) {
                allUnitWords = allUnitWords.concat(unitWords);
            } else {
                console.warn(`No words found for unit ID: ${unitId}`);
            }
        });
    }
    
    // Safety check: if no words were loaded, fallback to all words
    if (allUnitWords.length === 0) {
        console.warn("No words were loaded from selected units, falling back to all words");
        allUnitWords = getAllWords();
        selectedUnitIds = ['all']; // Reset selection to 'all'
        
        // Update UI to reflect this change
        const allCheckbox = document.getElementById('unit-all');
        if (allCheckbox) {
            allCheckbox.checked = true;
            allCheckbox.parentElement.classList.add('selected');
        }
        
        const unitCheckboxes = document.querySelectorAll('.unit-checkbox-item input[type="checkbox"]:not(#unit-all)');
        unitCheckboxes.forEach(cb => {
            cb.checked = false;
            cb.parentElement.classList.remove('selected');
        });
    }
}

// Create vocabulary range selector
function createVocabRangeSelector() {
    const vocabRangeContainer = document.getElementById('vocabRangeContainer');
    vocabRangeContainer.innerHTML = `
        <label for="vocabRangeStart">起始：</label>
        <input type="number" id="vocabRangeStart" min="1" max="${allUnitWords.length}" value="1">
        <label for="vocabRangeEnd">結束：</label>
        <input type="number" id="vocabRangeEnd" min="1" max="${allUnitWords.length}" value="${allUnitWords.length}">
    `;
}

// Handle unit change
// Unit change handling is now done directly in the checkbox event listeners

// Start a new quiz
function handleStartQuiz() {
    // Get quiz settings
    // selectedUnitIds is now maintained by the checkbox event listeners
    // so we don't need to update it here
    
    quizTypeValue = quizType.value;
    quizQuestionCount = parseInt(questionCount.value);
    
    // Prepare quiz words
    prepareQuizWords();
    
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
function prepareQuizWords() {
    let words = [];
    
    if (selectedUnitIds.length === 1 && selectedUnitIds[0] === 'all') {
        // For 'all' option, we need to track which unit each word belongs to
        const units = getAllUnits();
        units.forEach(unit => {
            const unitWords = unit.words.map(word => ({
                ...word, 
                unitId: unit.id // Add unitId to each word
            }));
            words = words.concat(unitWords);
        });
    } else {
        // Merge words from all selected units
        selectedUnitIds.forEach(unitId => {
            // Parse unitId to integer to ensure compatibility with getWordsFromUnit
            const parsedUnitId = parseInt(unitId);
            if (isNaN(parsedUnitId)) {
                console.error(`Invalid unit ID: ${unitId}`);
                return; // Skip this iteration
            }
            
            const unitWords = getWordsFromUnit(parsedUnitId);
            if (!unitWords || unitWords.length === 0) {
                console.warn(`No words found for unit ID: ${parsedUnitId}`);
                return; // Skip this iteration
            }
            
            const wordsWithUnitId = unitWords.map(word => ({
                ...word,
                unitId: parsedUnitId // Add unitId to each word
            }));
            words = words.concat(wordsWithUnitId);
        });
    }
    
    // Get vocabulary range
    const vocabRangeStart = parseInt(document.getElementById('vocabRangeStart').value) - 1;
    const vocabRangeEnd = parseInt(document.getElementById('vocabRangeEnd').value);
    
    // Filter words based on range
    words = words.slice(vocabRangeStart, vocabRangeEnd);
    
    // Shuffle and limit to question count
    currentQuizWords = [...words]
        .sort(() => 0.5 - Math.random())
        .slice(0, quizQuestionCount);
}

// Display the current quiz question
function displayCurrentQuestion() {
    if (currentQuizIndex < currentQuizWords.length) {
        const word = currentQuizWords[currentQuizIndex];
        
        // Update progress
        currentQuestion.textContent = (currentQuizIndex + 1).toString();
        quizProgress.style.width = `${((currentQuizIndex + 1) / currentQuizWords.length) * 100}%`;
        
        // Clear previous question
        quizContainer.innerHTML = '';
        
        // Create question based on quiz type
        switch (quizTypeValue) {
            case 'multiple-choice':
                createMultipleChoiceQuestion(word);
                break;
            case 'matching':
                createMatchingQuestion(word);
                break;
            case 'spelling':
                createSpellingQuestion(word);
                break;
            case 'pronunciation':
                createPronunciationQuestion(word);
                break;
        }
          // Hide submit button for multiple choice, matching, and pronunciation questions
        // Only show for spelling questions until user presses Enter
        if (quizTypeValue === 'spelling') {
            submitAnswer.style.display = 'block';
        } else {
            submitAnswer.style.display = 'none';
        }
        
        submitAnswer.disabled = false;
    } else {
        // End of quiz
        showQuizResults();
    }
}

// Create a multiple choice question
function createMultipleChoiceQuestion(word) {
    // Get options (1 correct + 3 random)
    const options = getRandomOptions(word);
    
    // Store options in a data attribute for later validation
    quizContainer.dataset.currentOptions = JSON.stringify(options);
    
    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question';
    questionElement.innerHTML = `
        <h3>"${word.english}" 的中文意思是什麼？</h3>
        <div class="quiz-options">
            ${options.map((option, index) => `
                <label>
                    <input type="radio" name="answer" value="${index}" class="auto-submit-option">
                    ${option.chinese}
                </label>
            `).join('')}
        </div>
    `;
    
    quizContainer.appendChild(questionElement);
    
    // Add event listeners to auto-submit when an option is selected
    const radioButtons = document.querySelectorAll('.auto-submit-option');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', handleSubmitAnswer);
    });
}

// Create a matching question
function createMatchingQuestion(word) {
    // Get options (1 correct + 3 random)
    const options = getRandomOptions(word);
    
    // Store options in a data attribute for later validation
    quizContainer.dataset.currentOptions = JSON.stringify(options);
    
    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question';
    questionElement.innerHTML = `
        <h3>請選擇 "${word.english}" 的正確翻譯</h3>
        <div class="matching-options">
            ${options.map((option, index) => `
                <div class="matching-option">
                    <input type="radio" id="option-${index}" name="answer" value="${index}" class="auto-submit-option">
                    <label for="option-${index}">${option.chinese}</label>
                </div>
            `).join('')}
        </div>
    `;
    
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
    questionElement.innerHTML = `
        <h3>"${word.chinese}" 的英文單詞是什麼？</h3>
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
function createPronunciationQuestion(word) {
    // Get options (1 correct + 3 random)
    const options = getRandomOptions(word);
    
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
        <div class="quiz-options">
            ${options.map((option, index) => `
                <label>
                    <input type="radio" name="answer" value="${index}" class="auto-submit-option">
                    ${option.english}
                </label>
            `).join('')}
        </div>
    `;
    
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

// Get random options for multiple choice questions
function getRandomOptions(correctWord) {
    const options = [correctWord];
    const allWords = getAllWords();
    
    // Filter out the correct answer
    const otherWords = allWords.filter(word => word.english !== correctWord.english);
    
    // Shuffle and get 3 random words
    const randomWords = [...otherWords]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    // Combine and shuffle options
    return [...options, ...randomWords].sort(() => 0.5 - Math.random());
}

// Handle answer submission
function handleSubmitAnswer() {
    const word = currentQuizWords[currentQuizIndex];
    let isCorrect = false;
    let userAnswer = '';
      switch (quizTypeValue) {
        case 'multiple-choice':
        case 'matching':
        case 'pronunciation':
            const selectedOption = document.querySelector('input[name="answer"]:checked');
            
            if (selectedOption) {
                const optionIndex = parseInt(selectedOption.value);
                const options = document.querySelectorAll('input[name="answer"]');
                
                // Get the correct labels based on quiz type
                let answerLabels;
                if (quizTypeValue === 'multiple-choice') {
                    // For multiple choice, the label is a direct parent of the input
                    answerLabels = document.querySelectorAll('.quiz-options label');
                } else if (quizTypeValue === 'pronunciation') {
                    // For pronunciation, the label is also in .quiz-options
                    answerLabels = document.querySelectorAll('.quiz-options label');
                } else {
                    // For matching, we need to get the label with matching 'for' attribute
                    answerLabels = document.querySelectorAll('.matching-options label');
                }
                
                // Get the selected answer text from the correct label
                userAnswer = answerLabels[optionIndex].textContent.trim();
                
                // Get stored options from data attribute
                const currentOptions = JSON.parse(quizContainer.dataset.currentOptions);
                
                // Check if the selected option is correct
                if (quizTypeValue === 'pronunciation') {
                    isCorrect = currentOptions[optionIndex].english === word.english;
                } else {
                    isCorrect = currentOptions[optionIndex].english === word.english;
                }
                
                // Highlight correct and incorrect answers
                options.forEach((option, index) => {
                    const label = answerLabels[index];
                    const optionWord = currentOptions[index];
                    
                    if (optionWord.english === word.english) {
                        label.classList.add('correct');
                    } else if (index === optionIndex) {
                        label.classList.add('incorrect');
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
    selectedAnswers.push({
        word: word,
        userAnswer: userAnswer,
        isCorrect: isCorrect
    });
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
    
    // Automatically advance to the next question after a short delay (1.5 seconds)
    setTimeout(() => {
        currentQuizIndex++;
        displayCurrentQuestion();
        submitAnswer.disabled = false;
    }, 1500);
}

// Move to the next question
function handleNextQuestion() {
    currentQuizIndex++;
    displayCurrentQuestion();
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
        quizSummary.innerHTML += `
            <div class="summary-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <span class="question-number">${index + 1}.</span>
                <span class="question-word">${answer.word.english}</span>
                <span class="question-answer">${answer.isCorrect ? 
                    `<i class="fas fa-check"></i> ${answer.userAnswer}` : 
                    `<i class="fas fa-times"></i> 您的答案：「${answer.userAnswer}」（正確答案：「${answer.word.chinese}」）`}
                </span>
            </div>
        `;
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