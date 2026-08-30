# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Musikteori.com is a Swedish music theory educational website. This is a static HTML/CSS/JavaScript site (no WordPress, no build step) designed to be hosted for free on platforms like Netlify or GitHub Pages.

**Language**: All content is in Swedish. Maintain Swedish language in:
- HTML content
- Comments in HTML
- UI text and messages
- Quiz questions and feedback

## Development Commands

Start local development server:
```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

There is no build step, linting, or test commands. This is a static site that runs directly in the browser.

## Architecture

### Directory Structure

```
/
├── css/style.css           # All styles (green theme #2ecc71)
├── js/
│   ├── main.js            # Mobile menu toggle
│   ├── quiz.js            # Quiz class (auto-initializes)
│   ├── notlasning.js      # Note reading exercise
│   ├── piano-tangenter-ova.js  # Piano key exercises
│   └── piano-oktav.js     # Note reading on piano exercises
├── data/quiz/             # JSON quiz data files
├── kurser/                # Course pages
│   └── grundlaggande-musikteori/
├── quiz/                  # Quiz pages
├── ovningar/              # Exercise pages
└── images/                # SVG/PNG assets organized by topic

```

### Component Pattern

The site uses **class-based JavaScript components** that auto-initialize via data attributes:

**Quiz System** (`js/quiz.js`):
- Auto-initializes on elements with `data-quiz="quiz-name"`
- Loads quiz data from `/data/quiz/{quiz-name}.json`
- Handles relative paths automatically based on page depth
- Supports single-choice and multiple-choice questions
- Optional navigation: `data-next-url` and `data-quiz-list-url`

**Exercise System** (`js/notlasning.js`, `js/piano-tangenter-ova.js`, `js/piano-oktav.js`):
- Each exercise is a standalone class-based component
- Piano exercises use progressive levels with URL parameters (e.g., `?octave=ettstrukna&level=1&clef=g-klav`)
- Separate files for exercises (ova) and tests (prov)

### Quiz Data Format

Quiz JSON files in `/data/quiz/` follow this structure:
```json
{
  "title": "Quiz title",
  "description": "Optional description",
  "passingScore": 60,
  "randomQuestions": 8,
  "questions": [
    {
      "id": 1,
      "type": "single-choice" | "multiple-choice",
      "question": "Question text",
      "image": "/images/path.svg",  // optional
      "options": [
        {
          "text": "Answer text",      // optional
          "image": "/images/path.svg", // optional
          "alt": "Alt text",          // for image options
          "correct": true | false
        }
      ]
    }
  ]
}
```

### Path Handling

The quiz system calculates relative paths dynamically:
- Pages at different depths (e.g., `/quiz/noterna-quiz.html` vs `/kurser/grundlaggande-musikteori/avslutande-prov.html`)
- All reference `/data/quiz/` and `/images/` using calculated relative paths
- CSS/JS use relative paths from the HTML file (e.g., `../css/style.css` from `/quiz/`)

### Design System

- **Primary color**: Green `#2ecc71`
- **Responsive**: Mobile-first design with hamburger menu
- **Typography**: Monospace font via CommonMark rendering
- **Component classes**: `.feature-card`, `.quiz-container`, `.option-label`, `.white-key`, `.black-key`

## Adding New Content

### Adding a New Quiz

1. Create JSON file in `/data/quiz/quiz-name.json` following the format above
2. Create HTML page in `/quiz/quiz-name.html`:
```html
<div class="quiz-container"
     data-quiz="quiz-name"
     data-quiz-list-url="../quiz.html"></div>
<script src="../js/quiz.js"></script>
```

### Adding a New Exercise

1. Create exercise class in `/js/exercise-name.js` following the pattern in `notlasning.js`
2. Auto-initialize via `data-exercise="exercise-name"` attribute
3. Create HTML page in `/ovningar/exercise-name.html` with the exercise container

### Adding Course Content

Course pages live in `/kurser/{course-name}/` and follow a standard structure with:
- Navigation breadcrumbs
- Content sections
- Links to related quizzes
- Standard header/footer/navigation

## Notes for Claude

- **No emojis**: Don't add emojis unless explicitly requested (exception: existing feedback messages in quiz results use 🎉)
- **Swedish language**: All user-facing content must be in Swedish
- **No build tools**: This is intentionally a simple static site - don't suggest webpack, bundlers, or transpilation
- **Image paths**: All image paths are absolute from root (e.g., `/images/noter/helnot.svg`)
- **Auto-initialization**: Classes initialize themselves via `DOMContentLoaded` - no manual instantiation needed
- **Music notation**: Use Swedish music theory terms (e.g., "helnot" not "whole note", "åttondelsnot" not "eighth note")
