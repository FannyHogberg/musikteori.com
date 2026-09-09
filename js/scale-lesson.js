/* Spelbart lektionspiano och skalor med Web Audio. */
(() => {
    let context;
    let activeButton;
    let generation = 0;
    const oscillators = new Set();
    const timers = new Set();
    const buttons = document.querySelectorAll('[data-scale]');
    const keys = document.querySelectorAll('[data-midi]');
    const status = document.getElementById('scale-audio-status');

    function stop() {
        generation++;
        timers.forEach(clearTimeout);
        timers.clear();
        oscillators.forEach(osc => { try { osc.stop(); } catch (_) { /* Redan stoppad. */ } });
        oscillators.clear();
        keys.forEach(key => key.classList.remove('is-playing'));
        if (activeButton) {
            activeButton.textContent = activeButton.dataset.label;
            activeButton.style.removeProperty('width');
            activeButton.style.removeProperty('height');
            activeButton.setAttribute('aria-pressed', 'false');
            activeButton = null;
        }
    }

    function later(callback, delay) {
        const timer = setTimeout(() => { timers.delete(timer); callback(); }, delay);
        timers.add(timer);
    }

    function tone(midi, time) {
        const frequency = 440 * 2 ** ((midi - 69) / 12);
        [[1, 0.25], [2, 0.08], [3, 0.03]].forEach(([partial, volume]) => {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.frequency.value = frequency * partial;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(volume, time + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
            osc.connect(gain);
            gain.connect(context.destination);
            oscillators.add(osc);
            osc.onended = () => { oscillators.delete(osc); osc.disconnect(); gain.disconnect(); };
            osc.start(time);
            osc.stop(time + 0.5);
        });
    }

    async function play(notes, button) {
        const togglingOff = button && button === activeButton;
        stop();
        if (togglingOff) return;
        const request = generation;
        if (button) {
            activeButton = button;
            const { width, height } = button.getBoundingClientRect();
            button.style.width = `${width}px`;
            button.style.height = `${height}px`;
            button.textContent = '■\u2002Stoppa';
            button.setAttribute('aria-pressed', 'true');
        }
        try {
            context ||= new (window.AudioContext || window.webkitAudioContext)();
            await context.resume();
            if (request !== generation) return;
            status.textContent = '';
            const start = context.currentTime + 0.03;
            notes.forEach((midi, i) => {
                tone(midi, start + i * 0.55);
                later(() => {
                    keys.forEach(key => key.classList.toggle('is-playing', Number(key.dataset.midi) === midi));
                }, 30 + i * 550);
            });
            later(stop, 30 + notes.length * 550);
        } catch (_) {
            if (request !== generation) return;
            stop();
            status.textContent = 'Ljudet kunde inte startas. Prova att trycka igen eller använd en annan webbläsare.';
        }
    }

    buttons.forEach(button => {
        button.dataset.label = button.textContent;
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => play(button.dataset.scale.split(',').map(Number), button));
    });
    keys.forEach(key => key.addEventListener('click', () => play([Number(key.dataset.midi)])));
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    window.addEventListener('pagehide', stop);
})();
