class Quiz {
    constructor(containerElement, quizName) {
        this.container = containerElement;
        this.quizName = quizName;
        this.nextUrl = containerElement.dataset.nextUrl || null;
        this.quizListUrl = containerElement.dataset.quizListUrl || null;
        this.quizData = null;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.score = 0;
        this.audio = null;

        this.init();
    }

    async init() {
        await this.loadQuizData();
        this.render();
    }

    async loadQuizData() {
        try {
            // Get the current page path to calculate relative path
            const currentPath = window.location.pathname;
            const pathDepth = currentPath.split('/').filter(p => p).length - 1;
            const relativePath = '../'.repeat(pathDepth);
            const langFolder = LANG === 'en' ? 'en/' : '';
            const url = `${relativePath}data/quiz/${langFolder}${this.quizName}.json`;

            console.log('Current path:', currentPath);
            console.log('Loading quiz from:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.quizData = await response.json();
            console.log('Quiz data loaded:', this.quizData);

            // If randomQuestions is set, select a random subset
            if (this.quizData.randomQuestions && this.quizData.randomQuestions < this.quizData.questions.length) {
                this.quizData.questions = this.selectRandomQuestions(
                    this.quizData.questions,
                    this.quizData.randomQuestions
                );
            }

            // Initialize answers array
            this.answers = new Array(this.quizData.questions.length).fill(null);
        } catch (error) {
            console.error('Failed to load quiz:', error);
            this.container.innerHTML = `
                <div class="error" style="padding: 2rem; text-align: center;">
                    <h3>${T('quiz.loadError.title')}</h3>
                    <p>${error.message}</p>
                    <p style="font-size: 0.9rem; color: #666;">${T('quiz.loadError.detail')}</p>
                </div>
            `;
        }
    }

    selectRandomQuestions(questions, count) {
        const shuffle = (arr) => {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        };

        // Garantera att lyssningsfrågor (audio) alltid representeras
        const audioQuestions = questions.filter(q => q.audio);
        const otherQuestions = questions.filter(q => !q.audio);

        if (audioQuestions.length > 0 && count > 1) {
            const shuffledAudio = shuffle(audioQuestions);
            const shuffledOther = shuffle(otherQuestions);
            const audioCount = Math.min(shuffledAudio.length, Math.max(1, Math.floor(count * audioQuestions.length / questions.length)));
            const selected = [
                ...shuffledAudio.slice(0, audioCount),
                ...shuffledOther.slice(0, count - audioCount)
            ];
            return shuffle(selected);
        }

        return shuffle(questions).slice(0, count);
    }

    render() {
        if (!this.quizData) return;

        if (this.audio) {
            this.audio.stop();
        }

        this.container.innerHTML = `
            <div class="quiz-header">
                <h2>${this.quizData.title}</h2>
                <p class="quiz-description">${this.quizData.description || ''}</p>
                <div class="quiz-progress">
                    ${T('quiz.progress', {current: this.currentQuestionIndex + 1, total: this.quizData.questions.length})}
                </div>
            </div>
            <div class="quiz-body">
                ${this.renderQuestion()}
            </div>
        `;

        this.attachEventListeners();
    }

    renderQuestion() {
        const question = this.quizData.questions[this.currentQuestionIndex];
        const isMultipleChoice = question.type === 'multiple-choice';
        const hasAnswer = this.hasAnswer();

        return `
            <div class="question-container">
                <h3 class="question-text">
                    ${question.question}
                    ${isMultipleChoice ? '<span style="font-weight: normal; font-size: 0.9em; color: #666;"> ' + T('quiz.multipleChoice') + '</span>' : ''}
                </h3>
                ${question.image ? `<div class="question-image"><img src="${question.image}" alt="${T('quiz.questionImage')}"></div>` : ''}
                ${question.audio ? `
                <div class="quiz-audio-player notvarden-player" data-quiz-audio="${question.audio}">
                    <button class="notvarden-play-btn" type="button" data-label="${T('quiz.listen')}">${T('quiz.listen')}</button>
                    <div class="pulse-counter">
                        <div class="beat">1</div>
                        <div class="beat">2</div>
                        <div class="beat">3</div>
                        <div class="beat">4</div>
                    </div>
                </div>
                ` : ''}

                <div class="options-container ${this.hasImages(question.options) ? 'image-options' : ''}">
                    ${question.options.map((option, index) => this.renderOption(option, index, isMultipleChoice)).join('')}
                </div>

                <div class="quiz-actions">
                    ${this.currentQuestionIndex > 0 ? '<button class="btn quiz-btn-prev">' + T('quiz.previous') + '</button>' : ''}
                    ${this.currentQuestionIndex < this.quizData.questions.length - 1
                        ? `<button class="btn btn-primary quiz-btn-next" ${!hasAnswer ? 'disabled' : ''}>${T('quiz.next')}</button>`
                        : `<button class="btn btn-primary quiz-btn-finish" ${!hasAnswer ? 'disabled' : ''}>${T('quiz.finish')}</button>`}
                </div>
            </div>
        `;
    }

    hasImages(options) {
        return options.some(opt => opt.image);
    }

    hasAnswer() {
        const answer = this.answers[this.currentQuestionIndex];
        const question = this.quizData.questions[this.currentQuestionIndex];

        if (question.type === 'multiple-choice') {
            return Array.isArray(answer) && answer.length > 0;
        } else {
            return answer !== null;
        }
    }

    renderOption(option, index, isMultipleChoice) {
        const inputType = isMultipleChoice ? 'checkbox' : 'radio';
        const inputName = isMultipleChoice ? `question-${this.currentQuestionIndex}-${index}` : `question-${this.currentQuestionIndex}`;
        const savedAnswer = this.answers[this.currentQuestionIndex];

        let isChecked = false;
        if (isMultipleChoice && Array.isArray(savedAnswer)) {
            isChecked = savedAnswer.includes(index);
        } else if (!isMultipleChoice) {
            isChecked = savedAnswer === index;
        }

        return `
            <label class="option-label">
                <input
                    type="${inputType}"
                    name="${inputName}"
                    value="${index}"
                    ${isChecked ? 'checked' : ''}
                >
                <div class="option-content">
                    ${option.image ? `<img src="${option.image}" alt="${option.alt || T('quiz.optionAlt', {n: index + 1})}">` : ''}
                    ${option.text ? `<span class="option-text">${option.text}</span>` : ''}
                </div>
            </label>
        `;
    }

    attachEventListeners() {
        // Next button
        const nextBtn = this.container.querySelector('.quiz-btn-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        // Previous button
        const prevBtn = this.container.querySelector('.quiz-btn-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousQuestion());
        }

        // Finish button
        const finishBtn = this.container.querySelector('.quiz-btn-finish');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => this.finishQuiz());
        }

        // Audio player
        const audioPlayer = this.container.querySelector('.quiz-audio-player');
        if (audioPlayer) {
            const audioType = audioPlayer.dataset.quizAudio;
            const durations = {
                'fjardedelsnot': { dur: 0.9, beats: 4 },
                'halvnot': { dur: 1.9, beats: 4 },
                'helnot': { dur: 3.9, beats: 4 },
                'attondelsnot': { dur: 0.45, beats: 4 },
                'sextondelsnot': { dur: 0.2, beats: 4 }
            };
            const p = durations[audioType];
            if (p && typeof NotvardenAudio !== 'undefined') {
                if (!this.audio) {
                    this.audio = new NotvardenAudio();
                }
                const btn = audioPlayer.querySelector('.notvarden-play-btn');
                btn.addEventListener('click', () => {
                    if (this.audio.activePlayerEl === audioPlayer) {
                        this.audio.stop();
                    } else {
                        this.audio.playPattern(audioPlayer, p.dur, p.beats);
                    }
                });
            }
        }

        // Save answers when options are selected
        const options = this.container.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        options.forEach(option => {
            option.addEventListener('change', () => this.saveAnswer());
        });
    }

    saveAnswer() {
        const question = this.quizData.questions[this.currentQuestionIndex];
        const isMultipleChoice = question.type === 'multiple-choice';

        if (isMultipleChoice) {
            const checked = this.container.querySelectorAll('input[type="checkbox"]:checked');
            this.answers[this.currentQuestionIndex] = Array.from(checked).map(input => parseInt(input.value));
        } else {
            const selected = this.container.querySelector('input[type="radio"]:checked');
            this.answers[this.currentQuestionIndex] = selected ? parseInt(selected.value) : null;
        }

        // Enable/disable next/finish button based on whether an answer is selected
        const nextBtn = this.container.querySelector('.quiz-btn-next');
        const finishBtn = this.container.querySelector('.quiz-btn-finish');
        const hasAnswer = this.hasAnswer();

        if (nextBtn) {
            nextBtn.disabled = !hasAnswer;
        }
        if (finishBtn) {
            finishBtn.disabled = !hasAnswer;
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.quizData.questions.length - 1) {
            this.currentQuestionIndex++;
            this.render();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.render();
        }
    }

    finishQuiz() {
        this.calculateScore();
        this.showResults();
    }

    calculateScore() {
        this.score = 0;

        this.quizData.questions.forEach((question, index) => {
            const userAnswer = this.answers[index];

            if (question.type === 'multiple-choice') {
                // For multiple choice, all correct answers must be selected
                const correctIndexes = question.options
                    .map((opt, idx) => opt.correct ? idx : null)
                    .filter(idx => idx !== null);

                if (Array.isArray(userAnswer) &&
                    userAnswer.length === correctIndexes.length &&
                    userAnswer.every(ans => correctIndexes.includes(ans))) {
                    this.score++;
                }
            } else {
                // For single choice
                if (userAnswer !== null && question.options[userAnswer].correct) {
                    this.score++;
                }
            }
        });
    }

    showResults() {
        const percentage = Math.round((this.score / this.quizData.questions.length) * 100);
        const passed = percentage >= this.quizData.passingScore;

        this.container.innerHTML = `
            <div class="quiz-results">
                <h2>${T('quiz.results')}</h2>
                <div class="score-display ${passed ? 'passed' : 'failed'}">
                    <div class="score-number">${this.score} / ${this.quizData.questions.length}</div>
                    <div class="score-percentage">${percentage}%</div>
                </div>
                <p class="result-message">
                    ${passed
                        ? T('quiz.passed')
                        : T('quiz.failed', {score: this.quizData.passingScore})}
                </p>
                <div class="quiz-actions">
                    <button class="btn quiz-btn-review">${T('quiz.reviewBtn')}</button>
                    <button class="btn quiz-btn-retry">${T('quiz.retryBtn')}</button>
                    ${this.nextUrl ? `<a href="${this.nextUrl}" class="btn btn-primary">${T('quiz.continueNext')}</a>` : ''}
                    ${this.quizListUrl ? `<a href="${this.quizListUrl}" class="btn btn-primary">${T('quiz.tryAnother')}</a>` : ''}
                </div>
            </div>
        `;

        // Attach result buttons
        this.container.querySelector('.quiz-btn-retry').addEventListener('click', async () => {
            // Reload quiz data to get new random questions
            await this.loadQuizData();
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.render();
        });

        this.container.querySelector('.quiz-btn-review').addEventListener('click', () => {
            this.showReview();
        });
    }

    showReview() {
        const reviewHTML = this.quizData.questions.map((question, qIndex) => {
            const userAnswer = this.answers[qIndex];
            const isMultipleChoice = question.type === 'multiple-choice';

            let isCorrect = false;
            if (isMultipleChoice) {
                const correctIndexes = question.options
                    .map((opt, idx) => opt.correct ? idx : null)
                    .filter(idx => idx !== null);
                isCorrect = Array.isArray(userAnswer) &&
                    userAnswer.length === correctIndexes.length &&
                    userAnswer.every(ans => correctIndexes.includes(ans));
            } else {
                isCorrect = userAnswer !== null && question.options[userAnswer].correct;
            }

            return `
                <div class="review-question ${isCorrect ? 'correct' : 'incorrect'}">
                    <h3>${T('quiz.questionN', {n: qIndex + 1})}: ${question.question}</h3>
                    ${question.image ? `<img src="${question.image}" alt="${T('quiz.questionImage')}" class="review-image">` : ''}
                    <div class="review-options">
                        ${question.options.map((opt, optIndex) => {
                            const wasSelected = isMultipleChoice
                                ? (Array.isArray(userAnswer) && userAnswer.includes(optIndex))
                                : userAnswer === optIndex;

                            return `
                                <div class="review-option ${opt.correct ? 'is-correct' : ''} ${wasSelected ? 'was-selected' : ''}">
                                    ${opt.image ? `<img src="${opt.image}" alt="${opt.alt || ''}">` : ''}
                                    ${opt.text ? `<span>${opt.text}</span>` : ''}
                                    ${opt.correct ? ' ✓' : ''}
                                    ${wasSelected && !opt.correct ? ' ✗' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        this.container.innerHTML = `
            <div class="quiz-review">
                <h2>${T('quiz.reviewTitle')}</h2>
                ${reviewHTML}
                <div class="quiz-actions">
                    <button class="btn btn-primary quiz-btn-retry">${T('quiz.retryBtn')}</button>
                </div>
            </div>
        `;

        this.container.querySelector('.quiz-btn-retry').addEventListener('click', async () => {
            // Reload quiz data to get new random questions
            await this.loadQuizData();
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.render();
        });
    }
}

// Auto-initialize quizzes on page load
document.addEventListener('DOMContentLoaded', () => {
    const quizContainers = document.querySelectorAll('[data-quiz]');
    quizContainers.forEach(container => {
        const quizName = container.dataset.quiz;
        new Quiz(container, quizName);
    });
});
