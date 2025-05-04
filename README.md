# Vocabulary Memorization Website

A web-based application for memorizing vocabulary words from [English4U](https://magazine.english4u.net/Voca/video/e68f9f79-af96-4878-a2fc-6813275a3a46).

## Features

- **Unit Organization**: Browse vocabulary organized by units
- **Interactive Flashcards**: Practice vocabulary with interactive flashcards
- **Quiz System**: Test your knowledge with multiple quiz types
- **Progress Tracking**: Track your mastery of vocabulary words
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
├── index.html         # Homepage
├── units.html         # Units listing and word details
├── flashcards.html    # Flashcard practice
├── quiz.html          # Quiz functionality
├── css/
│   └── styles.css     # Main stylesheet
├── js/
│   ├── script.js      # Main JavaScript
│   ├── data.js        # Vocabulary data
│   ├── units.js       # Units page functionality
│   ├── flashcards.js  # Flashcard functionality
│   └── quiz.js        # Quiz functionality
├── data/              # Data storage
└── images/            # Images and icons
```

## How to Use

1. Open `index.html` in a web browser to start using the application.
2. Browse units on the Units page and click on a unit to view its vocabulary words.
3. Practice with flashcards by clicking on the card to flip between English and Chinese.
4. Test your knowledge with different types of quizzes.

## Vocabulary Data

The vocabulary data is structured with:
- English word
- Chinese translation
- Example sentence
- Audio pronunciation (when available)

## Local Storage

This application uses local storage to:
- Save user progress for each vocabulary word
- Track mastered words
- Remember user preferences

## Browser Compatibility

This website is compatible with modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Future Enhancements

Potential improvements for future versions:
- User accounts and cloud sync
- Spaced repetition algorithm
- More vocabulary sets
- Custom vocabulary lists
- Import/export functionality

## Credits

- Vocabulary content from [English4U](https://magazine.english4u.net/)
- Icons from [Font Awesome](https://fontawesome.com/)