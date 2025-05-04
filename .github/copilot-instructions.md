<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Vocabulary Memorization Website - Development Guidelines

## Project Context

This project is a vocabulary memorization website built with HTML, CSS, and JavaScript. It allows users to study vocabulary words from English4U (https://magazine.english4u.net/Voca/video/e68f9f79-af96-4878-a2fc-6813275a3a46).

The application includes:
- Unit organization for vocabulary words
- Interactive flashcards for practice
- Quizzes with multiple formats
- Progress tracking using localStorage

## Code Style Guidelines

- Use proper indentation with 4 spaces
- Use camelCase for JavaScript variables and functions
- Use semantic HTML elements
- Follow BEM methodology for CSS classes where appropriate
- Add comments for complex logic
- Keep functions small and focused on a single responsibility
- Use modern JavaScript (ES6+) features
- Prioritize readability and maintainability

## Variable Naming Convention

- `element` suffix for DOM elements (e.g., `cardElement`)
- `btn` suffix for button elements (e.g., `submitBtn`)
- `List` or `Container` suffix for parent elements (e.g., `wordList`)
- `current` prefix for current state variables (e.g., `currentUnitId`)
- Use plural names for arrays (e.g., `words`, `units`)

## Data Structure

The vocabulary data follows this structure:

```javascript
{
    units: [
        {
            id: 1,
            title: "Unit 1",
            words: [
                {
                    english: "word",
                    chinese: "翻译",
                    example: "Example sentence",
                    audioUrl: "path/to/audio.mp3"
                }
            ]
        }
    ]
}
```

## Adding New Features

When adding new features:
1. Ensure compatibility with the existing data structure
2. Update localStorage handling for any new user data
3. Maintain the responsive design across devices
4. Keep accessibility in mind (add aria attributes, keyboard navigation)
5. Test across different browsers

## Common Tasks

- **Adding vocabulary units**: Add new units to the `vocabularyData` object in `data.js`
- **Modifying UI components**: Update HTML and CSS in the appropriate files
- **Adding new quiz types**: Extend the quiz functionality in `quiz.js`
- **Improving flashcards**: Modify the flashcard behavior in `flashcards.js`