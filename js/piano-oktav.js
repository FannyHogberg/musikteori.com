class PianoOctaveExercise {
    constructor() {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.octave = urlParams.get('octave') || 'ettstrukna';
        this.level = parseInt(urlParams.get('level')) || 1;
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
                // For F-clef: all notes c-h. For G-clef: only g-h
                questionOctave: 'lilla',
                questionNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
            },
            'ettstrukna': {
                name: 'Ettstrukna oktaven',
                notation: "c' - b'",
                folder: 'ettstruknaOktaven',
                pianoOctaves: [
                    { id: 'ettstrukna', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }
                ],
                questionOctave: 'ettstrukna',
                questionNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
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
                questionNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
            },
            'stora': {
                name: 'Stora oktaven',
                notation: 'C - B',
                folder: 'storaOktaven',
                pianoOctaves: [
                    { id: 'stora', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }
                ],
                questionOctave: 'stora',
                questionNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
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
                questionNotes: ['C', 'D', 'E', 'F', 'G']
            }
        };

        this.config = this.octaveConfig[this.octave];

        // Level-specific configuration
        // NOTE: showLabels is always false - no labels on piano for note reading
        if (this.octave === 'lilla' && this.clef === 'g-klav') {
            // Lilla oktaven G-klav: only has G, A, B (2 levels only)
            if (this.level === 1) {
                this.levels = [
                    { notes: ['G', 'A', 'B'], description: 'G, A och B', showLabels: false, requiredCorrect: 10, showText: true }
                ];
            } else if (this.level === 2) {
                this.levels = [
                    { notes: ['G', 'A', 'B'], description: 'G, A och B', showLabels: false, requiredCorrect: 10, showText: false }
                ];
            }
        } else if (this.octave === 'ettstrukna-fg') {
            // Ettstrukna-fg (F-klav only): C-G (5 notes, 2 levels)
            if (this.level === 1) {
                this.levels = [
                    { notes: ['C', 'D', 'E', 'F', 'G'], description: 'C-G', showLabels: false, requiredCorrect: 13, showText: true }
                ];
            } else if (this.level === 2) {
                this.levels = [
                    { notes: ['C', 'D', 'E', 'F', 'G'], description: 'C-G', showLabels: false, requiredCorrect: 13, showText: false }
                ];
            }
        } else {
            // All other octaves (ettstrukna, tvastrukna, stora, lilla F-klav): 7 notes, 5 levels
            if (this.level === 1) {
                this.levels = [
                    { notes: ['C', 'D', 'E'], description: 'C, D och E', showLabels: false, requiredCorrect: 10, showText: true }
                ];
            } else if (this.level === 2) {
                this.levels = [
                    { notes: ['C', 'D', 'E'], description: 'C, D och E', showLabels: false, requiredCorrect: 10, showText: false }
                ];
            } else if (this.level === 3) {
                this.levels = [
                    { notes: ['F', 'G', 'A', 'B'], description: 'F, G, A och B', showLabels: false, requiredCorrect: 10, showText: true }
                ];
            } else if (this.level === 4) {
                this.levels = [
                    { notes: ['F', 'G', 'A', 'B'], description: 'F, G, A och B', showLabels: false, requiredCorrect: 10, showText: false }
                ];
            } else if (this.level === 5) {
                this.levels = [
                    { notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], description: 'Alla toner C-B', showLabels: false, requiredCorrect: 15, showText: false }
                ];
            }
        }

        this.currentLevel = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.levelCorrectCount = 0;
        this.questionCount = 0;
        this.currentNote = null;
        this.isDisabled = false;

        this.init();
    }

    getImagePath(note) {
        return `/images/noter/${this.clef}/${this.config.folder}/${note.toLowerCase()}.png`;
    }

    init() {
        // Update page title and header
        document.title = `${this.config.name} - Övning ${this.level} - Musikteori.com`;
        document.getElementById('octave-name').textContent = this.config.name;

        this.generatePiano(() => {
            // Ask first question only AFTER piano is fully generated
            this.askQuestion();
        });
        this.loadLevel();
        this.attachEventListeners();

        // Regenerate piano on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.generatePiano();
                this.loadLevel(); // Reapply hide-labels class
            }, 150);
        });
    }

    getOctaveLabel(octaveId) {
        const labels = {
            'stora': 'C',
            'lilla': 'c',
            'ettstrukna': 'c\u00B9',
            'tvastrukna': 'c\u00B2'
        };
        return labels[octaveId] || '';
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

                const label = document.createElement('span');
                label.className = 'key-label';
                label.textContent = note;
                key.appendChild(label);

                // Add octave marker on C keys
                if (note === 'C') {
                    const marker = document.createElement('span');
                    marker.className = 'octave-marker';
                    marker.textContent = this.getOctaveLabel(octave.id);
                    key.appendChild(marker);
                }

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

                    const blackLabel = document.createElement('span');
                    blackLabel.className = 'key-label';
                    blackLabel.textContent = keyData.note + '#';
                    blackKey.appendChild(blackLabel);

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

    loadLevel() {
        const level = this.levels[this.currentLevel];
        document.getElementById('current-level').textContent = this.currentLevel + 1;
        document.getElementById('level-description').textContent = level.description;

        // Show or hide labels
        const pianoKeys = document.getElementById('piano-keys');
        if (level.showLabels) {
            pianoKeys.classList.remove('hide-labels');
        } else {
            pianoKeys.classList.add('hide-labels');
        }

        // Show or hide text question
        const questionText = document.getElementById('question-text');
        if (level.showText === false) {
            questionText.style.display = 'none';
        } else {
            questionText.style.display = 'block';
        }

        this.levelCorrectCount = 0;
        this.questionCount = 0;
    }

    askQuestion() {
        const level = this.levels[this.currentLevel];
        const randomIndex = Math.floor(Math.random() * level.notes.length);
        const noteOnly = level.notes[randomIndex];

        // Create full note identifier with octave
        this.currentNote = `${noteOnly}-${this.config.questionOctave}`;

        this.questionCount++;

        // Update text (show note name only, without octave)
        const noteSpan = document.getElementById('note-to-find');
        if (noteSpan) {
            noteSpan.textContent = noteOnly;
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
        const feedbackMessage = document.getElementById('feedback-message');
        const pianoKeys = document.getElementById('piano-keys');

        this.isDisabled = true;
        pianoKeys.classList.add('disabled');

        feedbackMessage.classList.remove('show-correct', 'show-incorrect');
        if (isCorrect) {
            feedbackMessage.textContent = '✓ Rätt!';
            feedbackMessage.classList.add('show-correct');
        } else {
            feedbackMessage.textContent = '✗ Fel!';
            feedbackMessage.classList.add('show-incorrect');
        }

        const keys = document.querySelectorAll(`[data-note="${note}"]`);
        keys.forEach(key => {
            key.classList.add(isCorrect ? 'correct' : 'incorrect');
            if (isCorrect) {
                setTimeout(() => {
                    key.classList.remove('correct', 'incorrect');
                }, 500);
            }
            // For incorrect, remove later when showing correct answer
        });

        if (isCorrect) {
            this.correctCount++;
            this.levelCorrectCount++;
            this.updateStats();

            const level = this.levels[this.currentLevel];

            // Check if level is complete
            const isLevelComplete = (level.totalQuestions && this.questionCount >= level.totalQuestions) ||
                                   (!level.totalQuestions && this.levelCorrectCount >= level.requiredCorrect);

            if (isLevelComplete) {
                setTimeout(() => {
                    feedbackMessage.textContent = '';
                    feedbackMessage.classList.remove('show-correct');
                    pianoKeys.classList.remove('disabled');
                    this.isDisabled = false;
                    this.completeLevel();
                }, 1000);
            } else {
                setTimeout(() => {
                    feedbackMessage.textContent = '';
                    feedbackMessage.classList.remove('show-correct');
                    pianoKeys.classList.remove('disabled');
                    this.isDisabled = false;
                    this.askQuestion();
                }, 1000);
            }
        } else {
            this.incorrectCount++;
            this.updateStats();

            // Hide "✗ Fel!" overlay after 1000ms
            setTimeout(() => {
                feedbackMessage.textContent = '';
                feedbackMessage.classList.remove('show-incorrect');
            }, 1000);

            // Show correct answer after 400ms
            setTimeout(() => {
                const correctKeys = document.querySelectorAll(`[data-note="${this.currentNote}"]`);
                correctKeys.forEach(key => {
                    key.classList.add('correct');
                });

                // Remove both red and green at the same time after 1200ms
                setTimeout(() => {
                    // Remove red from incorrect key
                    keys.forEach(key => {
                        key.classList.remove('correct', 'incorrect');
                    });
                    // Remove green from correct key
                    correctKeys.forEach(key => {
                        key.classList.remove('correct', 'incorrect');
                    });

                    pianoKeys.classList.remove('disabled');
                    this.isDisabled = false;

                    const level = this.levels[this.currentLevel];
                    // Check if we've reached total questions limit
                    if (level.totalQuestions && this.questionCount >= level.totalQuestions) {
                        this.completeLevel();
                    } else {
                        this.askQuestion();
                    }
                }, 1200);
            }, 400);
        }
    }

    updateStats() {
        document.getElementById('correct-count').textContent = this.correctCount;
        document.getElementById('incorrect-count').textContent = this.incorrectCount;
    }

    completeLevel() {
        // Hide piano and stats
        document.querySelector('.piano').style.display = 'none';
        document.querySelector('.stats').style.display = 'none';

        const question = document.getElementById('question');

        // Determine max level for this octave/clef combination
        let maxLevel = 5; // Default for most octaves
        if (this.octave === 'lilla' && this.clef === 'g-klav') {
            maxLevel = 2; // G-klav lilla has only 3 notes
        } else if (this.octave === 'ettstrukna-fg') {
            maxLevel = 2; // F-klav ettstrukna-fg has only 5 notes
        }

        if (this.level < maxLevel) {
            // Not final level - offer to continue to next level
            const nextLevel = this.level + 1;
            question.innerHTML = `
                <div class="level-complete">
                    <h2>🎉 Bra jobbat!</h2>
                    <p>Du har klarat övning ${this.level}!</p>
                    <p>Redo för nästa steg?</p>
                    <button class="btn btn-primary" id="next-level-btn">Fortsätt till övning ${nextLevel}</button>
                </div>
            `;

            document.getElementById('next-level-btn').addEventListener('click', () => {
                window.location.href = `piano-oktav.html?octave=${this.octave}&level=${nextLevel}&clef=${this.clef}`;
            });
        } else {
            // Final level complete - suggest going to test
            question.innerHTML = `
                <div class="level-complete">
                    <h2>🎊 Grattis!</h2>
                    <p>Du har klarat alla övningar för ${this.config.name}!</p>
                    <p>Nu kan du läsa noter i ${this.config.name}!</p>
                    <button class="btn btn-primary" id="test-btn">Gå till provet</button>
                </div>
            `;

            document.getElementById('test-btn').addEventListener('click', () => {
                window.location.href = `piano-oktav-prov.html?octave=${this.octave}&clef=${this.clef}`;
            });
        }
    }

    restart() {
        // Show piano and stats again
        document.querySelector('.piano').style.display = 'flex';
        document.querySelector('.stats').style.display = 'flex';

        this.currentLevel = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.levelCorrectCount = 0;
        this.questionCount = 0;
        this.updateStats();
        this.loadLevel();
        const question = document.getElementById('question');
        question.innerHTML = `
            <span id="question-text">Var är <span id="note-to-find"></span>?</span>
            <img src="" alt="Not att hitta" class="note-image" id="note-image">
        `;
        this.askQuestion();
    }

    attachEventListeners() {
        document.getElementById('back-to-hub-btn').addEventListener('click', () => {
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
    new PianoOctaveExercise();
});
