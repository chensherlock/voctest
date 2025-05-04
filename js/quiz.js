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
    nextQuestion.addEventListener('click', handleNextQuestion);
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
        <label for="vocabRangeStart">Start:</label>
        <input type="number" id="vocabRangeStart" min="1" max="${allUnitWords.length}" value="1">
        <label for="vocabRangeEnd">End:</label>
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
        
        // Reset buttons
        submitAnswer.style.display = 'block';
        nextQuestion.style.display = 'none';
    } else {
        // End of quiz
        showQuizResults();
    }
}

// Create a multiple choice question
function createMultipleChoiceQuestion(word) {
    // Get options (1 correct + 3 random)
    const options = getRandomOptions(word);
    
    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question';
    questionElement.innerHTML = `
        <h3>What is the meaning of "${word.english}"?</h3>
        <div class="quiz-options">
            ${options.map((option, index) => `
                <label>
                    <input type="radio" name="answer" value="${index}">
                    ${option.chinese}
                </label>
            `).join('')}
        </div>
    `;
    
    quizContainer.appendChild(questionElement);
}

// Create a matching question
function createMatchingQuestion(word) {
    // Get options (1 correct + 3 random)
    const options = getRandomOptions(word);
    
    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question';
    questionElement.innerHTML = `
        <h3>Match the correct translation for "${word.english}"</h3>
        <div class="matching-options">
            ${options.map((option, index) => `
                <div class="matching-option">
                    <input type="radio" id="option-${index}" name="answer" value="${index}">
                    <label for="option-${index}">${option.chinese}</label>
                </div>
            `).join('')}
        </div>
    `;
    
    quizContainer.appendChild(questionElement);
}

// Create a spelling question
function createSpellingQuestion(word) {
    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question';
    questionElement.innerHTML = `
        <h3>What is the English word for "${word.chinese}"?</h3>
        <div class="spelling-input">
            <input type="text" id="spelling-answer" placeholder="Type the answer here" autocomplete="off">
        </div>
    `;
    
    quizContainer.appendChild(questionElement);
    
    // Focus on the input field
    setTimeout(() => {
        document.getElementById('spelling-answer').focus();
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
                const labels = document.querySelectorAll('label');
                
                // Get the selected answer text
                userAnswer = labels[optionIndex].textContent.trim();
                
                // Check if correct (option 0 is always correct in our implementation)
                isCorrect = getRandomOptions(word)[optionIndex].english === word.english;
                
                // Highlight correct and incorrect answers
                options.forEach((option, index) => {
                    const label = labels[index];
                    const optionWord = getRandomOptions(word)[index];
                    
                    if (optionWord.english === word.english) {
                        label.classList.add('correct');
                    } else if (index === optionIndex) {
                        label.classList.add('incorrect');
                    }
                    
                    option.disabled = true;
                });
            } else {
                alert('Please select an answer');
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
                ? `<i class="fas fa-check"></i> Correct!` 
                : `<i class="fas fa-times"></i> Incorrect. The correct answer is "${word.english}".`;
            
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
    
    // Show next button
    submitAnswer.style.display = 'none';
    nextQuestion.style.display = 'block';
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
        resultMessage.innerHTML = `<strong>Excellent!</strong> You've mastered these words.`;
    } else if (percentage >= 70) {
        resultMessage.innerHTML = `<strong>Good job!</strong> You're making good progress.`;
    } else if (percentage >= 50) {
        resultMessage.innerHTML = `<strong>Keep practicing!</strong> You're on the right track.`;
    } else {
        resultMessage.innerHTML = `<strong>Don't give up!</strong> More practice will help you improve.`;
    }
    
    // Generate quiz summary
    quizSummary.innerHTML = '<h4>Question Summary:</h4>';
    
    selectedAnswers.forEach((answer, index) => {
        quizSummary.innerHTML += `
            <div class="summary-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <span class="question-number">${index + 1}.</span>
                <span class="question-word">${answer.word.english}</span>
                <span class="question-answer">${answer.isCorrect ? 
                    `<i class="fas fa-check"></i> ${answer.userAnswer}` : 
                    `<i class="fas fa-times"></i> You answered: "${answer.userAnswer}" (Correct: "${answer.word.chinese}")`}
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