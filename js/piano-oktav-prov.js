class PianoOctaveTest {
    constructor() {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.octave = urlParams.get('octave') || 'ettstrukna';
        this.clef = urlParams.get('clef') || 'g-klav';

        // Octave configuration
        this.octaveConfig = {
            'lilla': {
                name: 'Lilla oktaven',
                notation: 'c - b',
                folder: 'lillaOktaven',
                // Show two octaves for context: lilla + ettstrukna
                pianoOctaves: [
                    { id: 'lilla', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
                    { id: 'ettstrukna', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }
                ],
                questionOctave: 'lilla',
                testNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
            },
            'ettstrukna': {
                name: 'Ettstrukna oktaven',
                notation: "c' - b'",
                folder: 'ettstruknaOktaven',
                pianoOctaves: [
                    { id: 'ettstrukna', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }
                ],
                questionOctave: 'ettstrukna',
                testNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
            },
            'tvastrukna': {
                name: 'Tvåstrukna oktaven',
                notation: "c'' - b''",
                folder: 'tvastruknaOktaven',
                // Show two octaves for context: ettstrukna + tvåstrukna
                pianoOctaves: [
                    { id: 'ettstrukna', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
                    { id: 'tvastrukna', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }
                ],
                questionOctave: 'tvastrukna',
                testNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
            },
            'stora': {
                name: 'Stora oktaven',
                notation: 'C - B',
                folder: 'storaOktaven',
                pianoOctaves: [
                    { id: 'stora', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }
                ],
                questionOctave: 'stora',
                testNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
            },
            'ettstrukna-fg': {
                name: 'Ettstrukna oktaven',
                notation: "c' - g'",
                folder: 'ettstruknaOktaven',
                // Show two octaves for context: lilla + ettstrukna
                pianoOctaves: [
                    { id: 'lilla', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
                    { id: 'ettstrukna', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }
                ],
                questionOctave: 'ettstrukna',
                testNotes: ['C', 'D', 'E', 'F', 'G']
            }
        };

        this.config = this.octaveConfig[this.octave];

        // Adjust testNotes for lilla oktaven based on clef
        if (this.octave === 'lilla' && this.clef === 'g-klav') {
            // G-klav only has G, A, B in lilla oktaven
            this.config.testNotes = ['G', 'A', 'B'];
        }

        // Set total questions and passing score
        // Lilla oktaven G-klav has only 3 notes, so use fewer questions
        if (this.octave === 'lilla' && this.clef === 'g-klav') {
            this.totalQuestions = 20;
            this.passingScore = 14;
        } else {
            this.totalQuestions = 30;
            this.passingScore = 20;
        }
        this.currentQuestionIndex = 0;
        this.answers = []; // Store all answers
        this.currentNote = null;
        this.isDisabled = false;

        this.init();
    }

    getImagePath(note) {
        return `/images/noter/${this.clef}/${this.config.folder}/${note.toLowerCase()}.png`;
    }

    init() {
        // Update page title and header
        document.title = `Prov - ${this.config.name} - Musikteori.com`;
        document.getElementById('test-title').textContent = `Prov - ${this.config.name}`;

        // Update total questions counter
        const totalQuestionsEl = document.getElementById('total-questions');
        if (totalQuestionsEl) {
            totalQuestionsEl.textContent = this.totalQuestions;
        }

        this.generatePiano(() => {
            // Ask first question only AFTER piano is fully generated
            this.askQuestion();
        });

        // Back to hub button during test
        const backBtn = document.getElementById('back-to-hub-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (confirm('Är du säker på att du vill avbryta provet?')) {
                    if (this.clef === 'f-klav') {
                        window.location.href = 'noter-f-klav-hub.html';
                    } else {
                        window.location.href = 'noter-g-klav-hub.html';
                    }
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

    generatePiano(callback) {
        const pianoKeys = document.getElementById('piano-keys');
        pianoKeys.innerHTML = '';

        // Generate white keys from all octaves
        const whiteKeys = [];
        let globalIndex = 0;

        this.config.pianoOctaves.forEach(octave => {
            octave.notes.forEach((note) => {
                const key = document.createElement('div');
                key.className = 'white-key';
                // Create unique identifier: note-octaveId
                const noteId = `${note}-${octave.id}`;
                key.dataset.note = noteId;

                key.addEventListener('click', () => this.handleKeyPress(noteId));
                pianoKeys.appendChild(key);
                whiteKeys.push({ element: key, note: note, octaveId: octave.id, globalIndex: globalIndex });
                globalIndex++;
            });
        });

        // Wait for layout then add black keys
        requestAnimationFrame(() => {
            const whiteKeyWidth = whiteKeys[0].element.offsetWidth;
            const gap = 2;

            whiteKeys.forEach((keyData) => {
                if (['C', 'D', 'F', 'G', 'A'].includes(keyData.note)) {
                    const blackKey = document.createElement('div');
                    blackKey.className = 'black-key';
                    const noteId = `${keyData.note}#-${keyData.octaveId}`;
                    blackKey.dataset.note = noteId;

                    const leftPosition = (keyData.globalIndex * (whiteKeyWidth + gap)) + (whiteKeyWidth * 0.74);
                    blackKey.style.left = `${leftPosition}px`;

                    blackKey.addEventListener('click', () => this.handleKeyPress(noteId));
                    pianoKeys.appendChild(blackKey);
                }
            });

            // Piano is fully generated, call callback if provided
            if (callback) callback();
        });
    }

    askQuestion() {
        // Pick random note from testNotes
        const randomIndex = Math.floor(Math.random() * this.config.testNotes.length);
        const noteOnly = this.config.testNotes[randomIndex];

        // Create full note identifier with octave
        this.currentNote = `${noteOnly}-${this.config.questionOctave}`;

        // Update question counter with animation
        const questionCounter = document.querySelector('.question-counter');
        document.getElementById('question-number').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.totalQuestions;

        // Trigger animation
        if (questionCounter) {
            questionCounter.classList.remove('updated');
            void questionCounter.offsetWidth; // Force reflow
            questionCounter.classList.add('updated');
            setTimeout(() => questionCounter.classList.remove('updated'), 400);
        }

        // Update note image (use note name only for image path)
        const noteImage = document.getElementById('note-image');
        if (noteImage) {
            noteImage.src = this.getImagePath(noteOnly);
            noteImage.alt = `Noten ${noteOnly}`;
        }
    }

    handleKeyPress(note) {
        if (this.isDisabled) return;

        const isCorrect = note === this.currentNote;

        // Save answer
        this.answers.push({
            question: this.currentNote,
            userAnswer: note,
            correct: isCorrect
        });

        this.currentQuestionIndex++;

        // Check if test is complete
        if (this.currentQuestionIndex >= this.totalQuestions) {
            this.showResults();
        } else {
            // Go to next question immediately (no feedback)
            this.askQuestion();
        }
    }

    showResults() {
        // Hide piano and question
        document.querySelector('.test-body').style.display = 'none';

        // Calculate results
        const correctCount = this.answers.filter(a => a.correct).length;
        const incorrectCount = this.answers.length - correctCount;
        const percentage = Math.round((correctCount / this.answers.length) * 100);
        const passed = correctCount >= this.passingScore;

        // Show results
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.style.display = 'block';

        resultsContainer.innerHTML = `
            <div class="quiz-results">
                <h2>Provet slutfört!</h2>

                <div class="score-display ${passed ? 'passed' : 'failed'}">
                    <div class="score-number">${correctCount}/${this.totalQuestions}</div>
                    <div class="score-percentage">${percentage}%</div>
                </div>

                <div class="result-message">
                    ${passed
                        ? '🎉 Grattis! Du är godkänd!'
                        : `Tyvärr blev du inte godkänd. Du behöver minst ${this.passingScore} rätt av ${this.totalQuestions}.`
                    }
                </div>

                <div class="quiz-actions" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
                    ${passed
                        ? '<button class="btn btn-primary" id="continue-btn">Fortsätt öva →</button>'
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
                // Navigate to the appropriate hub to choose next exercise
                if (this.clef === 'f-klav') {
                    window.location.href = 'noter-f-klav-hub.html';
                } else {
                    window.location.href = 'noter-g-klav-hub.html';
                }
            });
        }

        document.getElementById('retry-btn').addEventListener('click', () => {
            window.location.reload();
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            // Navigate to the appropriate hub based on clef
            if (this.clef === 'f-klav') {
                window.location.href = 'noter-f-klav-hub.html';
            } else {
                window.location.href = 'noter-g-klav-hub.html';
            }
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PianoOctaveTest();
});
