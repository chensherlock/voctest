// DOM elements
const unitFilter = document.getElementById('unitFilter');
const searchFilter = document.getElementById('searchFilter');
const sortBy = document.getElementById('sortBy');
const totalUnitsElement = document.getElementById('totalUnits');
const totalWordsElement = document.getElementById('totalWords');
const filteredWordsElement = document.getElementById('filteredWords');
const masteredWordsElement = document.getElementById('masteredWords');
const vocabTableBody = document.getElementById('vocabTableBody');
const toggleEditMode = document.getElementById('toggleEditMode');
const addNewWord = document.getElementById('addNewWord');
const saveChanges = document.getElementById('saveChanges');
const cancelChanges = document.getElementById('cancelChanges');
const pagination = document.getElementById('pagination');
const exportData = document.getElementById('exportData');
const importData = document.getElementById('importData');
const exportDataField = document.getElementById('exportDataField');

// State variables
let currentFilter = {
    unit: 'all',
    search: '',
    sort: 'unit'
};
let isEditMode = false;
let originalData = null;
let currentPage = 1;
const itemsPerPage = 10;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Populate unit filter dropdown
    populateUnitSelect();
    
    // Initialize table data
    updateDataDisplay();
    
    // Set up event listeners
    unitFilter.addEventListener('change', handleFilterChange);
    searchFilter.addEventListener('input', handleFilterChange);
    sortBy.addEventListener('change', handleSortChange);
    
    toggleEditMode.addEventListener('click', handleToggleEditMode);
    addNewWord.addEventListener('click', handleAddNewWord);
    saveChanges.addEventListener('click', handleSaveChanges);
    cancelChanges.addEventListener('click', handleCancelChanges);
    
    exportData.addEventListener('click', handleExportData);
    importData.addEventListener('click', handleImportData);
});

// Populate the unit filter dropdown
function populateUnitSelect() {
    const units = getAllUnits();
    
    units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.id;
        option.textContent = unit.title;
        unitFilter.appendChild(option);
    });
}

// Update the displayed data based on current filters
function updateDataDisplay() {
    // Update statistics
    updateStats();
    
    // Get filtered and sorted data
    const filteredData = getFilteredData();
    
    // Update pagination
    updatePagination(filteredData.length);
    
    // Display the table data for current page
    displayTableData(filteredData);
}

// Update statistics panel
function updateStats() {
    const units = getAllUnits();
    const allWords = getAllWords();
    const filteredWords = getFilteredData();
    const masteredWords = userProgress.getMasteredWords().length;
    
    totalUnitsElement.textContent = units.length.toString();
    totalWordsElement.textContent = allWords.length.toString();
    filteredWordsElement.textContent = filteredWords.length.toString();
    masteredWordsElement.textContent = masteredWords.toString();
}

// Get filtered and sorted data
function getFilteredData() {
    let filteredWords = [];
    
    // Start with all words, adding unit info
    if (currentFilter.unit === 'all') {
        // Get all words with their unit info
        filteredWords = getAllUnits().flatMap(unit => {
            return unit.words.map(word => ({
                ...word,
                unitId: unit.id,
                unitTitle: unit.title
            }));
        });
    } else {
        // Get words from specific unit
        const unitId = parseInt(currentFilter.unit);
        const unit = getUnitById(unitId);
        
        if (unit) {
            filteredWords = unit.words.map(word => ({
                ...word,
                unitId: unit.id,
                unitTitle: unit.title
            }));
        }
    }
    
    // Apply search filter
    if (currentFilter.search) {
        const searchTerm = currentFilter.search.toLowerCase();
        filteredWords = filteredWords.filter(word => 
            word.english.toLowerCase().includes(searchTerm) || 
            word.chinese.includes(searchTerm)
        );
    }
    
    // Apply sorting
    switch(currentFilter.sort) {
        case 'english-asc':
            filteredWords.sort((a, b) => a.english.localeCompare(b.english));
            break;
        case 'english-desc':
            filteredWords.sort((a, b) => b.english.localeCompare(a.english));
            break;
        case 'unit':
        default:
            // Sort by unit ID first, then by word position
            filteredWords.sort((a, b) => {
                if (a.unitId !== b.unitId) {
                    return a.unitId - b.unitId;
                }
                return a.english.localeCompare(b.english);
            });
    }
    
    return filteredWords;
}

// Display table data
function displayTableData(filteredWords) {
    // Clear table
    vocabTableBody.innerHTML = '';
    
    // Calculate slice for current page
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageWords = filteredWords.slice(startIdx, endIdx);
    
    if (pageWords.length === 0) {
        // Show no results message
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `
            <td colspan="6">No vocabulary words found matching your filters.</td>
        `;
        vocabTableBody.appendChild(noDataRow);
        return;
    }
    
    // Create rows for each word
    pageWords.forEach(word => {
        const row = document.createElement('tr');
        row.setAttribute('data-word-id', `${word.unitId}-${word.english}`);
        
        if (isEditMode) {
            // Edit mode row
            row.innerHTML = `
                <td>${word.unitTitle}</td>
                <td><input type="text" class="word-english" value="${word.english}"></td>
                <td><input type="text" class="word-chinese" value="${word.chinese}"></td>
                <td><input type="text" class="word-example" value="${word.example || ''}"></td>
                <td><input type="text" class="word-audio" value="${word.audioUrl || ''}"></td>
                <td>
                    <button class="btn-small delete-word"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            // Add event listener for delete button
            row.querySelector('.delete-word').addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete the word "${word.english}"?`)) {
                    row.remove();
                }
            });
        } else {
            // View mode row
            const wordProgress = userProgress.getWordProgress(`${word.unitId}-${word.english}`);
            const masteredClass = wordProgress.mastered ? 'mastered' : '';
            
            row.className = masteredClass;
            row.innerHTML = `
                <td>${word.unitTitle}</td>
                <td>${word.english}</td>
                <td>${word.chinese}</td>
                <td>${word.example || ''}</td>
                <td>${word.audioUrl ? 
                    `<button class="audio-btn"><i class="fas fa-volume-up"></i></button>` : 
                    ''}
                </td>
                <td>
                    <button class="btn-small view-word"><i class="fas fa-eye"></i></button>
                </td>
            `;
            
            // Add event listener for audio button
            const audioBtn = row.querySelector('.audio-btn');
            if (audioBtn) {
                audioBtn.addEventListener('click', () => {
                    playAudio(word.audioUrl);
                });
            }
            
            // Add event listener for view button
            row.querySelector('.view-word').addEventListener('click', () => {
                showWordDetails(word);
            });
        }
        
        vocabTableBody.appendChild(row);
    });
    
    // Update table class based on mode
    document.getElementById('vocabTable').classList.toggle('edit-mode', isEditMode);
}

// Update pagination controls
function updatePagination(totalItems) {
    // Calculate total pages
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Clear pagination
    pagination.innerHTML = '';
    
    // No need for pagination if only one page
    if (totalPages <= 1) {
        return;
    }
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateDataDisplay();
        }
    });
    pagination.appendChild(prevBtn);
    
    // Page buttons (limited to 5 visible pages)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if end page is maxed out
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
    
    // First page button if needed
    if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.className = 'page-btn';
        firstPageBtn.textContent = '1';
        firstPageBtn.addEventListener('click', () => {
            currentPage = 1;
            updateDataDisplay();
        });
        pagination.appendChild(firstPageBtn);
        
        // Ellipsis if needed
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
    }
    
    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i.toString();
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            updateDataDisplay();
        });
        pagination.appendChild(pageBtn);
    }
    
    // Last page button if needed
    if (endPage < totalPages) {
        // Ellipsis if needed
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
        
        const lastPageBtn = document.createElement('button');
        lastPageBtn.className = 'page-btn';
        lastPageBtn.textContent = totalPages.toString();
        lastPageBtn.addEventListener('click', () => {
            currentPage = totalPages;
            updateDataDisplay();
        });
        pagination.appendChild(lastPageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateDataDisplay();
        }
    });
    pagination.appendChild(nextBtn);
}

// Handle filter change
function handleFilterChange() {
    currentFilter.unit = unitFilter.value;
    currentFilter.search = searchFilter.value.trim();
    currentPage = 1; // Reset to first page on filter change
    updateDataDisplay();
}

// Handle sort change
function handleSortChange() {
    currentFilter.sort = sortBy.value;
    updateDataDisplay();
}

// Toggle edit mode
function handleToggleEditMode() {
    if (!isEditMode) {
        // Entering edit mode
        isEditMode = true;
        originalData = JSON.parse(JSON.stringify(vocabularyData)); // Deep clone
        toggleEditMode.style.display = 'none';
        addNewWord.style.display = 'none';
        saveChanges.style.display = 'inline-block';
        cancelChanges.style.display = 'inline-block';
    } else {
        // Exiting edit mode (should not happen through this button)
        isEditMode = false;
        toggleEditMode.style.display = 'inline-block';
        addNewWord.style.display = 'inline-block';
        saveChanges.style.display = 'none';
        cancelChanges.style.display = 'none';
    }
    
    updateDataDisplay();
}

// Add new word
function handleAddNewWord() {
    // TODO: Implement add new word functionality
    alert('Add new word functionality will be implemented in a future update.');
}

// Save changes
function handleSaveChanges() {
    // TODO: Implement save changes functionality
    isEditMode = false;
    toggleEditMode.style.display = 'inline-block';
    addNewWord.style.display = 'inline-block';
    saveChanges.style.display = 'none';
    cancelChanges.style.display = 'none';
    
    updateDataDisplay();
    alert('Changes saved successfully! (Note: This is a placeholder. In a production environment, this would actually save the changes to a database or file.)');
}

// Cancel changes
function handleCancelChanges() {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
        // Restore original data
        vocabularyData = originalData;
        originalData = null;
        
        // Exit edit mode
        isEditMode = false;
        toggleEditMode.style.display = 'inline-block';
        addNewWord.style.display = 'inline-block';
        saveChanges.style.display = 'none';
        cancelChanges.style.display = 'none';
        
        updateDataDisplay();
    }
}

// Export data
function handleExportData() {
    try {
        const dataStr = JSON.stringify(vocabularyData, null, 2);
        exportDataField.value = dataStr;
        
        // Create downloadable file
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'vocabulary_data.json';
        downloadLink.textContent = 'Download JSON';
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        alert('Data exported successfully!');
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data. Check the console for details.');
    }
}

// Import data
function handleImportData() {
    try {
        const jsonData = exportDataField.value.trim();
        
        if (!jsonData) {
            alert('Please enter JSON data to import.');
            return;
        }
        
        const data = JSON.parse(jsonData);
        
        // Basic validation
        if (!data.units || !Array.isArray(data.units)) {
            alert('Invalid data format. The JSON must contain a "units" array.');
            return;
        }
        
        // Confirm import
        if (confirm('Are you sure you want to import this data? This will replace all existing vocabulary data.')) {
            // Backup current data
            const backupData = JSON.parse(JSON.stringify(vocabularyData));
            
            try {
                // Update vocabulary data
                vocabularyData = data;
                
                // Refresh the UI
                populateUnitSelect();
                updateDataDisplay();
                
                alert('Data imported successfully!');
            } catch (error) {
                // Restore from backup on error
                vocabularyData = backupData;
                console.error('Error updating data:', error);
                alert('Error updating data. The original data has been restored.');
            }
        }
    } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please ensure the JSON format is valid.');
    }
}

// Show word details
function showWordDetails(word) {
    alert(`
Word: ${word.english}
Translation: ${word.chinese}
Example: ${word.example || 'No example provided'}
Audio: ${word.audioUrl || 'No audio available'}
Unit: ${word.unitTitle}
    `);
}

// Play audio for a word
function playAudio(audioUrl) {
    if (!audioUrl) return;
    
    const audio = new Audio(audioUrl);
    
    audio.onerror = () => {
        console.log('Audio file not found:', audioUrl);
        alert('Audio file not found. Please check that the audio file exists.');
    };
    
    audio.play();
}