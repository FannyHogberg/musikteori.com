class PianoMultipleOctavesExercise {
    constructor() {
        // Parse URL parameters to get selected octaves
        const urlParams = new URLSearchParams(window.location.search);
        const octavesParam = urlParams.get('octaves') || 'lilla,ettstrukna,tvastrukna';
        this.selectedOctaves = octavesParam.split(',');
        this.clef = urlParams.get('clef') || 'g-klav';

        // Build notes array based on selected octaves
        this.availableNotes = [];
        if (this.selectedOctaves.includes('lilla')) {
            // G-klav only has G, A, B. F-klav has all C-B
            if (this.clef === 'g-klav') {
                this.availableNotes.push(
                    'G-lilla', 'A-lilla', 'B-lilla'
                );
            } else {
                this.availableNotes.push(
                    'C-lilla', 'D-lilla', 'E-lilla', 'F-lilla',
                    'G-lilla', 'A-lilla', 'B-lilla'
                );
            }
        }
        if (this.selectedOctaves.includes('stora')) {
            this.availableNotes.push(
                'C-stora', 'D-stora', 'E-stora', 'F-stora',
                'G-stora', 'A-stora', 'B-stora'
            );
        }
        if (this.selectedOctaves.includes('ettstrukna')) {
            this.availableNotes.push(
                'C-ettstrukna', 'D-ettstrukna', 'E-ettstrukna', 'F-ettstrukna',
                'G-ettstrukna', 'A-ettstrukna', 'B-ettstrukna'
            );
        }
        if (this.selectedOctaves.includes('ettstrukna-fg')) {
            this.availableNotes.push(
                'C-ettstrukna', 'D-ettstrukna', 'E-ettstrukna', 'F-ettstrukna',
                'G-ettstrukna'
            );
        }
        if (this.selectedOctaves.includes('tvastrukna')) {
            this.availableNotes.push(
                'C-tvastrukna', 'D-tvastrukna', 'E-tvastrukna', 'F-tvastrukna',
                'G-tvastrukna', 'A-tvastrukna', 'B-tvastrukna'
            );
        }

        // Test mode: 30 questions, minimum 20 correct (67%)
        this.totalQuestions = 30;
        this.requiredCorrect = 20;

        this.questionCount = 0;
        this.answers = []; // Store all answers
        this.currentNote = null;
        this.isDisabled = false;

        // All white keys for three octaves
        this.allWhiteKeys = [
            { note: 'C', octave: 'lilla' },
            { note: 'D', octave: 'lilla' },
            { note: 'E', octave: 'lilla' },
            { note: 'F', octave: 'lilla' },
            { note: 'G', octave: 'lilla' },
            { note: 'A', octave: 'lilla' },
            { note: 'B', octave: 'lilla' },
            { note: 'C', octave: 'ettstrukna' },
            { note: 'D', octave: 'ettstrukna' },
            { note: 'E', octave: 'ettstrukna' },
            { note: 'F', octave: 'ettstrukna' },
            { note: 'G', octave: 'ettstrukna' },
            { note: 'A', octave: 'ettstrukna' },
            { note: 'B', octave: 'ettstrukna' },
            { note: 'C', octave: 'tvastrukna' },
            { note: 'D', octave: 'tvastrukna' },
            { note: 'E', octave: 'tvastrukna' },
            { note: 'F', octave: 'tvastrukna' },
            { note: 'G', octave: 'tvastrukna' },
            { note: 'A', octave: 'tvastrukna' },
            { note: 'B', octave: 'tvastrukna' },
        ];

        this.init();
    }

    getImagePath(noteName) {
        const [note, octave] = noteName.split('-');
        const octaveFolder = octave === 'ettstrukna' ? 'ettstruknaOktaven' :
                            octave === 'lilla' ? 'lillaOktaven' :
                            octave === 'stora' ? 'storaOktaven' :
                            'tvastruknaOktaven';
        return `/images/noter/${this.clef}/${octaveFolder}/${note.toLowerCase()}.png`;
    }

    init() {
        // Update header
        const octaveNames = this.selectedOctaves.map(o => {
            if (o === 'lilla') return T('octave.lillaShort');
            if (o === 'ettstrukna') return T('octave.ettstruknaShort');
            if (o === 'tvastrukna') return T('octave.tvastruknaShort');
        }).join(', ');

        document.getElementById('level-description').textContent =
            T('multiOctave.description', {names: octaveNames, total: this.totalQuestions, required: this.requiredCorrect});

        this.generatePiano(() => {
            // Ask first question only AFTER piano is fully generated
            this.askQuestion();
        });
        this.attachEventListeners();

        // Hide labels always in test mode
        document.getElementById('piano-keys').classList.add('hide-labels');

        // Hide text question (only show image)
        document.getElementById('question-text').style.display = 'none';

        // Regenerate piano on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.generatePiano();
                // Reapply hide-labels class
                document.getElementById('piano-keys').classList.add('hide-labels');
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

        const whiteKeys = [];
        this.allWhiteKeys.forEach((keyData, index) => {
            const key = document.createElement('div');
            key.className = 'white-key';
            key.dataset.note = `${keyData.note}-${keyData.octave}`;

            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = keyData.note;
            key.appendChild(label);

            // Add octave marker on C keys
            if (keyData.note === 'C') {
                const marker = document.createElement('span');
                marker.className = 'octave-marker';
                marker.textContent = this.getOctaveLabel(keyData.octave);
                key.appendChild(marker);
            }

            key.addEventListener('click', () => this.handleKeyPress(`${keyData.note}-${keyData.octave}`));
            pianoKeys.appendChild(key);
            whiteKeys.push(key);
        });

        requestAnimationFrame(() => {
            const whiteKeyWidth = whiteKeys[0].offsetWidth;
            const gap = 2;

            this.allWhiteKeys.forEach((keyData, index) => {
                if (['C', 'D', 'F', 'G', 'A'].includes(keyData.note)) {
                    const blackKey = document.createElement('div');
                    blackKey.className = 'black-key';
                    const blackNote = `${keyData.note}#-${keyData.octave}`;
                    blackKey.dataset.note = blackNote;

                    const blackLabel = document.createElement('span');
                    blackLabel.className = 'key-label';
                    blackLabel.textContent = keyData.note + '#';
                    blackKey.appendChild(blackLabel);

                    const leftPosition = (index * (whiteKeyWidth + gap)) + (whiteKeyWidth * 0.74);
                    blackKey.style.left = `${leftPosition}px`;

                    blackKey.addEventListener('click', () => this.handleKeyPress(blackNote));
                    pianoKeys.appendChild(blackKey);
                }
            });

            // Piano is fully generated, call callback if provided
            if (callback) callback();
        });
    }

    askQuestion() {
        this.questionCount++;

        // Pick random note from available notes
        const randomIndex = Math.floor(Math.random() * this.availableNotes.length);
        this.currentNote = this.availableNotes[randomIndex];

        // Update progress
        document.getElementById('current-level').textContent =
            `${this.questionCount}/${this.totalQuestions}`;

        // Update note image only (no text)
        const noteImage = document.getElementById('note-image');
        if (noteImage) {
            noteImage.src = this.getImagePath(this.currentNote);
            noteImage.alt = T('exercise.noteAltGeneric');
        }
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
        // Hide piano and controls
        document.querySelector('.piano').style.display = 'none';

        // Hide the controls (back and restart buttons)
        const controls = document.querySelector('.controls');
        if (controls) {
            controls.style.display = 'none';
        }

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
                        ? `<button class="btn btn-primary" id="continue-btn">${T('test.continueBtn')}</button>`
                        : ''
                    }
                    <button class="btn ${passed ? '' : 'btn-primary'}" id="retry-btn">${T('test.retakeBtn')}</button>
                    <button class="btn" id="back-btn">${T('test.changeBtn')}</button>
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('retry-btn').addEventListener('click', () => {
            window.location.reload();
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            // Navigate to the appropriate hub based on clef
            if (this.clef === 'f-klav') {
                window.location.href = localUrl('noter-f-klav-hub.html');
            } else {
                window.location.href = localUrl('noter-g-klav-hub.html');
            }
        });
    }

    attachEventListeners() {
        document.getElementById('restart-btn').addEventListener('click', () => {
            if (confirm(T('test.confirmRestart'))) {
                window.location.reload();
            }
        });

        document.getElementById('back-to-hub-btn').addEventListener('click', () => {
            if (confirm(T('test.confirmAbort'))) {
                // Navigate to the appropriate hub based on clef
                if (this.clef === 'f-klav') {
                    window.location.href = localUrl('noter-f-klav-hub.html');
                } else {
                    window.location.href = localUrl('noter-g-klav-hub.html');
                }
            }
        });
    }
}

// Initialize the exercise when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PianoMultipleOctavesExercise();
});
