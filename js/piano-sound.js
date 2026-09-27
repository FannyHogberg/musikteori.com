/* Enkelt pianoljud (Web Audio) som spelas när man klickar en tangent i övningar och prov. */
const PianoSound = (() => {
    let context;
    const MUTE_KEY = 'pianoSoundMuted';
    let muted;
    try {
        muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch (_) {
        muted = false;
    }

    const OCTAVE_BASE_MIDI = {
        stora: 36,
        lilla: 48,
        ettstrukna: 60,
        tvastrukna: 72
    };

    const NOTE_OFFSET = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

    const ICON_ON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><polygon points="3,9 3,15 8,15 13,20 13,4 8,9" fill="currentColor"/><path d="M16 8a5 5 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    const ICON_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><polygon points="3,9 3,15 8,15 13,20 13,4 8,9" fill="currentColor"/><line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

    function parseNote(note) {
        const [notePart, octaveId] = note.split('-');
        const letter = notePart[0].toUpperCase();
        const accidental = notePart.includes('#') ? '#' : (notePart.includes('b') ? 'b' : '');
        return { letter, accidental, octaveId };
    }

    function midiFor(note, fallbackOctaveId) {
        const parsed = parseNote(note);
        const octaveId = parsed.octaveId || fallbackOctaveId || 'ettstrukna';
        const base = OCTAVE_BASE_MIDI[octaveId] ?? OCTAVE_BASE_MIDI.ettstrukna;
        let offset = NOTE_OFFSET[parsed.letter] ?? 0;
        if (parsed.accidental === '#') offset += 1;
        if (parsed.accidental === 'b') offset -= 1;
        return base + offset;
    }

    function ensureContext() {
        try {
            context ||= new (window.AudioContext || window.webkitAudioContext)();
        } catch (_) {
            return null;
        }
        return context;
    }

    function wake() {
        const ctx = ensureContext();
        if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    }

    // Väck AudioContexten redan vid pointerdown (innan klicket hinner fram) så att
    // den hunnit bli klar innan play() faktiskt ska spela upp en ton.
    document.addEventListener('pointerdown', wake, { passive: true });
    document.addEventListener('keydown', wake);

    function scheduleTone(ctx, midi) {
        const frequency = 440 * 2 ** ((midi - 69) / 12);
        const time = ctx.currentTime + 0.005;
        [[1, 0.25], [2, 0.08], [3, 0.03]].forEach(([partial, volume]) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = frequency * partial;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(volume, time + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.onended = () => { osc.disconnect(); gain.disconnect(); };
            osc.start(time);
            osc.stop(time + 0.5);
        });
    }

    function tone(midi) {
        const ctx = ensureContext();
        if (!ctx) return;
        if (ctx.state === 'running') {
            // Redan igång (normalfallet, tack vare wake() på pointerdown) - spela direkt, ingen väntan.
            scheduleTone(ctx, midi);
        } else {
            // Undantagsfallet: hann inte bli klar i tid, invänta resume() och schemalägg mot färsk currentTime.
            ctx.resume().then(() => scheduleTone(ctx, midi)).catch(() => {});
        }
    }

    function play(note, fallbackOctaveId) {
        if (muted) return;
        tone(midiFor(note, fallbackOctaveId));
    }

    function updateToggleButtons() {
        const isEn = typeof LANG !== 'undefined' && LANG === 'en';
        const label = muted
            ? (isEn ? 'Turn on sound' : 'Sätt på ljud')
            : (isEn ? 'Turn off sound' : 'Stäng av ljud');
        document.querySelectorAll('[data-sound-toggle]').forEach(btn => {
            btn.innerHTML = muted ? ICON_OFF : ICON_ON;
            btn.title = label;
            btn.setAttribute('aria-label', label);
            btn.setAttribute('aria-pressed', String(muted));
        });
    }

    function setMuted(value) {
        muted = value;
        try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (_) { /* Ingen localStorage tillgänglig. */ }
        updateToggleButtons();
    }

    function initToggleButtons() {
        document.querySelectorAll('[data-sound-toggle]').forEach(btn => {
            btn.addEventListener('click', () => setMuted(!muted));
        });
        updateToggleButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToggleButtons);
    } else {
        initToggleButtons();
    }

    return { play, isMuted: () => muted, setMuted };
})();
