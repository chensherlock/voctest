// Main script for the vocabulary memorization website
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the site
    initializeNavigation();
    setActiveNavLink();
    checkForAudioSupport();
});

// Initialize navigation behavior
function initializeNavigation() {
    // Add mobile navigation toggle if screen width is small
    if (window.innerWidth < 768) {
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');
        
        // Create mobile menu toggle button
        const mobileMenuToggle = document.createElement('button');
        mobileMenuToggle.className = 'mobile-menu-toggle';
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuToggle.setAttribute('aria-label', '切換導航選單');
        
        // Add event listener to toggle mobile menu
        mobileMenuToggle.addEventListener('click', () => {
            nav.classList.toggle('show');
            
            // Toggle icon between bars and times
            const icon = mobileMenuToggle.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Insert toggle button before the nav element
        header.insertBefore(mobileMenuToggle, nav);
    }
}

// Set the active link in the navigation
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Select all nav links
    const navLinks = document.querySelectorAll('nav a');
    
    // Loop through links and add active class to current page link
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Check if audio is supported by the browser
function checkForAudioSupport() {
    const audioTest = document.createElement('audio');
    const canPlayMp3 = !!audioTest.canPlayType && audioTest.canPlayType('audio/mpeg') !== '';
    
    if (!canPlayMp3) {
        // Display a warning if audio is not supported
        const warningElement = document.createElement('div');
        warningElement.className = 'audio-warning';
        warningElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>您的瀏覽器不支援音訊播放功能。某些功能可能無法正常運作。</p>
            <button class="close-warning">關閉</button>
        `;
        
        // Add close functionality
        const closeButton = warningElement.querySelector('.close-warning');
        closeButton.addEventListener('click', () => {
            warningElement.style.display = 'none';
            
            // Remember preference in local storage
            localStorage.setItem('audioWarningDismissed', 'true');
        });
        
        // Check if warning was previously dismissed
        if (localStorage.getItem('audioWarningDismissed') !== 'true') {
            document.body.prepend(warningElement);
        }
    }
}

// Create a search functionality for vocabulary
function initializeSearch() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (searchForm && searchInput && searchResults) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            
            if (query.length > 0) {
                const results = searchWords(query);
                displaySearchResults(results);
            }
        });
    }
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    // Clear previous results
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p>找不到匹配的詞彙。</p>';
        return;
    }
    
    // Create results list
    const resultsList = document.createElement('ul');
    resultsList.className = 'search-results-list';
    
    results.forEach(word => {
        const resultItem = document.createElement('li');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <div class="result-word">
                <span class="english">${word.english}</span>
                <span class="chinese">${word.chinese}</span>
            </div>
            <div class="result-actions">
                <button class="audio-btn"><i class="fas fa-volume-up"></i></button>
                <a href="units.html?unit=${word.unitId}" class="btn-small">查看單元</a>
            </div>
        `;
        
        // Add event listener for audio button
        const audioBtn = resultItem.querySelector('.audio-btn');
        audioBtn.addEventListener('click', () => {
            playAudio(word.audioUrl);
        });
        
        resultsList.appendChild(resultItem);
    });
    
    searchResults.appendChild(resultsList);
}