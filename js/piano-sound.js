/* Enkelt pianoljud (Web Audio) som spelas när man klickar en tangent i övningar och prov. */
const PianoSound = (() => {
    let context;

    const OCTAVE_BASE_MIDI = {
        stora: 36,
        lilla: 48,
        ettstrukna: 60,
        tvastrukna: 72
    };

    const NOTE_OFFSET = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

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

    function tone(midi) {
        try {
            context ||= new (window.AudioContext || window.webkitAudioContext)();
            if (context.state === 'suspended') context.resume();
        } catch (_) {
            return;
        }
        const frequency = 440 * 2 ** ((midi - 69) / 12);
        const time = context.currentTime + 0.005;
        [[1, 0.25], [2, 0.08], [3, 0.03]].forEach(([partial, volume]) => {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.frequency.value = frequency * partial;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(volume, time + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
            osc.connect(gain);
            gain.connect(context.destination);
            osc.onended = () => { osc.disconnect(); gain.disconnect(); };
            osc.start(time);
            osc.stop(time + 0.5);
        });
    }

    function play(note, fallbackOctaveId) {
        tone(midiFor(note, fallbackOctaveId));
    }

    return { play };
})();
