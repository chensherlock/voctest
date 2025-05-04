// DOM elements
const quizSetup = document.getElementById('quizSetup');
const quizQuestions = document.getElementById('quizQuestions');
const quizResults = document.getElementById('quizResults');
const quizContainer = document.querySelector('.quiz-container');
const quizUnitSelect = document.getElementById('quizUnitSelect');
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
let quizUnitId = 'all';
let quizTypeValue = 'multiple-choice';
let quizQuestionCount = 10;
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
        quizUnitSelect.value = unitId;
        quizUnitId = unitId;
    }
    
    // Load all words from current unit
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
    quizUnitSelect.addEventListener('change', handleUnitChange);
});

// Populate the unit select dropdown
function populateUnitSelect() {
    const units = getAllUnits();
    
    units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.id;
        option.textContent = unit.title;
        quizUnitSelect.appendChild(option);
    });
}

// Load all words from the selected unit
function loadUnitWords() {
    if (quizUnitId === 'all') {
        allUnitWords = getAllWords();
    } else {
        allUnitWords = getWordsFromUnit(quizUnitId);
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
function handleUnitChange() {
    quizUnitId = quizUnitSelect.value;
    loadUnitWords();
    createVocabRangeSelector();
}

// Start a new quiz
function handleStartQuiz() {
    // Get quiz settings
    quizUnitId = quizUnitSelect.value;
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
    
    if (quizUnitId === 'all') {
        words = getAllWords();
    } else {
        words = getWordsFromUnit(quizUnitId);
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
        }
        
        // Hide submit button for multiple choice and matching questions
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
            const selectedOption = document.querySelector('input[name="answer"]:checked');
            
            if (selectedOption) {
                const optionIndex = parseInt(selectedOption.value);
                const options = document.querySelectorAll('input[name="answer"]');
                
                // Get the correct labels based on quiz type
                let answerLabels;
                if (quizTypeValue === 'multiple-choice') {
                    // For multiple choice, the label is a direct parent of the input
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
                isCorrect = currentOptions[optionIndex].english === word.english;
                
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
        
        // Update user progress
        userProgress.updateWordProgress(`${quizUnitId}-${word.english}`, true);
    } else {
        missedWords.push(word);
        
        // Update user progress
        userProgress.updateWordProgress(`${quizUnitId}-${word.english}`, false);
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
    
    // Use cloud service directly for audio
    cloudAudioService.getWordAudio(word)
        .then(audioUrl => {
            const audio = new Audio(audioUrl);
            audio.play()
                .then(() => {
                    // Reset button state
                    audioButtons.forEach(btn => {
                        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
                        btn.disabled = false;
                    });
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                    audioButtons.forEach(btn => {
                        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
                        btn.disabled = false;
                    });
                });
        })
        .catch(error => {
            console.error('Error getting audio URL:', error);
            audioButtons.forEach(btn => {
                btn.innerHTML = '<i class="fas fa-volume-up"></i>';
                btn.disabled = false;
            });
        });
}