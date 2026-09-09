/* Utforska tonarter: växlar skalmarkering på notsystemet. Ljud/uppspelning sköts av scale-lesson.js via delade data-midi/data-scale-attribut. */
(() => {
    const LETTER_STEP = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

    function stepFor(letter, octave) {
        return 7 * octave + LETTER_STEP[letter] - 30;
    }

    function yFor(step) {
        return 110 - step * 7.5;
    }

    function ledgerStepsFor(step) {
        if (step > -2) return [];
        const bottom = step % 2 === 0 ? step : step + 1;
        const steps = [];
        for (let s = -2; s >= bottom; s -= 2) steps.push(s);
        return steps;
    }

    const KEYS = {
        'c-dur': {
            label: 'C-dur',
            tonicLabel: 'C är tonika.',
            rest: 'Tonarten använder C, D, E, F, G, A och B.',
            tonicMidis: [60, 72],
            notes: [
                { letter: 'C', octave: 4, midi: 60 },
                { letter: 'D', octave: 4, midi: 62 },
                { letter: 'E', octave: 4, midi: 64 },
                { letter: 'F', octave: 4, midi: 65 },
                { letter: 'G', octave: 4, midi: 67 },
                { letter: 'A', octave: 4, midi: 69 },
                { letter: 'B', octave: 4, midi: 71 },
                { letter: 'C', octave: 5, midi: 72 },
            ],
        },
        'a-moll': {
            label: 'A-moll',
            tonicLabel: 'A är tonika.',
            rest: 'A-moll använder samma toner som C-dur, men A fungerar som centrum.',
            tonicMidis: [57, 69],
            notes: [
                { letter: 'A', octave: 3, midi: 57 },
                { letter: 'B', octave: 3, midi: 59 },
                { letter: 'C', octave: 4, midi: 60 },
                { letter: 'D', octave: 4, midi: 62 },
                { letter: 'E', octave: 4, midi: 64 },
                { letter: 'F', octave: 4, midi: 65 },
                { letter: 'G', octave: 4, midi: 67 },
                { letter: 'A', octave: 4, midi: 69 },
            ],
        },
        'g-dur': {
            label: 'G-dur',
            tonicLabel: 'G är tonika.',
            rest: 'G-dur innehåller F♯ i stället för F.',
            tonicMidis: [67, 79],
            notes: [
                { letter: 'G', octave: 4, midi: 67 },
                { letter: 'A', octave: 4, midi: 69 },
                { letter: 'B', octave: 4, midi: 71 },
                { letter: 'C', octave: 5, midi: 72 },
                { letter: 'D', octave: 5, midi: 74 },
                { letter: 'E', octave: 5, midi: 76 },
                { letter: 'F', octave: 5, midi: 78, sharp: true },
                { letter: 'G', octave: 5, midi: 79 },
            ],
        },
    };

    const explorer = document.querySelector('[data-key-explorer]');
    if (!explorer) return;

    const tabs = explorer.querySelectorAll('.key-tab');
    const description = explorer.querySelector('[data-key-description]');
    const playButton = explorer.querySelector('[data-key-play]');
    const noteSlots = explorer.querySelectorAll('.key-explorer-note');

    function applyKey(id) {
        const key = KEYS[id];
        if (!key) return;

        tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.key === id)));
        description.innerHTML = `<span class="key-explorer-tonic-label">${key.tonicLabel}</span> ${key.rest}`;

        noteSlots.forEach((slot, i) => {
            const note = key.notes[i];
            const notehead = slot.querySelector('.key-explorer-notehead');
            const sharp = slot.querySelector('.key-explorer-sharp');
            const ledgers = slot.querySelectorAll('.key-explorer-ledger');
            const step = stepFor(note.letter, note.octave);
            const y = yFor(step);

            notehead.setAttribute('cy', y);
            notehead.dataset.midi = String(note.midi);
            notehead.classList.toggle('is-tonika', key.tonicMidis.includes(note.midi));

            sharp.setAttribute('y', y - 17.45);
            sharp.style.display = note.sharp ? '' : 'none';

            const ledgerSteps = ledgerStepsFor(step);
            ledgers.forEach((line, li) => {
                if (li < ledgerSteps.length) {
                    const ly = yFor(ledgerSteps[li]);
                    line.setAttribute('y1', ly);
                    line.setAttribute('y2', ly);
                    line.style.display = '';
                } else {
                    line.style.display = 'none';
                }
            });
        });

        playButton.dataset.scale = key.notes.map(n => n.midi).join(',');
        const label = `▶ Spela ${key.label}`;
        playButton.textContent = label;
        playButton.dataset.label = label;
        playButton.setAttribute('aria-pressed', 'false');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => applyKey(tab.dataset.key));
    });

    applyKey('c-dur');
})();
