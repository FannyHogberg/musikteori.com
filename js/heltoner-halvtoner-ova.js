class HalvtonHeltonExercise {
    constructor() {
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.roundsPlayed = 0;
        this.totalRounds = 10;
        this.currentPair = null;
        this.isDisabled = false;

        // Kromatisk kedja över en oktav, C till nästa C (13 toner)
        this.chain = [
            { note: 'C', octave: 'o1' },
            { note: 'C#', octave: 'o1' },
            { note: 'D', octave: 'o1' },
            { note: 'D#', octave: 'o1' },
            { note: 'E', octave: 'o1' },
            { note: 'F', octave: 'o1' },
            { note: 'F#', octave: 'o1' },
            { note: 'G', octave: 'o1' },
            { note: 'G#', octave: 'o1' },
            { note: 'A', octave: 'o1' },
            { note: 'A#', octave: 'o1' },
            { note: 'B', octave: 'o1' },
            { note: 'C', octave: 'o2' }
        ];

        this.init();
    }

    init() {
        this.generatePiano(() => this.askQuestion());
        this.attachEventListeners();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.generatePiano(() => {
                    if (this.currentPair) this.highlightPair();
                });
            }, 150);
        });
    }

    generatePiano(callback) {
        const pianoKeys = document.getElementById('piano-keys');
        pianoKeys.innerHTML = '';
        pianoKeys.classList.add('no-interaction');

        const whiteEntries = this.chain.filter(entry => !entry.note.includes('#'));
        const whiteKeys = [];

        whiteEntries.forEach((entry, globalIndex) => {
            const key = document.createElement('div');
            key.className = 'white-key';
            key.dataset.note = entry.note;
            key.dataset.octave = entry.octave;

            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = entry.note;
            key.appendChild(label);

            pianoKeys.appendChild(key);
            whiteKeys.push({ element: key, globalIndex, note: entry.note, octave: entry.octave });
        });

        requestAnimationFrame(() => {
            const whiteKeyWidth = whiteKeys[0].element.offsetWidth;
            const gap = 2;
            const blackAfter = ['C', 'D', 'F', 'G', 'A'];

            whiteKeys.forEach(({ globalIndex, note, octave }) => {
                if (octave !== 'o1' || !blackAfter.includes(note)) return;

                const sharpNote = note + '#';
                const blackKey = document.createElement('div');
                blackKey.className = 'black-key';
                blackKey.dataset.note = sharpNote;
                blackKey.dataset.octave = 'o1';

                const blackLabel = document.createElement('span');
                blackLabel.className = 'key-label';
                blackLabel.textContent = sharpNote;
                blackKey.appendChild(blackLabel);

                const leftPosition = (globalIndex * (whiteKeyWidth + gap)) + (whiteKeyWidth * 0.74);
                blackKey.style.left = `${leftPosition}px`;

                pianoKeys.appendChild(blackKey);
            });

            if (callback) callback();
        });
    }

    buildPairs() {
        const halvton = [];
        const helton = [];
        for (let i = 0; i < this.chain.length - 1; i++) {
            halvton.push([i, i + 1]);
        }
        for (let i = 0; i < this.chain.length - 2; i++) {
            helton.push([i, i + 2]);
        }
        return { halvton, helton };
    }

    askQuestion() {
        const { halvton, helton } = this.buildPairs();
        const type = Math.random() < 0.5 ? 'halvton' : 'helton';
        const pairs = type === 'halvton' ? halvton : helton;
        const [i, j] = pairs[Math.floor(Math.random() * pairs.length)];

        this.currentPair = { type, from: this.chain[i], to: this.chain[j] };

        document.getElementById('question').textContent = T('wholeHalf.question');

        this.highlightPair();
    }

    highlightPair() {
        document.querySelectorAll('.highlighted').forEach(key => key.classList.remove('highlighted'));

        [this.currentPair.from, this.currentPair.to].forEach(entry => {
            const key = document.querySelector(`[data-note="${entry.note}"][data-octave="${entry.octave}"]`);
            if (key) key.classList.add('highlighted');
        });
    }

    handleAnswer(guess) {
        if (this.isDisabled) return;
        this.isDisabled = true;

        const isCorrect = guess === this.currentPair.type;
        const feedbackMessage = document.getElementById('feedback-message');
        const guessedButton = document.querySelector(`[data-answer="${guess}"]`);
        const correctButton = document.querySelector(`[data-answer="${this.currentPair.type}"]`);

        feedbackMessage.classList.remove('show-correct', 'show-incorrect');
        document.querySelectorAll('.highlighted').forEach(key => key.classList.add(isCorrect ? 'correct' : 'incorrect'));

        if (isCorrect) {
            feedbackMessage.textContent = T('wholeHalf.correct');
            feedbackMessage.classList.add('show-correct');
            guessedButton.classList.add('correct');
            this.correctCount++;
        } else {
            feedbackMessage.textContent = T('wholeHalf.incorrect');
            feedbackMessage.classList.add('show-incorrect');
            guessedButton.classList.add('incorrect');
            if (correctButton) correctButton.classList.add('correct');
            this.incorrectCount++;
        }

        this.updateStats();
        this.roundsPlayed++;

        setTimeout(() => {
            feedbackMessage.textContent = '';
            feedbackMessage.classList.remove('show-correct', 'show-incorrect');
            document.querySelectorAll('.note-button').forEach(btn => btn.classList.remove('correct', 'incorrect'));
            document.querySelectorAll('.highlighted, .correct, .incorrect').forEach(key => {
                key.classList.remove('highlighted', 'correct', 'incorrect');
            });
            this.isDisabled = false;

            if (this.roundsPlayed >= this.totalRounds) {
                this.finish();
            } else {
                this.askQuestion();
            }
        }, isCorrect ? 900 : 1500);
    }

    updateStats() {
        document.getElementById('correct-count').textContent = this.correctCount;
        document.getElementById('incorrect-count').textContent = this.incorrectCount;
    }

    finish() {
        document.querySelector('.piano').style.display = 'none';
        document.getElementById('answer-buttons').style.visibility = 'hidden';
        document.querySelector('.stats').style.display = 'none';

        const question = document.getElementById('question');
        question.innerHTML = `
            <div class="level-complete">
                <h2>${T('wholeHalf.finishTitle')}</h2>
                <p>${T('wholeHalf.finishScore', { correct: this.correctCount, total: this.totalRounds })}</p>
                <button class="btn btn-primary" id="restart-btn">${T('wholeHalf.restart')}</button>
            </div>
        `;

        document.getElementById('restart-btn').addEventListener('click', () => {
            window.location.reload();
        });
    }

    attachEventListeners() {
        document.getElementById('answer-halvton').addEventListener('click', () => this.handleAnswer('halvton'));
        document.getElementById('answer-helton').addEventListener('click', () => this.handleAnswer('helton'));

        const backBtn = document.getElementById('back-to-hub-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = localUrl('../ovningar.html');
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HalvtonHeltonExercise();
});
