class NotlasningOvning {
    constructor(containerElement) {
        this.container = containerElement;
        this.difficulty = containerElement.dataset.difficulty || 'basic'; // basic, intermediate, advanced
        this.currentNote = null;
        this.score = 0;
        this.attempts = 0;
        this.streak = 0;

        // Define note sets based on difficulty
        this.noteSets = {
            basic: [
                { name: 'C', image: '/images/noter/c-not.svg', display: 'C' },
                { name: 'D', image: '/images/noter/d-not.svg', display: 'D' },
                { name: 'E', image: '/images/noter/e-not.svg', display: 'E' },
                { name: 'F', image: '/images/noter/f-not.svg', display: 'F' },
                { name: 'G', image: '/images/noter/g-not.svg', display: 'G' },
                { name: 'A', image: '/images/noter/a-not.svg', display: 'A' },
                { name: 'B', image: '/images/noter/b-not.svg', display: 'B' }
            ]
        };

        this.init();
    }

    init() {
        this.render();
        this.showNewNote();
    }

    render() {
        this.container.innerHTML = `
            <div class="notlasning-container">
                <div class="notlasning-header">
                    <h2>Notläsning</h2>
                    <div class="notlasning-stats">
                        <div class="stat">
                            <span class="stat-label">Rätt:</span>
                            <span class="stat-value score-display">${this.score}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Försök:</span>
                            <span class="stat-value attempts-display">${this.attempts}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Rad:</span>
                            <span class="stat-value streak-display">${this.streak}</span>
                        </div>
                    </div>
                </div>

                <div class="notlasning-body">
                    <div class="note-display">
                        <img src="" alt="Not att läsa" class="note-image">
                    </div>

                    <div class="note-options">
                        <!-- Options will be generated here -->
                    </div>

                    <div class="feedback-message"></div>
                </div>

                <div class="notlasning-actions">
                    <button class="btn btn-primary" onclick="location.reload()">Börja om</button>
                </div>
            </div>
        `;
    }

    showNewNote() {
        const notes = this.noteSets[this.difficulty];
        this.currentNote = notes[Math.floor(Math.random() * notes.length)];

        // Update note image
        const noteImage = this.container.querySelector('.note-image');
        noteImage.src = this.currentNote.image;

        // Generate options (correct answer + random wrong answers)
        const options = this.generateOptions(this.currentNote);
        this.renderOptions(options);

        // Clear feedback
        this.container.querySelector('.feedback-message').innerHTML = '';
    }

    generateOptions(correctNote) {
        const notes = this.noteSets[this.difficulty];
        const options = [correctNote];

        // Add 3-5 random wrong answers
        while (options.length < Math.min(6, notes.length)) {
            const randomNote = notes[Math.floor(Math.random() * notes.length)];
            if (!options.find(opt => opt.name === randomNote.name)) {
                options.push(randomNote);
            }
        }

        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    }

    renderOptions(options) {
        const optionsContainer = this.container.querySelector('.note-options');
        optionsContainer.innerHTML = options.map(note => `
            <button class="note-option-btn" data-note="${note.name}">
                ${note.display}
            </button>
        `).join('');

        // Attach click handlers
        optionsContainer.querySelectorAll('.note-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.checkAnswer(e.target.dataset.note, e.target));
        });
    }

    checkAnswer(selectedNote, buttonElement) {
        this.attempts++;

        const isCorrect = selectedNote === this.currentNote.name;
        const feedbackEl = this.container.querySelector('.feedback-message');

        // Disable all buttons
        this.container.querySelectorAll('.note-option-btn').forEach(btn => {
            btn.disabled = true;
        });

        if (isCorrect) {
            this.score++;
            this.streak++;
            buttonElement.classList.add('correct');
            feedbackEl.innerHTML = '<span class="feedback-correct">✓ Rätt!</span>';
            feedbackEl.className = 'feedback-message correct';

            // Show next note after a short delay
            setTimeout(() => {
                this.showNewNote();
            }, 1000);
        } else {
            this.streak = 0;
            buttonElement.classList.add('incorrect');

            // Highlight correct answer
            this.container.querySelectorAll('.note-option-btn').forEach(btn => {
                if (btn.dataset.note === this.currentNote.name) {
                    btn.classList.add('correct');
                }
            });

            feedbackEl.innerHTML = `<span class="feedback-incorrect">✗ Fel! Rätt svar är ${this.currentNote.display}</span>`;
            feedbackEl.className = 'feedback-message incorrect';

            // Show next note after a longer delay
            setTimeout(() => {
                this.showNewNote();
            }, 2000);
        }

        // Update stats
        this.updateStats();
    }

    updateStats() {
        this.container.querySelector('.score-display').textContent = this.score;
        this.container.querySelector('.attempts-display').textContent = this.attempts;
        this.container.querySelector('.streak-display').textContent = this.streak;
    }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('[data-exercise="notlasning"]');
    containers.forEach(container => {
        new NotlasningOvning(container);
    });
});
