// Vocabulary data
const vocabularyData = {
    units: [
        {
            id: 1,
            title: "課本 Unit 3",
            default: false,
            words: [
                { english: "reality", chinese: "n.[U][C]現實", example: "" },
                { english: "add", chinese: "vt.加", example: "" },
                { english: "effect", chinese: "n.[C] 特效; 效果, n[C][U] 影響", example: "" },
                { english: "effective", chinese: "adj. 有效的", example: "" },
                { english: "appearance", chinese: "外表", example: "" },
                { english: "involved", chinese: "參與的; 有關的", example: "" },
                { english: "involve", chinese: "包含; 與...有關", example: "" },
                { english: "scary", chinese: "可怕的", example: "" },
                { english: "wild", chinese: "荒野的; 野生環境; 野生的", example: "" },
                { english: "information", chinese: "資訊; 消息", example: "" },
                { english: "inform", chinese: "告知", example: "" },
                { english: "scene", chinese: "場景", example: "" },
                { english: "image", chinese: "影像; 圖像", example: "" },
                { english: "extra", chinese: "額外的; 另外的", example: "" },
                { english: "curious", chinese: "好奇的", example: "" },
                { english: "curiosity", chinese: "好奇心", example: "" },
                { english: "explore", chinese: "探索", example: "" },
                { english: "develop", chinese: "vi vt 發展; 成長", example: "" },
                { english: "development", chinese: "n [U] 發展; 成長", example: "" },
                { english: "augmented", chinese: "adj. 擴增的", example: "" },
                { english: "virtual", chinese: "adj. 虛擬的", example: "" },
                { english: "digital", chinese: "adj. 數位的", example: "" },
                { english: "mirror", chinese: "n.[C] 鏡子", example: "" },
                { english: "outer space", chinese: "n.[U] 外太空", example: "" },
                { english: "headset", chinese: "n.[C] 頭戴裝置", example: "" }
            ]
        },
        {
            id: 2,
            title: "課本 Unit 4",
            default: false,
            words: [
                { english: "consider", chinese: "vt vi 考慮", example: "" },
                { english: "consideration", chinese: "n. [U] 考慮", example: "" },
                { english: "situation", chinese: "情況", example: "" },
                { english: "tend", chinese: "傾向; 往往", example: "" },
                { english: "crowd", chinese: "群眾", example: "" },
                { english: "daily", chinese: "日常的; 每天的", example: "" },
                { english: "suddenly", chinese: "突然", example: "" },
                { english: "include", chinese: "vt 包括", example: "" },
                { english: "including", chinese: "prep 包含", example: "" },
                { english: "gesture", chinese: "手勢", example: "" },
                { english: "rapidly", chinese: "adv 迅速地", example: "" },
                { english: "rapid", chinese: "adj 迅速的", example: "" },
                { english: "besides", chinese: "adv 此外", example: "" },
                { english: "drama", chinese: "戲劇", example: "" },
                { english: "unfortunately", chinese: "不幸地", example: "" },
                { english: "fortunate", chinese: "adj. 幸運的", example: "" },
                { english: "harmful", chinese: "adj. 有害的", example: "" },
                { english: "harm", chinese: "n.[U] 傷害", example: "" },
                { english: "pressure", chinese: "n.[U][C] 壓力", example: "" },
                { english: "isolate", chinese: "vt. 孤立", example: "" },
                { english: "cutlet", chinese: "n.[C] 肉排", example: "" },
                { english: "stall", chinese: "n.[C] 攤子; 攤位", example: "" },
                { english: "vendor", chinese: "n.[C] 攤販; 小販", example: "" },
                { english: "poker face", chinese: "n.[C] 撲克臉; 面無表情", example: "" },
                { english: "herd", chinese: "n.[C] 群眾; 牧群", example: "" },
                { english: "peer", chinese: "n.[C] 同儕; 同輩", example: "" },
                { english: "bully", chinese: "vt. 霸凌", example: "" }
            ]
        },
        {
            id: 3,
            title: "高頻 Unit 5",
            default: false,
            words: [
                { english: "add", chinese: "使增加; 加總", example: "" },
                { english: "addition", chinese: "增加物; 附加物; 增加; 附加; 加法", example: "" },
                { english: "anxious", chinese: "焦慮的; 急切的", example: "" },
                { english: "balance", chinese: "平衡", example: "" },
                { english: "cheat", chinese: "欺騙; 作弊", example: "" },
                { english: "confirm", chinese: "確認; 證實", example: "" },
                { english: "consider", chinese: "考慮;視為", example: "I will consider your offer carefully." },
                { english: "considerate", chinese: "體貼的", example: "" },
                { english: "court", chinese: "法院；法庭；宮廷；運動場", example: "" },
                { english: "cunning", chinese: "狡猾的，狡猾，奸巧", example: "" },
                { english: "dialogue", chinese: "對話，台詞", example: "" },
                { english: "dominate", chinese: "統治；支配；占優勢", example: "" },
                { english: "dominant", chinese: "領導的；佔優勢的", example: "" },
                { english: "excellent", chinese: "優秀的", example: "She did an excellent job on the project." },
                { english: "excellence", chinese: "優秀", example: "" },
                { english: "fairly", chinese: "相當地; 公正地", example: "" },
                { english: "fair", chinese: "合理的; 公平的", example: "" },
                { english: "frequently", chinese: "時常; 頻繁地; 頻繁的", example: "" },
                { english: "frequent", chinese: "頻繁的", example: "" },
                { english: "fun", chinese: "樂趣", example: "We had a lot of fun at the party." },
                { english: "funny", chinese: "有趣的; 好笑的", example: "" },
                { english: "guilty", chinese: "有罪惡感的; 有罪的; 罪惡感; 罪行", example: "" },
                { english: "guilt", chinese: "罪惡感; 罪行", example: "" },
                { english: "have/has", chinese: "擁有; 使用; 吃; 喝", example: "" },
                { english: "interest", chinese: "興趣", example: "He has a keen interest in science." },
                { english: "interesting", chinese: "令人覺得有趣的", example: "" },
                { english: "interested", chinese: "感興趣的", example: "" },
                { english: "uninteresting", chinese: "令人感到無趣的", example: "" },
                { english: "loneliness", chinese: "孤單", example: "" },
                { english: "lonely", chinese: "孤單的", example: "" },
                { english: "mail", chinese: "信件，郵件; 寄出", example: "" },
                { english: "minor", chinese: "次要的; 弱勢; 少數族群; 輔修科目; 未成年人; 輔修", example: "" },
                { english: "minority", chinese: "弱勢; 少數族群", example: "" },
                { english: "mask", chinese: "面具；口罩; 掩飾", example: "" },
                { english: "nationality", chinese: "國籍", example: "" },
                { english: "nation", chinese: "國家", example: "" },
                { english: "national", chinese: "adj 國家的; 全國的; NC 國民", example: "" },
                { english: "neglect", chinese: "vt 忽視; 疏忽", example: "" },
                { english: "numerous", chinese: "許多的", example: "" },
                { english: "origin", chinese: "起源; 出生", example: "" },
                { english: "original", chinese: "起源的; 原本的; 有原創性的; 原版; 原稿; 原作", example: "" },
                { english: "point", chinese: "點; 看法; 地點; 時間點; 尖端; 重點; 原因; 目的; 指", example: "" },
                { english: "relate", chinese: "使用關聯; 有關聯", example: "" },
                { english: "related", chinese: "相關的", example: "" },
                { english: "relation", chinese: "(人際)關係; 親屬; 關聯", example: "" },
                { english: "relationship", chinese: "關係", example: "" },
                { english: "relative", chinese: "相對的; 親戚", example: "Success is relative to one's goals." },
                { english: "relatively", chinese: "相對地", example: "" },
                { english: "religion", chinese: "宗教; 信仰", example: "" },
                { english: "religious", chinese: "宗教的; 有信仰的; 虔誠的", example: "" },
                { english: "responsible", chinese: "負責的", example: "He is responsible for the project." },
                { english: "responsibility", chinese: "責任; 職責", example: "It is my responsibility to ensure safety." },
                { english: "silent", chinese: "沉默的", example: "Please remain silent during the test." },
                { english: "silence", chinese: "寂靜; 沉默; 使安靜", example: "The silence in the library was deafening." },
                { english: "suffer", chinese: "受...之苦; 承受; 受苦", example: "He suffered from a severe headache." },
                { english: "underground", chinese: "地下的; 秘密的; 非法的; 在地底下; 袐密地", example: "The underground train system is efficient." },
                { english: "understandable", chinese: "能理解的", example: "It's understandable to feel nervous before a test." },
                { english: "understand", chinese: "理解", example: "I understand the lesson." },
                { english: "misunderstand", chinese: "誤解; 誤會", example: "I misunderstood the instructions." },
                { english: "misunderstanding", chinese: "誤會", example: "I had a misunderstanding with my friend." },
                { english: "virus", chinese: "病毒", example: "" },
                { english: "lonely", chinese: "寂寞的", example: "I feel lonely when everyone is gone." },
                { english: "minor", chinese: "次要的", example: "It's only a minor issue." },
                { english: "national", chinese: "國家的", example: "It's a matter of national importance." }
            ]
        },
        {
            id: 4,
            title: "📚 課本 Unit 5",
            default: false,
            words: [
                { english: "costume", chinese: "n. [C][U] (特殊場合的) 服裝", example: "" },
                { english: "ability", chinese: "n. [C][U] 才能", example: "" },
                { english: "weakness", chinese: "n. [C] 缺點，弱點", example: "" },
                { english: "personal", chinese: "adj. 個人的，私人的", example: "" },
                { english: "normal", chinese: "adj. 一般的，正常的", example: "" },
                { english: "murder", chinese: "vt. 謀殺", example: "" },
                { english: "depressed", chinese: "adj. 沮喪的，憂鬱的", example: "" },
                { english: "depress", chinese: "vt. 使沮喪", example: "" },
                { english: "crime", chinese: "n. [U][C] 犯罪，罪行", example: "" },
                { english: "anger", chinese: "n. [U] 憤怒，生氣", example: "" },
                { english: "protect", chinese: "vt.; vi. 保護", example: "" },
                { english: "protection", chinese: "n. [U] 保護力", example: "" },
                { english: "childhood", chinese: "n. [C][U] 童年，孩童時期", example: "" },
                { english: "female", chinese: "adj.女性的者 / n. [C] 女性，女子", example: "" },
                { english: "respect", chinese: "vt. 尊敬 / n. [U] 尊敬", example: "" },
                { english: "emotion", chinese: "n. [C][U] 情緒，情感", example: "" },
                { english: "emotional", chinese: "adj. 情緒的，情感的", example: "" },
                { english: "negative", chinese: "adj. 不好的，負面的", example: "" },
                { english: "superhero", chinese: "n. [C] 超級英雄", example: "" },
                { english: "hero", chinese: "n. [C] 英雄", example: "" },
                { english: "heroine", chinese: "n. [C] 女英雄", example: "" },
                { english: "high-tech", chinese: "adj. 高科技的", example: "" },
                { english: "weapon", chinese: "n. [C] 武器", example: "" },
                { english: "pilot", chinese: "n. [C] 飛行員", example: "" },
                { english: "extraordinary", chinese: "adj. 非凡的", example: "" },
                { english: "believe it or not", chinese: "信不信由你", example: "" },
                { english: "get over", chinese: "從......恢復", example: "" },
                { english: "make A into B", chinese: "把A變成B", example: "" },
                { english: "deal with", chinese: "處理，應付", example: "" }
            ]
        },
        {
            id: 5,
            title: "課本 Unit 6",
            default: false,
            words: [
                { english: "bargain", chinese: "n. [C] 特價商品 / vi 討價還價", example: "" },
                { english: "quality", chinese: "n. [U][C] 品質", example: "" },
                { english: "company", chinese: "n. [C] 公司", example: "" },
                { english: "career", chinese: "n. [C] 職業(生涯), 事業", example: "" },
                { english: "explosion", chinese: "n. [U][C] 爆炸", example: "" },
                { english: "explode", chinese: "vi. vt. 爆炸", example: "" },
                { english: "injure", chinese: "vt. 使受傷, 傷害", example: "" },
                { english: "injury", chinese: "n. [U][C] 傷害, 損害", example: "" },
                { english: "instead", chinese: "adv. 相反地, 卻", example: "" },
                { english: "improve", chinese: "vt. vi. 改進, 改善", example: "" },
                { english: "improvement", chinese: "n. [U][C] 改進, 改善", example: "" },
                { english: "skill", chinese: "n. [U][C] 技巧, 技能", example: "" },
                { english: "demand", chinese: "vt. 要求, 請求 / n. [U][C] 要求, 需求", example: "" },
                { english: "product", chinese: "n. [U][C] 產品", example: "" },
                { english: "productive", chinese: "adj. 多產的", example: "" },
                { english: "supply", chinese: "vt. 提供, 供應 / n. [C] 供應量", example: "" },
                { english: "succeed", chinese: "vt. 成功(做...)", example: "" },
                { english: "gentle", chinese: "adj. 溫柔", example: "" },
                { english: "scare...away", chinese: "把...嚇跑", example: "" },
                { english: "figure out", chinese: "明白, 理解", example: "" },
                { english: "take...seriously", chinese: "認真看待", example: "" },
                { english: "rain or shine", chinese: "無論如何, 風雨無阻", example: "" },
                { english: "pass by", chinese: "經過", example: "" },
            ]
        },
        {
            id: 6,
            title: "高頻 Unit 6",
            default: false,
            words: [
                { english: "abbreviate", chinese: "vt. 縮寫, 使變短", example: "" },
                { english: "abbreviation", chinese: "n. [C] 縮寫", example: "" },
                { english: "afford", chinese: "vt. 負擔得起, 承擔得起", example: "" },
                { english: "affordable", chinese: "adj. 負擔得起的", example: "" },
                { english: "cancellation", chinese: "n. [C] [U] 取消", example: "" },
                { english: "cancel", chinese: "vt. vi. 取消", example: "" },
                { english: "clap", chinese: "vt. vi. 拍(手); 鼓(掌) / n. [C] 巨響; 拍手", example: "" },
                { english: "complain", chinese: "vt. vi. 抱怨; 申訴", example: "" },
                { english: "complaint", chinese: "n. [U] [C] 抱怨;申訴", example: "" },
                { english: "completely", chinese: "adv. 完全, 絕對", example: "" },
                { english: "incomplete", chinese: "adj. 不完整的; 未完成的", example: "" },
                { english: "complete", chinese: "adj. 完全的; 完整的, vt. 完成; 使完整", example: "" },
                { english: "conversation", chinese: "n. [C] [U] 對話, 談話", example: "" },
                { english: "converse", chinese: "v. adj. vi. 交談, adj 相反的", example: "" },
                { english: "dedication", chinese: "n. [U] [C] 奉獻, 致力", example: "" },
                { english: "dedicate", chinese: "vt. 使奉獻, 使致力於", example: "" },
                { english: "defender", chinese: "n. [C] 守衛者; 擁護者; 辯護者", example: "" },
                { english: "defend", chinese: "vt. 抵禦;防守;為..辯護", example: "" },
                { english: "defense", chinese: "n. [U] 抵禦;防守;辯護", example: "" },
                { english: "dirt", chinese: "n [U] 泥濘; 灰塵", example: "" },
                { english: "dirty", chinese: "adj. 髒的", example: "" },
                { english: "disappear", chinese: "vt. 消失", example: "" },
                { english: "appear", chinese: "vt. 出現;似乎", example: "" },
                { english: "float", chinese: "vt. 使漂浮 vi. 漂浮; 飄浮", example: "" },
                { english: "geographical", chinese: "adj. 地理的", example: "" },
                { english: "geography", chinese: "n. [U] 地理(學)", example: "" },
                { english: "hike", chinese: "n. [C] 健行 vt. vi. 健行(於)", example: "" },
                { english: "hiking", chinese: "n. [U] 健行", example: "" },
                { english: "impact", chinese: "n [C] 影響, 衝擊 vt. vi. 影響", example: "" },
                { english: "intend", chinese: "vt. 意圖", example: "" },
                { english: "intention", chinese: "n. [C] [U] 意圖", example: "" },
                { english: "leak", chinese: "vt. vi. 漏, 滲; 洩漏 n. [C] 漏出(物);漏洞", example: "" },
                { english: "long", chinese: "adj. 長的; 久的 adv. 久久地", example: "" },
                { english: "motto", chinese: "n. [C] 座右銘; 格", example: "" },
                { english: "promote", chinese: "vt. 提倡; 宣傳; 使升遷", example: "" },
                { english: "promotion", chinese: "n. [C] [U] 宣傳; 升遷", example: "" },
                { english: "put", chinese: "vt. 放置; 使處於(...的狀態)", example: "" },
                { english: "robot", chinese: "n. [C] 機器人", example: "" },
                { english: "rude", chinese: "adj. 無禮的", example: "" },
                { english: "safety", chinese: "n. [U] 安全", example: "" },
                { english: "safe", chinese: "adj. 安全", example: "" },
                { english: "skill", chinese: "n. [C] [U] 技能 (=ability)", example: "" },
                { english: "skillfully", chinese: "adv. 巧妙地, 有技巧地", example: "" },
                { english: "skillful", chinese: "adj. 熟練的", example: "" },
                { english: "strange", chinese: "adj. 奇怪的", example: "" },
                { english: "stranger", chinese: "n. [C] 陌生人", example: "" },
                { english: "sweeten", chinese: "vt. 使變甜", example: "" },
                { english: "sweet", chinese: "adj. 甜的; 討人喜歡的", example: "" },
                { english: "transfer", chinese: "vt. 使轉移; 使調動;使轉乘 n. [C] [U] 轉移; 調動", example: "" },
                { english: "useful", chinese: "adj. 有用的; 有益的", example: "" },
                { english: "use", chinese: "v. n. vt. 使用 n.[S] [U] 使用 [C] [U] 用法", example: "" },
                { english: "useless", chinese: "adj. 無用的", example: "" },
                { english: "misuse", chinese: "n. [C] [U] 誤用; 濫用 vt. 誤用; 濫用", example: "" },
                { english: "vacation", chinese: "n. [C] [U] 度假; 休假", example: "" },
                { english: "visit", chinese: "vt. vi 拜訪; 造訪; 參觀 n. [C] 拜訪; 造訪; 參觀", example: "" },
                { english: "visitor", chinese: "n [C] 訪客; 參觀者", example: "" },
                { english: "wake", chinese: "vt vi (使)醒來", example: "" },
                { english: "weak", chinese: "adj. 弱的; 虛弱的", example: "" },
                { english: "weaken", chinese: "vt. vi. (使) 變弱", example: "" },
            ]
        },
        {
            id: 7,
            title: "📚 高頻 Unit 7",
            default: true,
            words: [
                { english: "anniversary", chinese: "n. [C] 周年紀念", example: "" },
                { english: "appropriate", chinese: "adj. 適當的", example: "" },
                { english: "appropriately", chinese: "adv. 適當地", example: "" },
                { english: "beginning", chinese: "n. [C] 開始", example: "" },
                { english: "begin", chinese: "vt. vi. 開始", example: "begin-began-begun" },
                { english: "celebrate", chinese: "vt. 慶祝", example: "" },
                { english: "celebration", chinese: "n. [C] [U] 慶祝", example: "" },
                { english: "decline", chinese: "vi. 婉拒, vi. 減少, 下降, 衰退, 惡化 n. [C] [U] 下降, 減少, 衰退, 惡化", example: "" },
                { english: "enable", chinese: "vt. 使能夠", example: "" },
                { english: "enjoyable", chinese: "adj. 令人愉快的", example: "" },
                { english: "enjoy", chinese: "vt. 享受, 喜歡", example: "" },
                { english: "fast", chinese: "adj. 快速的, adv. 快速地, 牢固地", example: "" },
                { english: "feature", chinese: "n. [C] 特色, 臉部表情, 專欄, vt. 以...為特色, 以...為主角, vi. 在...中扮演重要角色", example: "" },
                { english: "freeze", chinese: "vt. 使涷結, vi. 涷結, 感到涷僵", example: "" },
                { english: "frozen", chinese: "adj. 冰涷的", example: "" },
                { english: "gentle", chinese: "adj. 溫文儒雅的", example: "" },
                { english: "gentleman", chinese: "n. [C] 紳士", example: "" },
                { english: "grow", chinese: "vt. 使成長 vi. 成長, 變得", example: "" },
                { english: "grower", chinese: "n. [C] 種植者, 農家", example: "" },
                { english: "health", chinese: "n. [U] 健康", example: "" },
                { english: "healthy", chinese: "adj. 健康的", example: "" },
                { english: "heavy", chinese: "adj. 重的, 大量的, 厚實的", example: "" },
                { english: "heavily", chinese: "adv. 沉重地, 非常, 大量地", example: "" },
                { english: "help", chinese: "vt. 幫助, 給予(食物), vt. 有幫助, n. [U] 幫助", example: "" },
                { english: "helpless", chinese: "adj. 無助的", example: "" },
                { english: "hesitate", chinese: "vi. 猶豫, 遲疑", example: "" },
                { english: "hesitant", chinese: "adj. 猶豫的, 遲疑的", example: "" },
                { english: "hesitation", chinese: "n. [C] 猶豫, 遲疑", example: "" },
                { english: "link", chinese: "vt. 使有關係, 使連結, n. [C] 連結, 關係", example: "" },
                { english: "listener", chinese: "n. [C] 聆聽者", example: "" },
                { english: "listen", chinese: "vt. 聆聽, 傾聽", example: "" },
                { english: "luck", chinese: "n. [U] 運氣, 機運, 成功", example: "" },
                { english: "lucky", chinese: "adj. 幸運的", example: "" },
                { english: "match", chinese: "n. [C] 火柴, (網球)比賽, S:相配之物, vt. vi. (使)相對應, (使)相配", example: "" },
                { english: "motorist", chinese: "n. [C] 駕駛, 司機", example: "" },
                { english: "motorcycle", chinese: "n. [C] 重型機車, 摩托車", example: "" },
                { english: "newcomer", chinese: "n. [C] 新進人員, 新來的人", example: "" },
                { english: "pessimistic", chinese: "adj. 悲觀的", example: "" },
                { english: "pessimist", chinese: "n. [C] 悲觀主義者", example: "" },
                { english: "pessimism", chinese: "n. [U] 悲觀主義", example: "" },
                { english: "plain", chinese: "adj. 明白的, 明顯的, 平實的, n. [C] 平原", example: "" },
                { english: "provide", chinese: "vt. 提供", example: "" },
                { english: "readily", chinese: "adj. 容易地, 願意地", example: "" },
                { english: "real", chinese: "adj. 真實的, 真的", example: "" },
                { english: "reality", chinese: "n. [U] 真實情況, n. [C] 真實事件", example: "" },
                { english: "realize", chinese: "vt. 了解, 實現, vi. 了解", example: "" },
                { english: "realization", chinese: "n. [S] [U] 理解, 實現", example: "" },
                { english: "rooster", chinese: "n. [C] 公雞", example: "" },
                { english: "serve", chinese: "vt. vi. 上(菜), 供應(食物或飲料), 任職(於...), (為...)服務", example: "" },
                { english: "service", chinese: "n. [U] [C] 服務", example: "" },
                { english: "soon", chinese: "adv. 很快地", example: "" },
                { english: "support", chinese: "vt. 支持, 支撐, 供養", example: "" },
                { english: "supporter", chinese: "n. [C] 支持者, 擁護者, 支撐物, n. [U] 支持, n. [C][U] 支撐(物)", example: "" },
                { english: "vertical", chinese: "adj. 垂直的, 豎直的", example: "" },
                { english: "wet", chinese: "adj. 濕的", example: "" },
            ]
        },
        {
            id: 8,
            title: "📚 高頻 Unit 8",
            default: true,
            words: [
                { english: "absent", chinese: "adj. 缺席的, 不在場的", example: "" },
                { english: "absence", chinese: "n. [C] [U] 缺席 (期間)", example: "" },
                { english: "aid", chinese: "n. [U] 幫助, 支援, 資助, n. [C] 輔助工具", example: "" },
                { english: "aide", chinese: "n. 幕僚", example: "" },
                { english: "assist", chinese: "vt. vi. 幫助, 協助", example: "" },
                { english: "assistant", chinese: "n. [C] 助理", example: "" },
                { english: "assistance", chinese: "n. [U] 幫助", example: "" },
                { english: "break", chinese: "vt. vi. (使) 破碎, vt. 違反, n. [C] 休息", example: "break-broke-broken" },
                { english: "brush", chinese: "n. [C] 刷子, 梳子 vt. 刷洗, (用手或刷子) 拂去", example: "" },
                { english: "cash", chinese: "n. [U] 現金", example: "" },
                { english: "compose", chinese: "vt. 創作, 組成, vi. 創作", example: "" },
                { english: "composer", chinese: "n. [C] 作曲家", example: "" },
                { english: "composition", chinese: "n. [U] 組裝 n. [C] 創作作品", example: "" },
                { english: "curious", chinese: "adj. 好奇的", example: "" },
                { english: "curiousity", chinese: "n. [S] [U] 好奇心", example: "" },
                { english: "deep", chinese: "adj. 深的", example: "" },
                { english: "deepen", chinese: "vt. vi. (使)變深", example: "" },
                { english: "depth", chinese: "n. [U][C] 深度 [P] 海底深淵", example: "" },
                { english: "delete", chinese: "vt. 刪除", example: "" },
                { english: "desire", chinese: "n. [C][U] 欲望, 渴望, vt. 渴望", example: "" },
                { english: "effortless", chinese: "adj. 不費力的, 輕鬆的", example: "" },
                { english: "effort", chinese: "n. [C][U] 努力, 精力", example: "" },
                { english: "enormous", chinese: "adj. 巨大的", example: "" },
                { english: "express", chinese: "vt. 表逹", example: "" },
                { english: "expression", chinese: "n. [C][U] 表逹, [C] 表情", example: "" },
                { english: "expressive", chinese: "adj. 表情生動的", example: "" },
                { english: "fulfill", chinese: "vt. 滿足, 逹成", example: "" },
                { english: "global", chinese: "adj. 全球的", example: "" },
                { english: "idea", chinese: "n. [C] 想法, 靈感", example: "" },
                { english: "ideal", chinese: "adj. 理想的, n. [C] 理想", example: "" },
                { english: "joy", chinese: "n. [C][U] (令人)快樂(之事)", example: "" },
                { english: "joyful", chinese: "adj. 高興的, 令人開心的", example: "" },
                { english: "mill", chinese: "n. [C] 磨坊, 磨具, 工廠", example: "" },
                { english: "moisture", chinese: "n. [U] 濕氣, 水氣", example: "" },
                { english: "noise", chinese: "n. [U] 噪音, [C] 聲音", example: "" },
                { english: "noisy", chinese: "adj. 吵鬧的", example: "" },
                { english: "nutrition", chinese: "n. [U] 營養, 營養學", example: "" },
                { english: "nutritious", chinese: "adj. 有營養的", example: "" },
                { english: "obtain", chinese: "vt. 獲得", example: "" },
                { english: "obvious", chinese: "adj. 明顯的", example: "" },
                { english: "obviously", chinese: "adv. 顯然地", example: "" },
                { english: "offend", chinese: "vt. 冒犯", example: "" },
                { english: "offensive", chinese: "adj. 冒犯人的, 令人不快的", example: "" },
                { english: "offense", chinese: "n. [C][U] 冒犯", example: "" },
                { english: "pollute", chinese: "vt. 汙染", example: "" },
                { english: "pollution", chinese: "n. [U] 汙染", example: "" },
                { english: "proof", chinese: "n. [C][U] 證明, 證據", example: "" },
                { english: "prove", chinese: "vt. 證實", example: "" },
                { english: "rebel", chinese: "n. [C] 反判者, vi. 反判", example: "" },
                { english: "rebellion", chinese: "n. [C][U] 反判, 判逆", example: "" },
                { english: "relieve", chinese: "vt. 緩解, 使放心", example: "" },
                { english: "relieved", chinese: "adj. 放心的", example: "" },
                { english: "relief", chinese: "n. [S][U] 放鬆, 放心", example: "" },
                { english: "reserve", chinese: "n. [C] 儲備(常用複數形), 自然保護區", example: "" },
                { english: "reservation", chinese: "n. [C] 預約, 自然保護區, [C][U] 存疑(常用複數形)", example: "" },
                { english: "scan", chinese: "vt. vi. 掃描, 迅速瀏覽, 細看, 審視", example: "" },
                { english: "scanner", chinese: "n. [C] 掃描機", example: "" },
                { english: "voice", chinese: "n. [C][U] 說話聲, 嗓音", example: "" },
                { english: "wonderful", chinese: "adj. 非常棒的", example: "" },
                { english: "wonder", chinese: "vt. vi. 納悶, 想知道, n [C][U] 驚奇", example: "" },
            ]
        }
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

// Function to get words from multiple units
function getWordsFromUnits(unitIds) {
    let words = [];
    unitIds.forEach(unitId => {
        words = words.concat(getWordsFromUnit(unitId));
    });
    return words;
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
    const allWords = getAllWords();
    return allWords.filter(word => 
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