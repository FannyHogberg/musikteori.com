class PianoKeysExercise {
    constructor() {
        // Parse level parameter from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.level = parseInt(urlParams.get('level')) || 1;

        // 12 progressive levels with both question types
        this.levels = [
            // STAMTONER (1-5) - white keys
            { notes: ['C', 'D', 'E'], description: T('desc.cde'),
              showLabels: true, requiredCorrect: 10, questionTypes: ['findKey'] },
            { notes: ['C', 'D', 'E'], description: T('desc.cde'),
              showLabels: false, requiredCorrect: 10, questionTypes: ['findKey', 'nameKey'] },

            { notes: ['F', 'G', 'A', 'B'], description: T('desc.fgab'),
              showLabels: true, requiredCorrect: 10, questionTypes: ['findKey'] },
            { notes: ['F', 'G', 'A', 'B'], description: T('desc.fgab'),
              showLabels: false, requiredCorrect: 10, questionTypes: ['findKey', 'nameKey'] },

            { notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], description: T('desc.allNatural'),
              showLabels: false, requiredCorrect: 15, questionTypes: ['findKey', 'nameKey'] },

            // KORSFÖRTECKEN (7-8) - sharps
            { notes: ['C#', 'D#', 'F#', 'G#', 'A#'], description: T('desc.sharps'),
              showLabels: true, requiredCorrect: 10, questionTypes: ['findKey'] },
            { notes: ['C#', 'D#', 'F#', 'G#', 'A#'], description: T('desc.sharps'),
              showLabels: false, requiredCorrect: 10, questionTypes: ['findKey', 'nameKey'] },

            // B-FÖRTECKEN (9-10) - flats
            { notes: ['Db', 'Eb', 'Gb', 'Ab', 'Bb'], description: T('desc.flats'),
              showLabels: true, requiredCorrect: 10, questionTypes: ['findKey'] },
            { notes: ['Db', 'Eb', 'Gb', 'Ab', 'Bb'], description: T('desc.flats'),
              showLabels: false, requiredCorrect: 10, questionTypes: ['findKey', 'nameKey'] },

            // KOMBINATIONER (11-13) - all mixed
            { notes: ['C','D','E','F','G','A','B','C#','D#','F#','G#','A#'],
              description: T('desc.naturalAndSharps'),
              showLabels: false, requiredCorrect: 20, questionTypes: ['findKey', 'nameKey'] },

            { notes: ['C','D','E','F','G','A','B','Db','Eb','Gb','Ab','Bb'],
              description: T('desc.naturalAndFlats'),
              showLabels: false, requiredCorrect: 20, questionTypes: ['findKey', 'nameKey'] },

            { notes: ['C','D','E','F','G','A','B','C#','D#','F#','G#','A#','Db','Eb','Gb','Ab','Bb'],
              description: T('desc.allNotes'),
              showLabels: false, requiredCorrect: 30, questionTypes: ['findKey', 'nameKey'] }
        ];

        this.currentLevel = this.level - 1; // Convert to 0-indexed
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.levelCorrectCount = 0;
        this.currentNote = null;
        this.currentQuestionType = null;
        this.isDisabled = false;

        // All white keys
        this.allWhiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

        // Two octaves for context
        this.pianoOctaves = [
            { id: 'ettstrukna', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
            { id: 'tvastrukna', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }
        ];

        this.init();
    }

    init() {
        // Calculate section-relative level number
        let sectionName = '';
        let sectionLevel = this.level;
        let totalLevelsInSection = 0;

        if (this.level >= 1 && this.level <= 5) {
            sectionName = T('section.1');
            sectionLevel = this.level;
            totalLevelsInSection = 5;
        } else if (this.level >= 6 && this.level <= 7) {
            sectionName = T('section.2');
            sectionLevel = this.level - 5;
            totalLevelsInSection = 2;
        } else if (this.level >= 8 && this.level <= 9) {
            sectionName = T('section.3');
            sectionLevel = this.level - 7;
            totalLevelsInSection = 2;
        } else if (this.level >= 10 && this.level <= 12) {
            sectionName = T('section.4');
            sectionLevel = this.level - 9;
            totalLevelsInSection = 3;
        }

        // Update level display
        const levelNumberEl = document.getElementById('level-number');
        if (levelNumberEl) {
            levelNumberEl.textContent = sectionLevel;
        }

        // Update subtitle to show section and level
        const subtitleEl = document.querySelector('.subtitle');
        if (subtitleEl) {
            subtitleEl.innerHTML = `${sectionName} – ${T('level.n', {n: sectionLevel})} / ${totalLevelsInSection}`;
        }

        // Update level description
        const currentLevelConfig = this.levels[this.currentLevel];
        const descriptionEl = document.getElementById('level-description-text');
        if (descriptionEl && currentLevelConfig.description) {
            let descText = currentLevelConfig.description;
            if (currentLevelConfig.showLabels) {
                descText += ' ' + T('level.withHelp');
            } else {
                descText += ' ' + T('level.withoutHelp');
            }
            descriptionEl.textContent = descText;
        }

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
                this.generatePiano(() => {
                    this.loadLevel();
                    // Re-apply highlight if current question is nameKey
                    if (this.currentQuestionType === 'nameKey' && this.currentNote) {
                        const allKeys = document.querySelectorAll('.white-key, .black-key');
                        allKeys.forEach(key => {
                            const keyNote = key.getAttribute('data-note');
                            const keyNoteAlt = key.getAttribute('data-note-alt');
                            if (keyNote === this.currentNote || keyNoteAlt === this.currentNote || this.noteMatches(keyNote, this.currentNote)) {
                                key.classList.add('highlighted');
                            }
                        });
                    }
                });
            }, 150);
        });
    }

    generatePiano(callback) {
        const pianoKeys = document.getElementById('piano-keys');
        pianoKeys.innerHTML = '';

        // Check if current level uses b-förtecken
        const currentLevelConfig = this.levels[this.currentLevel];
        const useFlatNotation = currentLevelConfig.notes.some(note => note.includes('b'));

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

        // Generate black keys with appropriate notation (sharp or flat)
        requestAnimationFrame(() => {
            const whiteKeyWidth = whiteKeys[0].element.offsetWidth;
            const gap = 2;

            whiteKeys.forEach((keyData) => {
                if (['C', 'D', 'F', 'G', 'A'].includes(keyData.note)) {
                    const blackKey = document.createElement('div');
                    blackKey.className = 'black-key';

                    const sharpNote = keyData.note + '#';
                    const flatNote = this.getEnharmonicFlat(keyData.note);

                    // Set primary and alternate notations
                    if (useFlatNotation && flatNote) {
                        // For flat levels, show flat as primary
                        blackKey.dataset.note = flatNote;
                        blackKey.setAttribute('data-note-alt', sharpNote);
                    } else {
                        // For sharp levels, show sharp as primary
                        blackKey.dataset.note = sharpNote;
                        if (flatNote) {
                            blackKey.setAttribute('data-note-alt', flatNote);
                        }
                    }
                    blackKey.dataset.octave = keyData.octaveId;

                    const blackLabel = document.createElement('span');
                    blackLabel.className = 'key-label';
                    // Show the primary notation on the label
                    blackLabel.textContent = useFlatNotation && flatNote ? flatNote : sharpNote;
                    blackKey.appendChild(blackLabel);

                    const leftPosition = (keyData.globalIndex * (whiteKeyWidth + gap)) + (whiteKeyWidth * 0.74);
                    blackKey.style.left = `${leftPosition}px`;

                    // Click handler uses the primary notation
                    const primaryNote = useFlatNotation && flatNote ? flatNote : sharpNote;
                    blackKey.addEventListener('click', () => {
                        this.handleKeyPress(primaryNote);
                    });

                    pianoKeys.appendChild(blackKey);
                }
            });

            // Piano is fully generated, call callback if provided
            if (callback) callback();
        });
    }

    loadLevel() {
        const level = this.levels[this.currentLevel];

        // Show or hide labels
        const pianoKeys = document.getElementById('piano-keys');
        if (level.showLabels) {
            pianoKeys.classList.remove('hide-labels');
        } else {
            pianoKeys.classList.add('hide-labels');
        }

        // Hide black key labels if we're only practicing natural notes (stamtoner)
        const hasOnlyNaturalNotes = level.notes.every(note => !note.includes('#') && !note.includes('b'));
        if (hasOnlyNaturalNotes) {
            pianoKeys.classList.add('hide-black-labels');
        } else {
            pianoKeys.classList.remove('hide-black-labels');
        }

        this.levelCorrectCount = 0;
    }

    askQuestion() {
        const level = this.levels[this.currentLevel];
        const randomIndex = Math.floor(Math.random() * level.notes.length);
        this.currentNote = level.notes[randomIndex];

        // Choose question type randomly
        const questionTypes = level.questionTypes || ['findKey'];
        const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        this.currentQuestionType = randomType;

        if (randomType === 'findKey') {
            this.askFindKeyQuestion();
        } else if (randomType === 'nameKey') {
            this.askNameKeyQuestion();
        }
    }

    askFindKeyQuestion() {
        // Show note name with pronunciation guide if applicable
        const pronunciation = getNotePronunciation(this.currentNote);
        const questionText = pronunciation
            ? T('piano.findKeyPronunciation', {note: this.currentNote, pronunciation: pronunciation})
            : T('piano.findKey', {note: this.currentNote});

        document.getElementById('question').textContent = questionText;
        document.getElementById('question').style.display = 'block';

        // Hide buttons but keep the space
        const noteButtons = document.getElementById('note-buttons');
        noteButtons.innerHTML = '';
        noteButtons.style.visibility = 'hidden';

        // Enable piano clicks and interactions
        const pianoKeys = document.getElementById('piano-keys');
        pianoKeys.classList.remove('disabled', 'no-interaction');
    }

    askNameKeyQuestion() {
        // Highlight ONE RANDOM key from ANY octave, user clicks note name button
        document.getElementById('question').textContent = T('piano.nameKey');
        document.getElementById('question').style.display = 'block';

        // Find ALL keys with this note name (both octaves)
        let allPossibleKeys = [];

        // Search through all piano keys manually to find matches
        const allKeys = document.querySelectorAll('.white-key, .black-key');

        allKeys.forEach(key => {
            const keyNote = key.getAttribute('data-note');
            const keyNoteAlt = key.getAttribute('data-note-alt');

            // Check if this key matches the current note (or its enharmonic equivalent)
            if (keyNote === this.currentNote || keyNoteAlt === this.currentNote) {
                allPossibleKeys.push(key);
            } else if (this.noteMatches(keyNote, this.currentNote)) {
                allPossibleKeys.push(key);
            }
        });

        // Choose ONE random key to highlight
        if (allPossibleKeys.length > 0) {
            const randomKeyIndex = Math.floor(Math.random() * allPossibleKeys.length);
            const selectedKey = allPossibleKeys[randomKeyIndex];
            selectedKey.classList.add('highlighted');
        } else {
            // Fallback: if no keys found, log error and ask a different question
            console.error('No keys found for note:', this.currentNote);
            console.error('Available keys:', allKeys);
            console.error('Looking for:', this.currentNote);
            // Ask a different question
            this.askQuestion();
            return;
        }

        // Show note name buttons
        this.generateNoteButtons();

        // Disable piano interaction (no hover/click effects)
        const pianoKeys = document.getElementById('piano-keys');
        pianoKeys.classList.add('no-interaction');
    }

    generateNoteButtons() {
        const level = this.levels[this.currentLevel];
        const buttonsContainer = document.getElementById('note-buttons');
        buttonsContainer.innerHTML = '';

        // Check if this level mixes sharps and flats
        const hasOnlySharps = level.notes.every(note => !note.includes('b'));
        const hasOnlyFlats = level.notes.every(note => !note.includes('#'));
        const isMixedLevel = !hasOnlySharps && !hasOnlyFlats;

        // For mixed levels, deduplicate enharmonic equivalents
        let notesToShow = level.notes;
        if (isMixedLevel) {
            const seen = new Set();
            notesToShow = [];

            level.notes.forEach(note => {
                // For sharp notes, add them and mark their flat equivalent as seen
                if (note.includes('#')) {
                    if (!seen.has(note)) {
                        notesToShow.push(note);
                        seen.add(note);
                        const baseNote = note.replace('#', '');
                        const flatEquiv = this.getEnharmonicFlat(baseNote);
                        if (flatEquiv) {
                            seen.add(flatEquiv); // Mark the flat version as seen
                        }
                    }
                }
                // For natural notes (C, D, E, F, G, A, B), always add them
                else if (!note.includes('b')) {
                    if (!seen.has(note)) {
                        notesToShow.push(note);
                        seen.add(note);
                    }
                }
                // For flat notes, only add if we haven't seen the sharp equivalent
                else if (note.includes('b')) {
                    if (!seen.has(note)) {
                        notesToShow.push(note);
                        seen.add(note);
                    }
                }
            });
        }

        // Shuffle the buttons so they don't match piano layout
        const shuffledNotes = [...notesToShow].sort(() => Math.random() - 0.5);

        // Create buttons
        shuffledNotes.forEach(note => {
            const button = document.createElement('button');
            button.className = 'note-button';
            button.dataset.note = note;

            // For Del 4 (Alla toner), always show both notations
            // For other mixed levels, show both notations
            // For pure sharp/flat levels, show only that notation
            let displayText = note;

            // Del 4, Nivå 3 (level index 11) should always show both
            const isAllTonesLevel = this.currentLevel === 11;

            if (isMixedLevel || isAllTonesLevel) {
                // Show both notations for mixed levels or "Alla toner"
                if (note.includes('#')) {
                    const baseNote = note.replace('#', '');
                    const flatEquiv = this.getEnharmonicFlat(baseNote);
                    displayText = `${note} / ${flatEquiv}`;
                } else if (note.includes('b')) {
                    const sharpEquiv = this.getFlatToSharp(note);
                    if (sharpEquiv) {
                        displayText = `${sharpEquiv} / ${note}`;
                    }
                }
            }
            // else: for pure sharp or flat levels, just show the note as-is

            button.textContent = displayText;
            button.addEventListener('click', () => this.handleNoteButtonClick(note));
            buttonsContainer.appendChild(button);
        });

        // Set display and visibility AFTER adding buttons
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.visibility = 'visible';
    }

    handleNoteButtonClick(clickedNote) {
        if (this.isDisabled) return;

        const isCorrect = this.noteMatches(clickedNote, this.currentNote);
        const feedbackMessage = document.getElementById('feedback-message');
        const buttonsContainer = document.getElementById('note-buttons');

        this.isDisabled = true;
        buttonsContainer.classList.add('disabled');

        // Find clicked button
        const buttons = buttonsContainer.querySelectorAll('.note-button');
        let clickedButton = null;
        buttons.forEach(btn => {
            if (btn.dataset.note === clickedNote) {
                clickedButton = btn;
            }
        });

        // Show feedback
        feedbackMessage.classList.remove('show-correct', 'show-incorrect');
        if (isCorrect) {
            feedbackMessage.textContent = T('feedback.correct');
            feedbackMessage.classList.add('show-correct');
            if (clickedButton) clickedButton.classList.add('correct');

            this.correctCount++;
            this.levelCorrectCount++;
            this.updateStats();

            // Remove highlight from piano after 1000ms
            setTimeout(() => {
                const highlightedKeys = document.querySelectorAll('.highlighted');
                highlightedKeys.forEach(key => key.classList.remove('highlighted'));
                feedbackMessage.textContent = '';
                feedbackMessage.classList.remove('show-correct');
                if (clickedButton) clickedButton.classList.remove('correct');
                buttonsContainer.classList.remove('disabled');
                const pianoKeys = document.getElementById('piano-keys');
                pianoKeys.classList.remove('no-interaction');
                this.isDisabled = false;

                // Check if level is complete
                const level = this.levels[this.currentLevel];
                if (this.levelCorrectCount >= level.requiredCorrect) {
                    this.completeLevel();
                } else {
                    this.askQuestion();
                }
            }, 1000);

        } else {
            feedbackMessage.textContent = T('feedback.incorrect');
            feedbackMessage.classList.add('show-incorrect');
            if (clickedButton) clickedButton.classList.add('incorrect');

            this.incorrectCount++;
            this.updateStats();

            // Show correct answer after 400ms
            setTimeout(() => {
                feedbackMessage.textContent = '';
                feedbackMessage.classList.remove('show-incorrect');

                // Mark correct button
                buttons.forEach(btn => {
                    if (this.noteMatches(btn.dataset.note, this.currentNote)) {
                        btn.classList.add('correct');
                    }
                });

                // Remove all marks after 1200ms (show correct answer briefly)
                setTimeout(() => {
                    buttons.forEach(btn => {
                        btn.classList.remove('correct', 'incorrect');
                    });
                    const highlightedKeys = document.querySelectorAll('.highlighted');
                    highlightedKeys.forEach(key => key.classList.remove('highlighted'));

                    buttonsContainer.classList.remove('disabled');
                    const pianoKeys = document.getElementById('piano-keys');
                    pianoKeys.classList.remove('no-interaction');
                    this.isDisabled = false;
                    this.askQuestion();
                }, 1200);
            }, 800);
        }
    }

    handleKeyPress(note) {
        // Ignore clicks in nameKey mode
        if (this.currentQuestionType === 'nameKey') return;
        if (this.isDisabled) return;

        // Check if answer is correct (accepts enharmonic equivalents)
        const isCorrect = this.noteMatches(note, this.currentNote);

        // Find ALL keys with this note name (both octaves)
        const clickedKeys = document.querySelectorAll(`[data-note="${note}"]`);

        const feedbackMessage = document.getElementById('feedback-message');
        const pianoKeys = document.getElementById('piano-keys');

        this.isDisabled = true;
        pianoKeys.classList.add('disabled');

        feedbackMessage.classList.remove('show-correct', 'show-incorrect');
        if (isCorrect) {
            feedbackMessage.textContent = T('feedback.correct');
            feedbackMessage.classList.add('show-correct');
        } else {
            feedbackMessage.textContent = T('feedback.incorrect');
            feedbackMessage.classList.add('show-incorrect');
        }

        // Mark ALL clicked keys (both octaves) with correct/incorrect color
        clickedKeys.forEach(key => {
            key.classList.add(isCorrect ? 'correct' : 'incorrect');
            if (isCorrect) {
                setTimeout(() => {
                    key.classList.remove('correct', 'incorrect');
                }, 500);
            }
        });

        if (isCorrect) {
            this.correctCount++;
            this.levelCorrectCount++;
            this.updateStats();

            const level = this.levels[this.currentLevel];
            if (this.levelCorrectCount >= level.requiredCorrect) {
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

            setTimeout(() => {
                feedbackMessage.textContent = '';
                feedbackMessage.classList.remove('show-incorrect');
            }, 1000);

            // Show correct answer
            setTimeout(() => {
                const correctKeys = document.querySelectorAll(`[data-note="${this.currentNote}"]`);
                // Also check enharmonic
                const enharmonicKeys = [];
                if (this.currentNote.includes('b')) {
                    const sharpEquiv = this.getFlatToSharp(this.currentNote);
                    if (sharpEquiv) {
                        const sharpKeys = document.querySelectorAll(`[data-note="${sharpEquiv}"]`);
                        sharpKeys.forEach(k => enharmonicKeys.push(k));
                    }
                }

                correctKeys.forEach(key => key.classList.add('correct'));
                enharmonicKeys.forEach(key => key.classList.add('correct'));

                setTimeout(() => {
                    clickedKeys.forEach(key => {
                        key.classList.remove('correct', 'incorrect');
                    });
                    correctKeys.forEach(key => {
                        key.classList.remove('correct', 'incorrect');
                    });
                    enharmonicKeys.forEach(key => {
                        key.classList.remove('correct', 'incorrect');
                    });

                    pianoKeys.classList.remove('disabled', 'no-interaction');
                    this.isDisabled = false;
                    this.askQuestion();
                }, 1200);
            }, 800);
        }
    }

    // Check if two notes match (including enharmonic equivalents)
    noteMatches(note1, note2) {
        if (note1 === note2) return true;

        // Check enharmonic equivalents
        if (note1.includes('#')) {
            const baseNote = note1.replace('#', '');
            const flatEquiv = this.getEnharmonicFlat(baseNote);
            if (flatEquiv === note2) return true;
        }
        if (note2.includes('#')) {
            const baseNote = note2.replace('#', '');
            const flatEquiv = this.getEnharmonicFlat(baseNote);
            if (flatEquiv === note1) return true;
        }

        return false;
    }

    // Convert korsförtecken to b-förtecken
    getEnharmonicFlat(note) {
        const mapping = {
            'C': 'Db',
            'D': 'Eb',
            'F': 'Gb',
            'G': 'Ab',
            'A': 'Bb'
        };
        return mapping[note];
    }

    // Convert b-förtecken to korsförtecken
    getFlatToSharp(flatNote) {
        const mapping = {
            'Db': 'C#',
            'Eb': 'D#',
            'Gb': 'F#',
            'Ab': 'G#',
            'Bb': 'A#'
        };
        return mapping[flatNote];
    }

    updateStats() {
        document.getElementById('correct-count').textContent = this.correctCount;
        document.getElementById('incorrect-count').textContent = this.incorrectCount;
    }

    completeLevel() {
        // Hide piano, stats, and note buttons
        document.querySelector('.piano').style.display = 'none';
        document.querySelector('.stats').style.display = 'none';
        document.getElementById('note-buttons').style.visibility = 'hidden';

        const question = document.getElementById('question');
        const isLastLevel = this.currentLevel >= this.levels.length - 1;

        if (!isLastLevel) {
            // Not last level - show "Continue" button
            const nextLevelNumber = this.level + 1; // Next level (1-indexed)

            // Special cases: End of section - go to test
            if (this.level === 5) {
                // End of Del 1
                question.innerHTML = `
                    <div class="level-complete">
                        <h2>${T('level.wellDone')}</h2>
                        <p>${T('level.completedSection', {section: T('section.1')})}</p>
                        <p>${T('level.readyForTest')}</p>
                        <button class="btn btn-primary" id="test-btn">
                            ${T('level.goToTestNatural')}
                        </button>
                    </div>
                `;

                document.getElementById('test-btn').addEventListener('click', () => {
                    window.location.href = localUrl('piano-stamtoner-prov.html');
                });

            } else if (this.level === 7) {
                // End of Del 2
                question.innerHTML = `
                    <div class="level-complete">
                        <h2>${T('level.wellDone')}</h2>
                        <p>${T('level.completedSection', {section: T('section.2')})}</p>
                        <p>${T('level.readyForTest')}</p>
                        <button class="btn btn-primary" id="test-btn">
                            ${T('level.goToTestSharps')}
                        </button>
                    </div>
                `;

                document.getElementById('test-btn').addEventListener('click', () => {
                    window.location.href = localUrl('piano-kors-prov.html');
                });

            } else if (this.level === 9) {
                // End of Del 3
                question.innerHTML = `
                    <div class="level-complete">
                        <h2>${T('level.wellDone')}</h2>
                        <p>${T('level.completedSection', {section: T('section.3')})}</p>
                        <p>${T('level.readyForTest')}</p>
                        <button class="btn btn-primary" id="test-btn">
                            ${T('level.goToTestFlats')}
                        </button>
                    </div>
                `;

                document.getElementById('test-btn').addEventListener('click', () => {
                    window.location.href = localUrl('piano-b-prov.html');
                });

            } else {
                // Calculate display text for next level
                let nextLevelText = '';
                const partWord = LANG === 'sv' ? 'Del' : 'Part';
                if (nextLevelNumber === 6) {
                    nextLevelText = `${partWord} 2, ${T('level.n', {n: 1})}`;
                } else if (nextLevelNumber === 8) {
                    nextLevelText = `${partWord} 3, ${T('level.n', {n: 1})}`;
                } else if (nextLevelNumber === 10) {
                    nextLevelText = `${partWord} 4, ${T('level.n', {n: 1})}`;
                } else if (nextLevelNumber >= 1 && nextLevelNumber <= 5) {
                    nextLevelText = T('level.n', {n: nextLevelNumber});
                } else if (nextLevelNumber >= 6 && nextLevelNumber <= 7) {
                    nextLevelText = T('level.n', {n: nextLevelNumber - 5});
                } else if (nextLevelNumber >= 8 && nextLevelNumber <= 9) {
                    nextLevelText = T('level.n', {n: nextLevelNumber - 7});
                } else if (nextLevelNumber >= 10 && nextLevelNumber <= 12) {
                    nextLevelText = T('level.n', {n: nextLevelNumber - 9});
                }

                question.innerHTML = `
                    <div class="level-complete">
                        <h2>${T('level.wellDone')}</h2>
                        <p>${T('level.completedThis')}</p>
                        <p>${T('level.readyForNext')}</p>
                        <button class="btn btn-primary" id="next-level-btn">
                            ${T('level.continueTo', {level: nextLevelText})}
                        </button>
                    </div>
                `;

                document.getElementById('next-level-btn').addEventListener('click', () => {
                    window.location.href = localUrl(`piano-tangenter-ova.html?level=${nextLevelNumber}`);
                });
            }

        } else {
            // Last level - show congratulations
            question.innerHTML = `
                <div class="level-complete">
                    <h2>${T('level.congrats')}</h2>
                    <p>${T('level.completedAll')}</p>
                    <p>${T('level.knowAllNotes')}</p>
                    <button class="btn btn-primary" id="test-btn">${T('level.goToTest')}</button>
                </div>
            `;

            document.getElementById('test-btn').addEventListener('click', () => {
                window.location.href = localUrl('piano-tangenter-prov.html');
            });
        }
    }

    attachEventListeners() {
        const backBtn = document.getElementById('back-to-hub-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = localUrl('piano-hub.html');
            });
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PianoKeysExercise();
});
