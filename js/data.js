// Vocabulary data structure
const vocabularyData = {
    units: [
        {
            id: 1,
            title: "Unit 1",
            words: [
               // More words for Unit 1 would go here
            ]
        },
        {
            id: 2,
            title: "Unit 2",
            words: [
                // Unit 2 words would go here
            ]
        },
        {
            id: 3,
            title: "Unit 3",
            words: [
                // Unit 3 words would go here
            ]
        },
        {
            id: 4,
            title: "Unit 4",
            words: [
                // Unit 4 words would go here
            ]
        },
        {
            id: 5,
            title: "Unit 5",
            words: [
                {
                    english: "add",
                    chinese: "使增加; 加總",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "addition",
                    chinese: "增加物; 附加物; 增加; 附加; 加法",
                    example: "",
                    audioUrl: ""
                },                
                {
                    english: "anxious",
                    chinese: "焦慮的; 急切的",
                    example: "",
                    audioUrl: ""
                },                
                {
                    english: "balance",
                    chinese: "平衡",
                    example: "",
                    audioUrl: ""
                },                
                {
                    english: "cheat",
                    chinese: "欺騙; 作弊",
                    example: "",
                    audioUrl: ""
                },                
                {
                    english: "confirm",
                    chinese: "確認; 證實",
                    example: "",
                    audioUrl: ""
                },                
                {
                    english: "consider",
                    chinese: "考慮;視為",
                    example: "I will consider your offer carefully.",
                    audioUrl: "audio/consider.mp3"
                },
                {
                    english: "considerate",
                    chinese: "體貼的",
                    example: "",
                    audioUrl: ""
                },                
                {
                    english: "court",
                    chinese: "法院；法庭；宮廷；運動場",
                    example: "",
                    audioUrl: ""
                },  
                {
                    english: "cunning",
                    chinese: "狡猾的，狡猾，奸巧",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "dialogue",
                    chinese: "對話，台詞",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "dominate",
                    chinese: "統治；支配；占優勢",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "dominant",
                    chinese: "領導的；佔優勢的",
                    example: "",
                    audioUrl: ""
                },                
                {
                    english: "excellent",
                    chinese: "優秀的",
                    example: "She did an excellent job on the project.",
                    audioUrl: "audio/excellent.mp3"
                },
                {
                    english: "excellence",
                    chinese: "優秀",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "fairly",
                    chinese: "相當地; 公正地",
                    example: "",
                    audioUrl: ""
                },  
                {
                    english: "fair",
                    chinese: "合理的; 公平的",
                    example: "",
                    audioUrl: ""
                },  
                {
                    english: "frequently",
                    chinese: "時常; 頻繁地; 頻繁的",
                    example: "",
                    audioUrl: ""
                },              
                {
                    english: "frequent",
                    chinese: "頻繁的",
                    example: "",
                    audioUrl: ""
                },              
                {
                    english: "fun",
                    chinese: "樂趣",
                    example: "We had a lot of fun at the party.",
                    audioUrl: "audio/fun.mp3"
                },
                {
                    english: "funny",
                    chinese: "有趣的; 好笑的",
                    example: "",
                    audioUrl: "audio/funny.mp3"
                },
                {
                    english: "guilty",
                    chinese: "有罪惡感的; 有罪的; 罪惡感; 罪行",
                    example: "",
                    audioUrl: ""
                },  
                {
                    english: "guilt",
                    chinese: "罪惡感; 罪行",
                    example: "",
                    audioUrl: ""
                },  
                {
                    english: "have/has",
                    chinese: "擁有; 使用; 吃; 喝",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "interest",
                    chinese: "興趣",
                    example: "He has a keen interest in science.",
                    audioUrl: "audio/interest.mp3"
                },
                {
                    english: "interesting",
                    chinese: "令人覺得有趣的",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "interested",
                    chinese: "感興趣的",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "uninteresting",
                    chinese: "令人感到無趣的",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "loneliness",
                    chinese: "孤單",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "lonely",
                    chinese: "孤單的",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "mail",
                    chinese: "信件，郵件; 寄出",
                    example: "",
                    audioUrl: ""
                },                     
                {
                    english: "minor",
                    chinese: "次要的; 弱勢; 少數族群; 輔修科目; 未成年人; 輔修",
                    example: "",
                    audioUrl: ""
                },                     
                {
                    english: "minornity",
                    chinese: "弱勢; 少數族群",
                    example: "",
                    audioUrl: ""
                },                  
                {
                    english: "mask",
                    chinese: "面具；口罩; 掩飾",
                    example: "",
                    audioUrl: ""
                },                
                {
                    english: "nationality",
                    chinese: "國籍",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "nation",
                    chinese: "國家",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "national",
                    chinese: "adj 國家的; 全國的; NC 國民",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "neglect",
                    chinese: "vt 忽視; 疏忽",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "numerous",
                    chinese: "許多的",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "origin",
                    chinese: "起源; 出生",
                    example: "",
                    audioUrl: ""
                },               
                {
                    english: "original",
                    chinese: "起源的; 原本的; 有原創性的; 原版; 原稿; 原作",
                    example: "",
                    audioUrl: ""
                },                               
                {
                    english: "point",
                    chinese: "點; 看法; 地點; 時間點; 尖端; 重點; 原因; 目的; 指",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "relate",
                    chinese: "使用關聯; 有關聯",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "related",
                    chinese: "相關的",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "relation",
                    chinese: "(人際)關係; 親屬; 關聯",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "relationship",
                    chinese: "關係",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "relative",
                    chinese: "相對的; 親戚",
                    example: "Success is relative to one's goals.",
                    audioUrl: ""
                },
                {
                    english: "relatively",
                    chinese: "相對地",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "religion",
                    chinese: "宗教; 信仰",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "religious",
                    chinese: "宗教的; 有信仰的; 虔誠的",
                    example: "",
                    audioUrl: ""
                },
                {
                    english: "responsible",
                    chinese: "負責的",
                    example: "He is responsible for the project.",
                    audioUrl: "audio/responsible.mp3"
                },                
                {
                    english: "responsibility",
                    chinese: "責任; 職責",
                    example: "It is my responsibility to ensure safety.",
                    audioUrl: ""
                },                
                {
                    english: "silent",
                    chinese: "沉默的",
                    example: "Please remain silent during the test.",
                    audioUrl: "audio/silent.mp3"
                },
                {
                    english: "silence",
                    chinese: "寂靜; 沉默; 使安靜",
                    example: "The silence in the library was deafening.",
                    audioUrl: ""
                },
                {
                    english: "suffer",
                    chinese: "受...之苦; 承受; 受苦",
                    example: "He suffered from a severe headache.",
                    audioUrl: ""
                },
                {
                    english: "underground",
                    chinese: "地下的; 秘密的; 非法的; 在地底下; 袐密地",
                    example: "The underground train system is efficient.",
                    audioUrl: ""
                },
                {
                    english: "understandable",
                    chinese: "能理解的",
                    example: "It's understandable to feel nervous before a test.",
                    audioUrl: ""
                },                
                {
                    english: "understand",
                    chinese: "理解",
                    example: "I understand the lesson.",
                    audioUrl: "audio/understand.mp3"
                },                
                {
                    english: "misunderstand",
                    chinese: "誤解; 誤會",
                    example: "I misunderstood the instructions.",
                    audioUrl: ""
                },             
                {
                    english: "misunderstanding",
                    chinese: "誤會",
                    example: "I had a misunderstanding with my friend.",
                    audioUrl: ""
                },                                                
                {
                    english: "virus",
                    chinese: "病毒",
                    example: "",
                    audioUrl: ""
                },            
                {
                    english: "lonely",
                    chinese: "寂寞的",
                    example: "I feel lonely when everyone is gone.",
                    audioUrl: "audio/lonely.mp3"
                },
                {
                    english: "minor",
                    chinese: "次要的",
                    example: "It's only a minor issue.",
                    audioUrl: "audio/minor.mp3"
                },
                {
                    english: "national",
                    chinese: "國家的",
                    example: "It's a matter of national importance.",
                    audioUrl: "audio/national.mp3"
                },
]
        },
        // Units 6-26 would follow the same pattern
    ]
};

// Function to get all units
function getAllUnits() {
    return vocabularyData.units;
}

// Function to get a specific unit by ID
function getUnitById(unitId) {
    return vocabularyData.units.find(unit => unit.id === parseInt(unitId));
}

// Function to get words from a specific unit
function getWordsFromUnit(unitId) {
    const unit = getUnitById(unitId);
    return unit ? unit.words : [];
}

// Function to get all words from all units
function getAllWords() {
    return vocabularyData.units.reduce((allWords, unit) => {
        return allWords.concat(unit.words);
    }, []);
}

// Function to search for words
function searchWords(query) {
    query = query.toLowerCase();
    return getAllWords().filter(word => 
        word.english.toLowerCase().includes(query) || 
        word.chinese.includes(query)
    );
}

// Function to get a random set of words
function getRandomWords(count, excludeWords = []) {
    const allWords = getAllWords().filter(word => !excludeWords.includes(word));
    const shuffled = [...allWords].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Cloud audio service integration
 * Provides TTS (text-to-speech) functionality for vocabulary words
 */
const cloudAudioService = {
    // Supported cloud providers
    providers: {
        GOOGLE: 'google',
        MICROSOFT: 'microsoft',
        FORVO: 'forvo'
    },
    
    // Current provider - can be changed in settings
    currentProvider: 'google',
    
    // Cache for audio URLs to prevent redundant API calls
    cache: {},
    
    /**
     * Get audio for a word from the cloud service
     * @param {string} word - The English word to get audio for
     * @returns {Promise<string>} - Promise resolving to audio URL
     */
    getWordAudio(word) {
        // Check cache first
        if (this.cache[word]) {
            console.log('Using cached audio URL for:', word);
            return Promise.resolve(this.cache[word]);
        }
        
        // If local audio file exists, use that instead
        const localAudio = `audio/${word.toLowerCase().replace(/\//g, '-')}.mp3`;
        
        // First try to check if local audio exists
        return this.checkLocalAudio(word, localAudio)
            .then(exists => {
                if (exists) {
                    console.log('Using local audio file for:', word);
                    return localAudio;
                }
                
                console.log('No local audio file found, using cloud service for:', word);
                // Use provider-specific implementation if local file doesn't exist
                switch(this.currentProvider) {
                    case this.providers.GOOGLE:
                        return this.getGoogleTTS(word);
                    case this.providers.MICROSOFT:
                        return this.getMicrosoftTTS(word);
                    case this.providers.FORVO:
                        return this.getForvoAudio(word);
                    default:
                        return this.getFallbackAudio(word);
                }
            });
    },

    /**
     * Check if local audio file exists
     * @param {string} word - The word to check
     * @param {string} localPath - Path to the local audio file
     * @returns {Promise<boolean>} - Promise resolving to true if file exists
     */
    checkLocalAudio(word, localPath) {
        return new Promise(resolve => {
            fetch(localPath, { method: 'HEAD' })
                .then(response => {
                    resolve(response.ok);
                })
                .catch(() => {
                    resolve(false);
                });
        });
    },
    
    /**
     * Get audio from Google Cloud TTS
     * @param {string} word - The word to get audio for
     * @returns {Promise<string>} - Audio URL
     */
    getGoogleTTS(word) {
        // For direct browser use, it's better to use a more reliable source
        // FreeDictionaryAPI provides pronunciation URLs
        const dictionaryUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

        return fetch(dictionaryUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data[0] && data[0].phonetics && data[0].phonetics.length > 0) {
                    // Find the first phonetic with audio
                    const phoneticWithAudio = data[0].phonetics.find(p => p.audio);
                    if (phoneticWithAudio && phoneticWithAudio.audio) {
                        const audioUrl = phoneticWithAudio.audio;
                        this.cache[word] = audioUrl;
                        return audioUrl;
                    }
                }
                // If no audio found in dictionary, fallback to synthesized speech
                throw new Error('No pronunciation audio found in dictionary');
            })
            .catch(() => {
                // Fallback to Google Dictionary API as a last resort
                const fallbackUrl = `https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/${word.charAt(0).toLowerCase()}/${word.toLowerCase()}_en_us_1.mp3`;
                this.cache[word] = fallbackUrl;
                return fallbackUrl;
            });
    },
    
    /**
     * Get audio from Microsoft Azure TTS
     * @param {string} word - The word to get audio for
     * @returns {Promise<string>} - Audio URL
     */
    getMicrosoftTTS(word) {
        // In production, this would use the Azure Speech API
        // For this implementation, we'll use a public dictionary API instead
        return this.getGoogleTTS(word);
    },
    
    /**
     * Get audio from Forvo API (real user pronunciations)
     * @param {string} word - The word to get audio for
     * @returns {Promise<string>} - Audio URL
     */
    getForvoAudio(word) {
        // In a real implementation with a Forvo API key, this would call the Forvo API
        // For now, we'll use the dictionary API as a fallback
        return this.getGoogleTTS(word);
    },
    
    /**
     * Fallback to a default audio source if cloud services are unavailable
     * @param {string} word - The word to get audio for
     * @returns {Promise<string>} - Audio URL
     */
    getFallbackAudio(word) {
        // Try various dictionary sources for the audio
        const sources = [
            `https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/${word.charAt(0).toLowerCase()}/${word.toLowerCase()}_en_us_1.mp3`,
            `https://media.merriam-webster.com/audio/prons/en/us/mp3/${word.charAt(0).toLowerCase()}/${word.toLowerCase()}.mp3`,
            `https://audio.oxforddictionaries.com/en/mp3/${word.toLowerCase()}_us_1.mp3`
        ];
        
        // Try each source in sequence
        const trySource = (index) => {
            if (index >= sources.length) {
                // All sources failed, resolve with the first one anyway
                this.cache[word] = sources[0];
                return Promise.resolve(sources[0]);
            }
            
            return fetch(sources[index], { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        this.cache[word] = sources[index];
                        return sources[index];
                    }
                    // Try next source
                    return trySource(index + 1);
                })
                .catch(() => {
                    // Try next source
                    return trySource(index + 1);
                });
        };
        
        return trySource(0);
    },
    
    /**
     * Set the current TTS provider
     * @param {string} provider - Provider name from this.providers
     */
    setProvider(provider) {
        if (Object.values(this.providers).includes(provider)) {
            this.currentProvider = provider;
            // Clear cache when changing providers to ensure fresh URLs
            this.cache = {};
        } else {
            console.error(`Invalid provider: ${provider}. Using default.`);
            this.currentProvider = this.providers.GOOGLE;
        }
    },
    
    /**
     * Get available providers
     * @returns {Array<string>} - List of provider names
     */
    getAvailableProviders() {
        return Object.values(this.providers);
    }
};

// Enhanced function to play audio with fallback to cloud services
function playAudio(audioUrl, word) {
    // Show debug information
    console.log('Playing audio for:', word || 'unknown word', 'URL:', audioUrl);
    
    // If we don't have an audioUrl but we have a word, go directly to cloud service
    if ((!audioUrl || audioUrl === "") && word) {
        console.log('No audio URL provided, using cloud service directly for:', word);
        
        cloudAudioService.getWordAudio(word)
            .then(cloudUrl => {
                console.log('Retrieved cloud audio URL:', cloudUrl);
                playAudioFromUrl(cloudUrl);
            })
            .catch(err => {
                console.error('Failed to get cloud audio:', err);
            });
        return;
    }
    
    // Try to play the provided URL
    playAudioFromUrl(audioUrl, word);
}

/**
 * Play audio from a URL with error handling
 * @param {string} url - The audio URL to play
 * @param {string} [word] - Optional word for cloud fallback
 */
function playAudioFromUrl(url, word) {
    const audio = new Audio(url);
    
    audio.addEventListener('error', (e) => {
        console.log('Audio error:', e);
        console.log('Local audio file not found or error playing:', url);
        
        if (word) {
            // Try to get audio from cloud service if local fails
            cloudAudioService.getWordAudio(word)
                .then(cloudUrl => {
                    if (cloudUrl !== url) { // Avoid infinite loop
                        console.log('Using cloud audio for:', word);
                        const cloudAudio = new Audio(cloudUrl);
                        cloudAudio.play().catch(err => {
                            console.error('Cloud audio playback error:', err);
                        });
                    } else {
                        console.error('Cloud service returned the same URL that failed');
                    }
                })
                .catch(err => {
                    console.error('Cloud audio failed:', err);
                });
        }
    });
    
    audio.play().catch(err => {
        console.error('Audio playback error:', err);
    });
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