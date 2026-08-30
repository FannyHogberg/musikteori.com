class PianoStamtonerTest {
    constructor() {
        this.totalQuestions = 30;
        this.requiredCorrect = 20;
        this.notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

        this.questionCount = 0;
        this.answers = []; // Store all answers
        this.currentNote = null;
        this.currentQuestionType = null;
        this.isDisabled = false;

        // Two octaves for context
        this.pianoOctaves = [
            { id: 'ettstrukna', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
            { id: 'tvastrukna', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }
        ];

        this.init();
    }

    init() {
        this.generatePiano(() => {
            // Ask first question only AFTER piano is fully generated
            this.askQuestion();
        });

        // Regenerate piano on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.generatePiano();
            }, 150);
        });

        // Back to hub button
        const backBtn = document.getElementById('back-to-hub-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (confirm('Är du säker på att du vill avbryta provet?')) {
                    window.location.href = 'piano-hub.html';
                }
            });
        }
    }

    generatePiano(callback) {
        const pianoKeys = document.getElementById('piano-keys');
        pianoKeys.innerHTML = '';

        // Generate white keys for BOTH octaves
        const whiteKeys = [];
        let globalIndex = 0;

        this.pianoOctaves.forEach(octave => {
            octave.notes.forEach((note) => {
                const key = document.createElement('div');
                key.className = 'white-key';

                key.dataset.note = note;
                key.dataset.octave = octave.id;

                const label = document.createElement('span');
                label.className = 'key-label';
                label.textContent = note;
                key.appendChild(label);

                key.addEventListener('click', () => this.handleKeyPress(note));
                pianoKeys.appendChild(key);
                whiteKeys.push({ element: key, note: note, octaveId: octave.id, globalIndex: globalIndex });
                globalIndex++;
            });
        });

        // Generate black keys
        requestAnimationFrame(() => {
            const whiteKeyWidth = whiteKeys[0].element.offsetWidth;
            const gap = 2;

            whiteKeys.forEach((keyData) => {
                if (['C', 'D', 'F', 'G', 'A'].includes(keyData.note)) {
                    const blackKey = document.createElement('div');
                    blackKey.className = 'black-key';

                    const sharpNote = keyData.note + '#';
                    blackKey.dataset.note = sharpNote;
                    blackKey.dataset.octave = keyData.octaveId;

                    const blackLabel = document.createElement('span');
                    blackLabel.className = 'key-label';
                    blackLabel.textContent = sharpNote;
                    blackKey.appendChild(blackLabel);

                    const leftPosition = (keyData.globalIndex * (whiteKeyWidth + gap)) + (whiteKeyWidth * 0.74);
                    blackKey.style.left = `${leftPosition}px`;

                    blackKey.addEventListener('click', () => this.handleKeyPress(sharpNote));
                    pianoKeys.appendChild(blackKey);
                }
            });

            // Piano is fully generated, call callback if provided
            if (callback) callback();
        });

        // Hide all labels (test mode) and hide black key labels
        pianoKeys.classList.add('hide-labels', 'hide-black-labels');
    }

    askQuestion() {
        this.questionCount++;

        const randomIndex = Math.floor(Math.random() * this.notes.length);
        this.currentNote = this.notes[randomIndex];

        // Randomly choose question type (50/50)
        this.currentQuestionType = Math.random() < 0.5 ? 'findKey' : 'nameKey';

        const counter = document.getElementById('question-counter');
        counter.classList.remove('updated');
        document.getElementById('current-question').textContent = this.questionCount;
        void counter.offsetWidth; // Force reflow
        counter.classList.add('updated');
        setTimeout(() => counter.classList.remove('updated'), 400);

        if (this.currentQuestionType === 'findKey') {
            this.askFindKeyQuestion();
        } else {
            this.askNameKeyQuestion();
        }
    }

    askFindKeyQuestion() {
        document.getElementById('question').textContent = `Var är ${this.currentNote}?`;

        const noteButtons = document.getElementById('note-buttons');
        noteButtons.innerHTML = '';
        noteButtons.style.visibility = 'hidden';

        const pianoKeys = document.getElementById('piano-keys');
        pianoKeys.classList.remove('no-interaction');
    }

    askNameKeyQuestion() {
        document.getElementById('question').textContent = 'Vilken ton är markerad på pianot?';

        // Find and highlight ONE random key
        const allKeys = document.querySelectorAll('.white-key, .black-key');
        let possibleKeys = [];

        allKeys.forEach(key => {
            if (key.getAttribute('data-note') === this.currentNote) {
                possibleKeys.push(key);
            }
        });

        if (possibleKeys.length > 0) {
            const randomKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
            randomKey.classList.add('highlighted');
        }

        // Show note buttons
        this.generateNoteButtons();

        // Disable piano interaction
        const pianoKeys = document.getElementById('piano-keys');
        pianoKeys.classList.add('no-interaction');
    }

    generateNoteButtons() {
        const buttonsContainer = document.getElementById('note-buttons');
        buttonsContainer.innerHTML = '';

        // Shuffle the buttons so they don't match piano layout
        const shuffledNotes = [...this.notes].sort(() => Math.random() - 0.5);

        shuffledNotes.forEach(note => {
            const button = document.createElement('button');
            button.className = 'note-button';
            button.dataset.note = note;
            button.textContent = note;
            button.addEventListener('click', () => this.handleNoteButtonClick(note));
            buttonsContainer.appendChild(button);
        });

        // Set display and visibility AFTER adding buttons
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.visibility = 'visible';
    }

    handleNoteButtonClick(clickedNote) {
        if (this.isDisabled) return;

        const isCorrect = clickedNote === this.currentNote;

        // Save answer
        this.answers.push({
            question: this.currentNote,
            userAnswer: clickedNote,
            correct: isCorrect,
            questionType: 'nameKey'
        });

        // Remove highlight
        const highlighted = document.querySelectorAll('.highlighted');
        highlighted.forEach(key => key.classList.remove('highlighted'));

        // Remove no-interaction
        const pianoKeys = document.getElementById('piano-keys');
        pianoKeys.classList.remove('no-interaction');

        // Check if test is complete
        if (this.questionCount >= this.totalQuestions) {
            this.completeTest();
        } else {
            this.askQuestion();
        }
    }

    handleKeyPress(note) {
        if (this.isDisabled) return;
        if (this.currentQuestionType === 'nameKey') return; // Ignore piano clicks in nameKey mode

        const isCorrect = note === this.currentNote;

        // Save answer (no feedback)
        this.answers.push({
            question: this.currentNote,
            userAnswer: note,
            correct: isCorrect,
            questionType: 'findKey'
        });

        // Check if test is complete
        if (this.questionCount >= this.totalQuestions) {
            this.completeTest();
        } else {
            // Go to next question immediately (no feedback)
            this.askQuestion();
        }
    }

    completeTest() {
        // Hide piano, note buttons, question counter, and back button
        document.querySelector('.piano').style.display = 'none';
        document.getElementById('note-buttons').style.visibility = 'hidden';

        // Hide question counter
        const questionCounter = document.getElementById('question-counter');
        if (questionCounter) {
            questionCounter.style.display = 'none';
        }

        // Hide the back button at the bottom
        const backButton = document.getElementById('back-to-hub-btn');
        if (backButton && backButton.parentElement) {
            backButton.parentElement.style.display = 'none';
        }

        // Calculate results
        const correctCount = this.answers.filter(a => a.correct).length;
        const percentage = Math.round((correctCount / this.totalQuestions) * 100);
        const passed = correctCount >= this.requiredCorrect;

        // Show results
        const question = document.getElementById('question');
        question.innerHTML = `
            <div class="quiz-results">
                <h2>Provet slutfört!</h2>

                <div class="score-display ${passed ? 'passed' : 'failed'}">
                    <div class="score-number">${correctCount}/${this.totalQuestions}</div>
                    <div class="score-percentage">${percentage}%</div>
                </div>

                <div class="result-message">
                    ${passed
                        ? '🎉 Grattis! Du är godkänd!'
                        : `Tyvärr blev du inte godkänd. Du behöver minst ${this.requiredCorrect} rätt av ${this.totalQuestions}.`
                    }
                </div>

                <div class="quiz-actions" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
                    ${passed
                        ? '<button class="btn btn-primary" id="continue-btn">Fortsätt till Del 2: Korsförtecken →</button>'
                        : ''
                    }
                    <button class="btn ${passed ? '' : 'btn-primary'}" id="retry-btn">Gör om provet</button>
                    <button class="btn" id="back-btn">Byt övning</button>
                </div>
            </div>
        `;

        // Add event listeners
        if (passed) {
            document.getElementById('continue-btn').addEventListener('click', () => {
                // Go to Del 2: Korsförtecken, Nivå 1
                window.location.href = 'piano-tangenter-ova.html?level=6';
            });
        }

        document.getElementById('retry-btn').addEventListener('click', () => {
            window.location.reload();
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = 'piano-hub.html';
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PianoStamtonerTest();
});
