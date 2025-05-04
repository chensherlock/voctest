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
            title: "課本 Unit 3",
            words: [
                {
                    english: "reality",
                    chinese: "n.[U][C]現實",
                    example: ""
                },
                {
                    english: "add",
                    chinese: "vt.加",
                    example: ""
                },
                {
                    english: "effect",
                    chinese: "n.[C] 特效; 效果, n[C][U] 影響",
                    example: ""
                },                
                {
                    english: "effective",
                    chinese: "adj. 有效的",
                    example: ""
                },                    
                {
                    english: "appearance",
                    chinese: "外表",
                    example: ""
                },
                {
                    english: "involved",
                    chinese: "參與的; 有關的",
                    example: ""
                },                
                {
                    english: "involve",
                    chinese: "包含; 與...有關",
                    example: ""
                },                             
                {
                    english: "scary",
                    chinese: "可怕的",
                    example: ""
                },                    
                {
                    english: "wild",
                    chinese: "荒野的; 野生環境; 野生的",
                    example: ""
                },                            
                {
                    english: "information",
                    chinese: "資訊; 消息",
                    example: ""
                },                        
                {
                    english: "inform",
                    chinese: "告知",
                    example: ""
                },                                                                                                
                {
                    english: "scene",
                    chinese: "場景",
                    example: ""
                },                            
                {
                    english: "image",
                    chinese: "影像; 圖像",
                    example: ""
                },                            
                {
                    english: "extra",
                    chinese: "額外的; 另外的",
                    example: ""
                },                            
                {
                    english: "curious",
                    chinese: "好奇的",
                    example: ""
                },                            
                {
                    english: "curiosity",
                    chinese: "好奇心",
                    example: ""
                },                    
                {
                    english: "explore",
                    chinese: "探索",
                    example: ""
                },                  
                {
                    english: "develop",
                    chinese: "vi vt 發展; 成長",
                    example: ""
                },                                                  
                {
                    english: "development",
                    chinese: "n [U] 發展; 成長",
                    example: ""
                },                                      
                {
                    english: "argumented",
                    chinese: "adj. 擴增的",
                    example: ""
                },                                                      
                {
                    english: "virtual",
                    chinese: "adj. 虛擬的",
                    example: ""
                },                         
                {
                    english: "digital",
                    chinese: "adj. 數位的",
                    example: ""
                },                         
                {
                    english: "mirror",
                    chinese: "n.[C] 鏡子",
                    example: ""
                },                      
                {
                    english: "outer space",
                    chinese: "n.[U] 外太空",
                    example: ""
                },                          
                {
                    english: "headset",
                    chinese: "n.[C] 頭戴裝置",
                    example: ""
                },                                                                                                         
            ]
        },
        {
            id: 4,
            title: "課本 Unit 4",
            words: [
                {
                    english: "consider",
                    chinese: "vt vi 考慮",
                    example: ""
                },  
                {
                    english: "consideration",
                    chinese: "n. [U] 考慮",
                    example: ""
                },                  
                {
                    english: "situation",
                    chinese: "情況",
                    example: ""
                },                
                {
                    english: "tend",
                    chinese: "傾向; 往往",
                    example: ""
                },                      
                {
                    english: "crowd",
                    chinese: "群眾",
                    example: ""
                },                                                                  
                {
                    english: "daily",
                    chinese: "日常的; 每天的",
                    example: ""
                },                                                                  
                {
                    english: "suddenly",
                    chinese: "突然",
                    example: ""
                },                                                                  
                {
                    english: "include",
                    chinese: "vt 包括",
                    example: ""
                },                
                {
                    english: "including",
                    chinese: "prep 包含",
                    example: ""
                },                
                {
                    english: "gesture",
                    chinese: "手勢",
                    example: ""
                },                
                {
                    english: "rapidly",
                    chinese: "adv 迅速地",
                    example: ""
                },                
                {
                    english: "rapid",
                    chinese: "adj 迅速的",
                    example: ""
                },                
                {
                    english: "besides",
                    chinese: "adv 此外",
                    example: ""
                },                
                {
                    english: "drama",
                    chinese: "戲劇",
                    example: ""
                },                
                {
                    english: "unfortunately",
                    chinese: "不幸地",
                    example: ""
                },                
                {
                    english: "fortunate",
                    chinese: "adj. 幸運的",
                    example: ""
                },                
                {
                    english: "harmful",
                    chinese: "adj. 有害的",
                    example: ""
                },                
                {
                    english: "harm",
                    chinese: "n.[U] 傷害",
                    example: ""
                },                
                {
                    english: "pressure",
                    chinese: "n.[U][C] 壓力",
                    example: ""
                },                
                {
                    english: "isolate",
                    chinese: "vt. 孤立",
                    example: ""
                },                
                {
                    english: "cutlet",
                    chinese: "n.[C] 肉排",
                    example: ""
                },              
                {
                    english: "stall",
                    chinese: "n.[C] 攤子; 攤位",
                    example: ""
                },              
                {
                    english: "vendor",
                    chinese: "n.[C] 攤販; 小販",
                    example: ""
                },              
                {
                    english: "pocker face",
                    chinese: "n.[C] 撲克臉; 面無表情",
                    example: ""
                },              
                {
                    english: "herd",
                    chinese: "n.[C] 群眾; 牧群",
                    example: ""
                },                            
                {
                    english: "peer",
                    chinese: "n.[C] 同儕; 同輩",
                    example: ""
                },                            
                {
                    english: "bully",
                    chinese: "vt. 霸凌",
                    example: ""
                },                                                              
            ]
        },
        {
            id: 5,
            title: "高頻 Unit 5",
            words: [
                {
                    english: "add",
                    chinese: "使增加; 加總",
                    example: ""
                },
                {
                    english: "addition",
                    chinese: "增加物; 附加物; 增加; 附加; 加法",
                    example: ""
                },                
                {
                    english: "anxious",
                    chinese: "焦慮的; 急切的",
                    example: ""
                },                
                {
                    english: "balance",
                    chinese: "平衡",
                    example: ""
                },                
                {
                    english: "cheat",
                    chinese: "欺騙; 作弊",
                    example: ""
                },                
                {
                    english: "confirm",
                    chinese: "確認; 證實",
                    example: ""
                },                
                {
                    english: "consider",
                    chinese: "考慮;視為",
                    example: "I will consider your offer carefully."
                },
                {
                    english: "considerate",
                    chinese: "體貼的",
                    example: ""
                },                
                {
                    english: "court",
                    chinese: "法院；法庭；宮廷；運動場",
                    example: ""
                },  
                {
                    english: "cunning",
                    chinese: "狡猾的，狡猾，奸巧",
                    example: ""
                },
                {
                    english: "dialogue",
                    chinese: "對話，台詞",
                    example: ""
                },
                {
                    english: "dominate",
                    chinese: "統治；支配；占優勢",
                    example: ""
                },
                {
                    english: "dominant",
                    chinese: "領導的；佔優勢的",
                    example: ""
                },                
                {
                    english: "excellent",
                    chinese: "優秀的",
                    example: "She did an excellent job on the project."
                },
                {
                    english: "excellence",
                    chinese: "優秀",
                    example: ""
                },
                {
                    english: "fairly",
                    chinese: "相當地; 公正地",
                    example: ""
                },  
                {
                    english: "fair",
                    chinese: "合理的; 公平的",
                    example: ""
                },  
                {
                    english: "frequently",
                    chinese: "時常; 頻繁地; 頻繁的",
                    example: ""
                },              
                {
                    english: "frequent",
                    chinese: "頻繁的",
                    example: ""
                },              
                {
                    english: "fun",
                    chinese: "樂趣",
                    example: "We had a lot of fun at the party."
                },
                {
                    english: "funny",
                    chinese: "有趣的; 好笑的",
                    example: ""
                },
                {
                    english: "guilty",
                    chinese: "有罪惡感的; 有罪的; 罪惡感; 罪行",
                    example: ""
                },  
                {
                    english: "guilt",
                    chinese: "罪惡感; 罪行",
                    example: ""
                },  
                {
                    english: "have/has",
                    chinese: "擁有; 使用; 吃; 喝",
                    example: ""
                },
                {
                    english: "interest",
                    chinese: "興趣",
                    example: "He has a keen interest in science."
                },
                {
                    english: "interesting",
                    chinese: "令人覺得有趣的",
                    example: ""
                },
                {
                    english: "interested",
                    chinese: "感興趣的",
                    example: ""
                },
                {
                    english: "uninteresting",
                    chinese: "令人感到無趣的",
                    example: ""
                },
                {
                    english: "loneliness",
                    chinese: "孤單",
                    example: ""
                },
                {
                    english: "lonely",
                    chinese: "孤單的",
                    example: ""
                },
                {
                    english: "mail",
                    chinese: "信件，郵件; 寄出",
                    example: ""
                },                     
                {
                    english: "minor",
                    chinese: "次要的; 弱勢; 少數族群; 輔修科目; 未成年人; 輔修",
                    example: ""
                },                     
                {
                    english: "minornity",
                    chinese: "弱勢; 少數族群",
                    example: ""
                },                  
                {
                    english: "mask",
                    chinese: "面具；口罩; 掩飾",
                    example: ""
                },                
                {
                    english: "nationality",
                    chinese: "國籍",
                    example: ""
                },
                {
                    english: "nation",
                    chinese: "國家",
                    example: ""
                },
                {
                    english: "national",
                    chinese: "adj 國家的; 全國的; NC 國民",
                    example: ""
                },
                {
                    english: "neglect",
                    chinese: "vt 忽視; 疏忽",
                    example: ""
                },
                {
                    english: "numerous",
                    chinese: "許多的",
                    example: ""
                },
                {
                    english: "origin",
                    chinese: "起源; 出生",
                    example: ""
                },               
                {
                    english: "original",
                    chinese: "起源的; 原本的; 有原創性的; 原版; 原稿; 原作",
                    example: ""
                },                               
                {
                    english: "point",
                    chinese: "點; 看法; 地點; 時間點; 尖端; 重點; 原因; 目的; 指",
                    example: ""
                },
                {
                    english: "relate",
                    chinese: "使用關聯; 有關聯",
                    example: ""
                },
                {
                    english: "related",
                    chinese: "相關的",
                    example: ""
                },
                {
                    english: "relation",
                    chinese: "(人際)關係; 親屬; 關聯",
                    example: ""
                },
                {
                    english: "relationship",
                    chinese: "關係",
                    example: ""
                },
                {
                    english: "relative",
                    chinese: "相對的; 親戚",
                    example: "Success is relative to one's goals."
                },
                {
                    english: "relatively",
                    chinese: "相對地",
                    example: ""
                },
                {
                    english: "religion",
                    chinese: "宗教; 信仰",
                    example: ""
                },
                {
                    english: "religious",
                    chinese: "宗教的; 有信仰的; 虔誠的",
                    example: ""
                },
                {
                    english: "responsible",
                    chinese: "負責的",
                    example: "He is responsible for the project."
                },                
                {
                    english: "responsibility",
                    chinese: "責任; 職責",
                    example: "It is my responsibility to ensure safety."
                },                
                {
                    english: "silent",
                    chinese: "沉默的",
                    example: "Please remain silent during the test."
                },
                {
                    english: "silence",
                    chinese: "寂靜; 沉默; 使安靜",
                    example: "The silence in the library was deafening."
                },
                {
                    english: "suffer",
                    chinese: "受...之苦; 承受; 受苦",
                    example: "He suffered from a severe headache."
                },
                {
                    english: "underground",
                    chinese: "地下的; 秘密的; 非法的; 在地底下; 袐密地",
                    example: "The underground train system is efficient."
                },
                {
                    english: "understandable",
                    chinese: "能理解的",
                    example: "It's understandable to feel nervous before a test."
                },                
                {
                    english: "understand",
                    chinese: "理解",
                    example: "I understand the lesson."
                },                
                {
                    english: "misunderstand",
                    chinese: "誤解; 誤會",
                    example: "I misunderstood the instructions."
                },             
                {
                    english: "misunderstanding",
                    chinese: "誤會",
                    example: "I had a misunderstanding with my friend."
                },                                                
                {
                    english: "virus",
                    chinese: "病毒",
                    example: ""
                },            
                {
                    english: "lonely",
                    chinese: "寂寞的",
                    example: "I feel lonely when everyone is gone."
                },
                {
                    english: "minor",
                    chinese: "次要的",
                    example: "It's only a minor issue."
                },
                {
                    english: "national",
                    chinese: "國家的",
                    example: "It's a matter of national importance."
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