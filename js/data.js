// Vocabulary data - loaded from JSON files
let vocabularyData = {
    units: []
};

// Cache for loaded unit data
const unitCache = {};

// Load units index
async function loadUnitsIndex() {
    try {
        const response = await fetch(`data/units-index.json?v=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`Failed to load units index: ${response.statusText}`);
        }
        const data = await response.json();
        vocabularyData.units = data.units.map(unit => ({
            id: unit.id,
            title: unit.title,
            description: unit.description || '',
            default: unit.default,
            file: unit.file,
            video: unit.video || '',
            words: [] // Words will be loaded on demand
        }));
        return vocabularyData.units;
    } catch (error) {
        console.error('Error loading units index:', error);
        return [];
    }
}

// Load a specific unit's words from JSON file
async function loadUnitWordsFromFile(unitId) {
    // Check if already cached
    if (unitCache[unitId]) {
        return unitCache[unitId];
    }

    try {
        const unit = vocabularyData.units.find(u => u.id === parseInt(unitId));
        if (!unit) {
            throw new Error(`Unit ${unitId} not found in index`);
        }

        const response = await fetch(`data/${unit.file}?v=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`Failed to load unit ${unitId}: ${response.statusText}`);
        }

        const data = await response.json();
        unitCache[unitId] = data.words;

        // Update the unit in vocabularyData
        unit.words = data.words;

        return data.words;
    } catch (error) {
        console.error(`Error loading unit ${unitId}:`, error);
        return [];
    }
}

// Preload all units
async function preloadAllUnits() {
    const units = await loadUnitsIndex();
    const promises = units.map(unit => loadUnitWordsFromFile(unit.id));
    await Promise.all(promises);
    return vocabularyData.units;
}

// Function to get all units
function getAllUnits() {
    return vocabularyData.units;
}

// Function to get a specific unit by ID
function getUnitById(unitId) {
    return vocabularyData.units.find(unit => unit.id === parseInt(unitId));
}

// Function to get words from a specific unit
async function getWordsFromUnit(unitId) {
    const unit = getUnitById(unitId);
    if (!unit) return [];

    // Load words if not already loaded
    if (unit.words.length === 0) {
        await loadUnitWordsFromFile(unitId);
    }

    return unit.words;
}

// Function to get words from multiple units
async function getWordsFromUnits(unitIds) {
    let words = [];
    for (const unitId of unitIds) {
        const unitWords = await getWordsFromUnit(unitId);
        words = words.concat(unitWords);
    }
    return words;
}

// Function to get all words from all units
async function getAllWords() {
    // Ensure all units are loaded
    await preloadAllUnits();

    return vocabularyData.units.reduce((allWords, unit) => {
        return allWords.concat(unit.words);
    }, []);
}

// Helper function to get Chinese translations as an array
function getChineseTranslations(word) {
    if (!word.chinese) return [];
    return Array.isArray(word.chinese) ? word.chinese : [word.chinese];
}

// Helper function to format Chinese translations for display
function formatChineseDisplay(word) {
    const translations = getChineseTranslations(word);
    return translations.join('; ');
}

// Function to search for words
async function searchWords(query) {
    query = query.toLowerCase();
    const allWords = await getAllWords();
    return allWords.filter(word => {
        const chineseTranslations = getChineseTranslations(word);
        return word.english.toLowerCase().includes(query) ||
               chineseTranslations.some(chinese => chinese.includes(query));
    });
}

// Function to get a random set of words
async function getRandomWords(count, excludeWords = []) {
    const allWords = await getAllWords();
    const filtered = allWords.filter(word => !excludeWords.includes(word));
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Legacy compatibility functions for backward compatibility
// These delegate to the new audioService in audio-service.js
function playAudio(audioUrl, word) {
    if (typeof audioService !== 'undefined') {
        audioService.playWord(word || audioUrl);
    }
}

function playAudioFromUrl(url, word) {
    if (typeof audioService !== 'undefined') {
        audioService.playAudioFromUrl(url, word);
    }
}

// Function to track user progress (using localStorage)
const userProgress = {
    // Get the user's progress for a specific word
    getWordProgress(wordId) {
        const progress = JSON.parse(localStorage.getItem('vocabProgress')) || {};
        return progress[wordId] || { correct: 0, incorrect: 0, mastered: false };
    },

    // Update the user's progress for a word
    updateWordProgress(wordId, isCorrect) {
        const progress = JSON.parse(localStorage.getItem('vocabProgress')) || {};
        if (!progress[wordId]) {
            progress[wordId] = { correct: 0, incorrect: 0, mastered: false };
        }

        if (isCorrect) {
            progress[wordId].correct += 1;
            // Mark as mastered if correctly answered 5 times
            if (progress[wordId].correct >= 5) {
                progress[wordId].mastered = true;
            }
        } else {
            progress[wordId].incorrect += 1;
            // Reset mastery status if answer is incorrect
            progress[wordId].mastered = false;
        }

        localStorage.setItem('vocabProgress', JSON.stringify(progress));
    },

    // Get all mastered words
    getMasteredWords() {
        const progress = JSON.parse(localStorage.getItem('vocabProgress')) || {};
        return Object.keys(progress).filter(wordId => progress[wordId].mastered);
    },

    // Get progress stats for a unit
    getUnitProgress(unitId) {
        const unit = getUnitById(unitId);
        if (!unit) return { total: 0, mastered: 0, percentage: 0 };

        const progress = JSON.parse(localStorage.getItem('vocabProgress')) || {};
        let masteredCount = 0;

        unit.words.forEach(word => {
            const wordId = `${unitId}-${word.english}`;
            if (progress[wordId] && progress[wordId].mastered) {
                masteredCount += 1;
            }
        });

        return {
            total: unit.words.length,
            mastered: masteredCount,
            percentage: unit.words.length > 0 ? Math.round((masteredCount / unit.words.length) * 100) : 0
        };
    }
};

// Initialize: Load units index when the script loads
loadUnitsIndex().then(() => {
    console.log('Units index loaded successfully');
    // Dispatch event to notify that data is ready
    document.dispatchEvent(new Event('vocabularyDataReady'));
});
