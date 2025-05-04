/**
 * Data Importer
 * 
 * This script helps extract vocabulary data from the English4U website.
 * Use it in the browser console when visiting the vocabulary page.
 */

// Function to scrape vocabulary data from the English4U website
function scrapeVocabularyData() {
    console.log('Starting vocabulary data extraction...');
    
    try {
        // Get the unit title - adjust selector as needed
        const unitTitle = document.querySelector('.unit-title')?.textContent || 'Unknown Unit';
        const unitMatch = unitTitle.match(/Unit (\d+)/i);
        const unitId = unitMatch ? parseInt(unitMatch[1]) : 0;
        
        // Find all vocabulary word elements - adjust selector as needed
        const wordElements = document.querySelectorAll('.word-item');
        
        // Extract data from each word element
        const words = Array.from(wordElements).map(element => {
            const english = element.querySelector('.english')?.textContent.trim() || '';
            const chinese = element.querySelector('.chinese')?.textContent.trim() || '';
            const example = element.querySelector('.example')?.textContent.trim() || '';
            const audioUrl = element.querySelector('audio')?.src || '';
            
            return {
                english,
                chinese,
                example,
                audioUrl: audioUrl ? `audio/${english.toLowerCase()}.mp3` : ''
            };
        }).filter(word => word.english && word.chinese);
        
        // Format the data as JavaScript code
        const jsCode = `{
    id: ${unitId},
    title: "Unit ${unitId}",
    words: [
        ${words.map(word => `{
            english: "${word.english}",
            chinese: "${word.chinese}",
            example: "${word.example.replace(/"/g, '\\"')}",
            audioUrl: "${word.audioUrl}"
        }`).join(',\n        ')}
    ]
}`;
        
        console.log('Extraction complete!');
        console.log('Copy the following code and add it to the vocabularyData.units array:');
        console.log(jsCode);
        
        // Create a downloadable text file
        const blob = new Blob([jsCode], { type: 'text/plain' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `vocabulary_unit_${unitId}.txt`;
        downloadLink.textContent = 'Download Vocabulary Data';
        downloadLink.style.position = 'fixed';
        downloadLink.style.top = '10px';
        downloadLink.style.right = '10px';
        downloadLink.style.zIndex = '9999';
        downloadLink.style.padding = '10px';
        downloadLink.style.backgroundColor = '#3498db';
        downloadLink.style.color = 'white';
        downloadLink.style.textDecoration = 'none';
        downloadLink.style.borderRadius = '4px';
        document.body.appendChild(downloadLink);
        
        return {
            unitId,
            unitTitle,
            words
        };
    } catch (error) {
        console.error('Error extracting vocabulary data:', error);
        return null;
    }
}

// Instructions for downloading audio files
function downloadAudioInstructions() {
    console.log(`
Audio Download Instructions:
---------------------------
1. Locate audio elements on the page
2. Right-click on each audio player and select "Save audio as"
3. Save the file with the same name as the English word (lowercase)
4. Place all audio files in the "audio" directory of your project
5. Ensure the audioUrl paths in your data match the filenames
`);
}

// Usage instructions
console.log(`
Vocabulary Data Importer
=======================
To use this script:

1. Visit the English4U vocabulary page: https://magazine.english4u.net/Voca/video/...
2. Open the browser console (F12 or right-click > Inspect > Console)
3. Copy and paste this entire script
4. Run the following command:
   
   const vocabData = scrapeVocabularyData();
   
5. Copy the generated code and add it to data.js
6. For audio download help, run:
   
   downloadAudioInstructions();
`);