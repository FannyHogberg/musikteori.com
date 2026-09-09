class KvintcirkelnExercise {
    constructor() {
        this.sharpOrder = ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯'];
        this.flatOrder = ['B♭', 'E♭', 'A♭', 'D♭', 'G♭'];

        this.states = [
            { dur: 'C', moll: 'A', type: 'none', count: 0 },
            { dur: 'G', moll: 'E', type: 'sharp', count: 1 },
            { dur: 'D', moll: 'B', type: 'sharp', count: 2 },
            { dur: 'A', moll: 'F♯', type: 'sharp', count: 3 },
            { dur: 'E', moll: 'C♯', type: 'sharp', count: 4 },
            { dur: 'B', moll: 'G♯', type: 'sharp', count: 5 },
            { dur: 'F♯', moll: 'D♯', type: 'sharp', count: 6 },
            { dur: 'F', moll: 'D', type: 'flat', count: 1 },
            { dur: 'B♭', moll: 'G', type: 'flat', count: 2 },
            { dur: 'E♭', moll: 'C', type: 'flat', count: 3 },
            { dur: 'A♭', moll: 'F', type: 'flat', count: 4 },
            { dur: 'D♭', moll: 'B♭', type: 'flat', count: 5 }
        ];

        this.isDisabled = false;
        this.deck = [];
        this.lastState = null;
        this.hintShown = false;

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

    drawState() {
        if (this.deck.length === 0) {
            this.deck = this.shuffle(this.states);
            if (this.lastState && this.deck[0] === this.lastState && this.deck.length > 1) {
                [this.deck[0], this.deck[1]] = [this.deck[1], this.deck[0]];
            }
        }

        const state = this.deck.shift();
        this.lastState = state;
        return state;
    }

    renderStaff(state) {
        const sharpImages = document.querySelectorAll('.ex-sharp');
        const flatImages = document.querySelectorAll('.ex-flat');

        sharpImages.forEach((img, i) => {
            img.style.display = (state.type === 'sharp' && i < state.count) ? '' : 'none';
        });
        flatImages.forEach((img, i) => {
            img.style.display = (state.type === 'flat' && i < state.count) ? '' : 'none';
        });
    }

    buildOptions(askType) {
        const names = this.states.map(s => (askType === 'dur' ? s.dur : s.moll));
        return this.shuffle(names);
    }

    startRound() {
        this.currentState = this.drawState();
        this.currentAskType = Math.random() < 0.5 ? 'dur' : 'moll';
        this.correctName = this.currentAskType === 'dur' ? this.currentState.dur : this.currentState.moll;

        this.renderStaff(this.currentState);

        const suffix = this.currentAskType === 'dur' ? 'durtonart' : 'molltonart';
        document.getElementById('question').textContent = `Vilken ${suffix} har dessa fasta förtecken?`;

        const options = this.buildOptions(this.currentAskType);
        const buttonsContainer = document.getElementById('answer-buttons');
        buttonsContainer.innerHTML = '';

        const optionSuffix = this.currentAskType === 'dur' ? '-dur' : '-moll';
        options.forEach(name => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'note-button';
            button.dataset.answer = name;
            button.textContent = `${name}${optionSuffix}`;
            button.addEventListener('click', () => this.handleAnswer(name, button));
            buttonsContainer.appendChild(button);
        });
    }

    handleAnswer(guess, guessedButton) {
        if (this.isDisabled) return;
        this.isDisabled = true;

        document.querySelectorAll('#answer-buttons .note-button').forEach(btn => {
            btn.classList.remove('correct', 'incorrect');
        });

        const isCorrect = guess === this.correctName;
        const optionSuffix = this.currentAskType === 'dur' ? '-dur' : '-moll';
        const feedbackMessage = document.getElementById('feedback-message');
        feedbackMessage.classList.remove('show-correct', 'show-incorrect');
        void feedbackMessage.offsetWidth;

        if (isCorrect) {
            feedbackMessage.textContent = '✓ Rätt!';
            feedbackMessage.classList.add('show-correct');
            guessedButton.classList.add('correct');
        } else {
            feedbackMessage.textContent = `Inte riktigt. Rätt svar var ${this.correctName}${optionSuffix}. Försök igen.`;
            feedbackMessage.classList.add('show-incorrect');
            guessedButton.classList.add('incorrect');
        }

        if (isCorrect) {
            setTimeout(() => {
                feedbackMessage.textContent = '';
                feedbackMessage.classList.remove('show-correct');
                guessedButton.classList.remove('correct');
                this.isDisabled = false;
                this.startRound();
            }, 900);
        } else {
            setTimeout(() => {
                this.isDisabled = false;
            }, 350);
        }
    }

    attachEventListeners() {
        const backBtn = document.getElementById('back-to-hub-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = '../ovningar.html';
            });
        }

        const hintBtn = document.getElementById('hint-toggle-btn');
        const hintText = document.getElementById('hint-toggle-text');
        const hintCircle = document.getElementById('hint-circle');
        hintBtn.addEventListener('click', () => {
            this.hintShown = !this.hintShown;
            hintBtn.setAttribute('aria-expanded', String(this.hintShown));
            hintCircle.classList.toggle('is-revealed', this.hintShown);
            hintText.textContent = this.hintShown ? '🙈 Dölj kvintcirkeln' : '💡 Visa kvintcirkeln';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new KvintcirkelnExercise();
});
