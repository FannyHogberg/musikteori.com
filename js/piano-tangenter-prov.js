class PianoKeysTest {
    constructor() {
        this.totalQuestions = 30;
        this.requiredCorrect = 20;
        this.notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

        this.questionCount = 0;
        this.answers = []; // Store all answers
        this.currentNote = null;
        this.isDisabled = false;

        this.init();
    }

    init() {
        this.generatePiano();
        this.attachEventListeners();
        this.askQuestion();

        // Back to hub button
        const backBtn = document.getElementById('back-to-hub-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (confirm(T('test.confirmAbort'))) {
                    window.location.href = localUrl('piano-hub.html');
                }
            });
        }

        // Regenerate piano on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.generatePiano();
            }, 150);
        });
    }

    generatePiano() {
        const pianoKeys = document.getElementById('piano-keys');
        pianoKeys.innerHTML = '';

        // Generate white keys
        const whiteKeys = [];
        this.notes.forEach((note) => {
            const key = document.createElement('div');
            key.className = 'white-key';
            key.dataset.note = note;

            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = note;
            key.appendChild(label);

            key.addEventListener('click', () => this.handleKeyPress(note));
            pianoKeys.appendChild(key);
            whiteKeys.push(key);
        });

        // Add black keys
        requestAnimationFrame(() => {
            const whiteKeyWidth = whiteKeys[0].offsetWidth;
            const gap = 2;

            this.notes.forEach((note, index) => {
                if (['C', 'D', 'F', 'G', 'A'].includes(note)) {
                    const blackKey = document.createElement('div');
                    blackKey.className = 'black-key';
                    const blackNote = note + '#';
                    blackKey.dataset.note = blackNote;

                    const blackLabel = document.createElement('span');
                    blackLabel.className = 'key-label';
                    blackLabel.textContent = blackNote;
                    blackKey.appendChild(blackLabel);

                    const leftPosition = (index * (whiteKeyWidth + gap)) + (whiteKeyWidth * 0.74);
                    blackKey.style.left = `${leftPosition}px`;

                    blackKey.addEventListener('click', () => this.handleKeyPress(blackNote));
                    pianoKeys.appendChild(blackKey);
                }
            });
        });

        // Hide labels (test mode)
        pianoKeys.classList.add('hide-labels');
    }

    askQuestion() {
        this.questionCount++;

        const randomIndex = Math.floor(Math.random() * this.notes.length);
        this.currentNote = this.notes[randomIndex];

        document.getElementById('note-to-find').textContent = this.currentNote;
        const counter = document.getElementById('question-counter');
        counter.classList.remove('updated');
        document.getElementById('current-question').textContent = this.questionCount;
        void counter.offsetWidth; // Force reflow
        counter.classList.add('updated');
        setTimeout(() => counter.classList.remove('updated'), 400);
    }

    handleKeyPress(note) {
        if (this.isDisabled) return;

        const isCorrect = note === this.currentNote;

        // Save answer (no feedback)
        this.answers.push({
            question: this.currentNote,
            userAnswer: note,
            correct: isCorrect
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
                <h2>${T('test.completed')}</h2>

                <div class="score-display ${passed ? 'passed' : 'failed'}">
                    <div class="score-number">${correctCount}/${this.totalQuestions}</div>
                    <div class="score-percentage">${percentage}%</div>
                </div>

                <div class="result-message">
                    ${passed
                        ? T('test.passed')
                        : T('test.failed', {required: this.requiredCorrect, total: this.totalQuestions})
                    }
                </div>

                <div class="quiz-actions" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
                    ${passed
                        ? `<button class="btn btn-primary" id="continue-btn">${T('test.startSection1')}</button>`
                        : ''
                    }
                    <button class="btn ${passed ? '' : 'btn-primary'}" id="retry-btn">${T('test.retakeBtn')}</button>
                    <button class="btn" id="back-btn">${T('test.changeBtn')}</button>
                </div>
            </div>
        `;

        // Add event listeners
        if (passed) {
            document.getElementById('continue-btn').addEventListener('click', () => {
                // Go to Del 1: Stamtoner, Nivå 1
                window.location.href = localUrl('piano-tangenter-ova.html?level=1');
            });
        }

        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = localUrl('piano-hub.html');
        });

        document.getElementById('retry-btn').addEventListener('click', () => {
            window.location.reload();
        });
    }

    attachEventListeners() {
        // No restart button during test in quiz mode
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PianoKeysTest();
});
