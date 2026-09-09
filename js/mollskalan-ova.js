class MollskalanBuilderExercise {
    constructor() {
        this.letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        this.naturalSemitone = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        this.pattern = [0, 2, 3, 5, 7, 8, 10, 12]; // hel, halv, hel, hel, halv, hel, hel (kumulativt)
        this.roots = [
            { letter: 'C', diff: 0 },
            { letter: 'G', diff: 0 },
            { letter: 'D', diff: 0 },
            { letter: 'A', diff: 0 },
            { letter: 'E', diff: 0 },
            { letter: 'B', diff: 0 },
            { letter: 'F', diff: 1 },  // F♯
            { letter: 'C', diff: 1 },  // C♯
            { letter: 'G', diff: 1 },  // G♯
            { letter: 'F', diff: 0 },
            { letter: 'B', diff: -1 }, // B♭
            { letter: 'E', diff: -1 }  // E♭
        ];

        this.isDisabled = false;
        this.deck = [];
        this.lastRoot = null;

        this.attachEventListeners();
        this.startRound();
    }

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    drawRoot() {
        if (this.deck.length === 0) {
            this.deck = this.shuffle(this.roots);

            // Undvik att samma tonart kommer två gånger i rad när en ny kortlek börjar
            if (this.lastRoot && this.deck[0] === this.lastRoot && this.deck.length > 1) {
                [this.deck[0], this.deck[1]] = [this.deck[1], this.deck[0]];
            }
        }

        const root = this.deck.shift();
        this.lastRoot = root;
        return root;
    }

    spellNote(letter, diff) {
        if (diff === 0) return letter;
        if (diff === 1) return letter + '♯';
        if (diff === -1) return letter + '♭';
        if (diff === 2) return letter + '♯♯';
        return letter + '♭♭';
    }

    buildScale(root) {
        const rootIndex = this.letters.indexOf(root.letter);
        const rootPitch = ((this.naturalSemitone[root.letter] + root.diff) % 12 + 12) % 12;

        return this.pattern.map((offset, i) => {
            const letter = this.letters[(rootIndex + i) % this.letters.length];
            const pitch = (rootPitch + offset) % 12;
            const natural = this.naturalSemitone[letter];
            let diff = pitch - natural;
            if (diff > 6) diff -= 12;
            if (diff < -6) diff += 12;
            return { letter, pitch, diff, name: this.spellNote(letter, diff) };
        });
    }

    intervalWord(semitones) {
        const d = ((semitones % 12) + 12) % 12;
        if (d === 0) return 'ingen skillnad alls';
        if (d === 1) return 'en halvton';
        if (d === 2) return 'en helton';
        if (d === 3) return 'en och en halv ton';
        return `${d} halvtoner`;
    }

    startRound() {
        const root = this.drawRoot();
        this.currentRootName = this.spellNote(root.letter, root.diff);
        this.scale = this.buildScale(root);
        this.stepIndex = 1;

        document.getElementById('scale-target').textContent = `Bygg ${this.currentRootName}-moll`;

        this.setHintExpanded(false);

        const buttonsContainer = document.getElementById('answer-buttons');
        buttonsContainer.style.visibility = 'visible';

        this.askStep();
    }

    askStep() {
        const builtSoFar = this.scale.slice(0, this.stepIndex).map(n => n.name).join(' - ');
        document.getElementById('scale-progress').textContent = `${builtSoFar} - ?`;
        document.getElementById('step-info').textContent = `Steg ${this.stepIndex} av 7`;
        document.getElementById('question').textContent = 'Vilken ton kommer härnäst?';

        const targetLetter = this.scale[this.stepIndex].letter;
        const natural = this.naturalSemitone[targetLetter];
        const options = [
            { name: this.spellNote(targetLetter, -1), pitch: (natural - 1 + 12) % 12 },
            { name: this.spellNote(targetLetter, 0), pitch: natural },
            { name: this.spellNote(targetLetter, 1), pitch: (natural + 1) % 12 }
        ];

        const buttonsContainer = document.getElementById('answer-buttons');
        buttonsContainer.innerHTML = '';

        options.forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'note-button';
            button.dataset.answer = option.name;
            button.textContent = option.name;
            button.addEventListener('click', () => this.handleAnswer(option, button));
            buttonsContainer.appendChild(button);
        });
    }

    handleAnswer(option, guessedButton) {
        if (this.isDisabled) return;
        this.isDisabled = true;

        // Rensa kvarvarande markering/feedback från ett eventuellt tidigare felförsök på det här steget
        document.querySelectorAll('#answer-buttons .note-button').forEach(btn => {
            btn.classList.remove('correct', 'incorrect');
        });

        const prev = this.scale[this.stepIndex - 1];
        const correct = this.scale[this.stepIndex];
        const isCorrect = option.name === correct.name;

        const guessDistance = ((option.pitch - prev.pitch) % 12 + 12) % 12;

        const feedbackMessage = document.getElementById('feedback-message');
        feedbackMessage.classList.remove('show-correct', 'show-incorrect');
        void feedbackMessage.offsetWidth; // tvingar reflow så shake-animationen startar om vid upprepade felsvar

        if (isCorrect) {
            feedbackMessage.textContent = '✓ Rätt!';
            feedbackMessage.classList.add('show-correct');
            guessedButton.classList.add('correct');
        } else {
            let detail;
            if (guessDistance === 0) {
                detail = `${prev.name} → ${option.name} är ingen skillnad alls.`;
            } else {
                detail = `${prev.name} → ${option.name} är ${this.intervalWord(guessDistance)}.`;
            }
            feedbackMessage.textContent = `Inte riktigt. ${detail} Försök igen.`;
            feedbackMessage.classList.add('show-incorrect');
            guessedButton.classList.add('incorrect');
        }

        if (isCorrect) {
            setTimeout(() => {
                feedbackMessage.textContent = '';
                feedbackMessage.classList.remove('show-correct');
                guessedButton.classList.remove('correct');
                this.isDisabled = false;

                if (this.stepIndex >= 7) {
                    this.finish();
                } else {
                    this.stepIndex++;
                    this.askStep();
                }
            }, 800);
        } else {
            // Kort spärr mot dubbelklick - felmeddelandet och den röda markeringen ligger kvar
            // tills eleven svarar igen (rensas då av städningen högst upp i den här metoden).
            setTimeout(() => {
                this.isDisabled = false;
            }, 350);
        }
    }

    finish() {
        document.getElementById('answer-buttons').style.visibility = 'hidden';
        document.getElementById('step-info').textContent = '';

        const fullScale = this.scale.map(n => n.name).join(' - ');
        document.getElementById('scale-progress').textContent = fullScale;

        const question = document.getElementById('question');
        question.innerHTML = `
            <div class="level-complete">
                <h2>✓ Du byggde ${this.currentRootName}-mollskalan!</h2>
                <p>${fullScale}</p>
                <button class="btn btn-primary" id="restart-btn">Nästa skala →</button>
            </div>
        `;

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.startRound();
        });
    }

    attachEventListeners() {
        const backBtn = document.getElementById('back-to-hub-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = '../ovningar.html';
            });
        }

        document.getElementById('hint-toggle-btn').addEventListener('click', () => {
            this.setHintExpanded(!this.hintExpanded);
        });
    }

    setHintExpanded(expanded) {
        this.hintExpanded = expanded;
        const hintBtn = document.getElementById('hint-toggle-btn');
        const hintText = document.getElementById('hint-box-text');
        hintBtn.setAttribute('aria-expanded', String(expanded));
        hintText.innerHTML = expanded
            ? '<strong>Mönster:</strong> Hel - Halv - Hel - Hel - Halv - Hel - Hel'
            : '💡 Behöver du hjälp? Visa tips';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MollskalanBuilderExercise();
});
