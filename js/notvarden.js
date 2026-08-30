/**
 * NotvardenAudio - Web Audio API-klass for notvärden-lektionen.
 * Hanterar uppspelning av notvärden med metronomklick och visuell pulssynk.
 * Auto-initialiseras via data-attribut.
 */
class NotvardenAudio {
    constructor() {
        this.audioCtx = null;
        this.playbackId = 0;
        this.activePlayerEl = null;
        this.tempo = 80; // BPM
        this.beatDuration = 60 / this.tempo; // sekunder per slag
        this.toneFreq = 392.00; // G4
        this.clickFreq = 1000;
        this.timeouts = [];
        this.scheduledNodes = []; // spårar alla oscillatorer/gains för stopp
    }

    ensureContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    stop() {
        this.playbackId++;
        this.timeouts.forEach(id => clearTimeout(id));
        this.timeouts = [];
        // Stoppa alla schemalagda audio-noder
        this.scheduledNodes.forEach(node => {
            try { node.stop(0); } catch (e) { /* redan stoppad */ }
            try { node.disconnect(); } catch (e) {}
        });
        this.scheduledNodes = [];
        if (this.activePlayerEl) {
            this.activePlayerEl.querySelectorAll('.beat').forEach(b => b.classList.remove('beat-active'));
            const btn = this.activePlayerEl.querySelector('.notvarden-play-btn');
            if (btn) {
                btn.textContent = btn.dataset.label || 'Lyssna';
                btn.classList.remove('playing');
            }
            this.activePlayerEl = null;
        }
    }

    scheduleTimeout(fn, delay, id) {
        const tid = setTimeout(() => {
            if (this.playbackId === id) fn();
        }, delay);
        this.timeouts.push(tid);
    }

    playClick(time, volume) {
        const vol = volume || 0.15;
        const ctx = this.audioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = this.clickFreq;
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.03);
        this.scheduledNodes.push(osc);
    }

    playTone(time, duration) {
        const ctx = this.audioCtx;
        const freq = this.toneFreq;
        const attack = 0.005;
        // Övertoner som ger pianokaraktär: [multipel, volym]
        const partials = [
            [1, 0.4],
            [2, 0.15],
            [3, 0.08],
            [4, 0.03]
        ];
        partials.forEach(([mult, vol]) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq * mult;
            // Snabb attack, jämn volym, kort release
            var release = 0.04;
            gain.gain.setValueAtTime(0.001, time);
            gain.gain.linearRampToValueAtTime(vol, time + attack);
            gain.gain.setValueAtTime(vol, time + duration - release);
            gain.gain.linearRampToValueAtTime(0.001, time + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + duration + 0.01);
            this.scheduledNodes.push(osc);
        });
    }

    /**
     * Spela ett notvärde med inräkning.
     * Fyra inräkningsklick med visuell puls, sedan en takt där tonen spelas på slag 1.
     * tonDuration: varaktighet i slag
     * measureBeats: antal slag i takten (normalt 4)
     */
    playPattern(playerEl, tonDuration, measureBeats) {
        this.stop();
        this.ensureContext();

        measureBeats = measureBeats || 4;
        const countIn = 4;
        const id = this.playbackId;
        this.activePlayerEl = playerEl;

        const btn = playerEl.querySelector('.notvarden-play-btn');
        if (btn) {
            btn.textContent = 'Stopp';
            btn.classList.add('playing');
        }

        const beats = playerEl.querySelectorAll('.beat');
        const ctx = this.audioCtx;
        const now = ctx.currentTime + 0.05;
        const beatSec = this.beatDuration;

        // Inräkning: 4 klick med visuell puls
        for (let i = 0; i < countIn; i++) {
            this.playClick(now + i * beatSec);
            const delayMs = i * beatSec * 1000;
            this.scheduleTimeout(() => {
                beats.forEach(b => b.classList.remove('beat-active'));
                if (beats[i % beats.length]) {
                    beats[i % beats.length].classList.add('beat-active');
                }
            }, delayMs, id);
        }

        // Rensa pulserna mellan inräkning och takt
        this.scheduleTimeout(() => {
            beats.forEach(b => b.classList.remove('beat-active'));
        }, countIn * beatSec * 1000 - 50, id);

        // Takten: klick + visuell puls + ton på slag 1
        const measureStart = now + countIn * beatSec;
        for (let i = 0; i < measureBeats; i++) {
            const time = measureStart + i * beatSec;
            this.playClick(time);

            const delayMs = (countIn + i) * beatSec * 1000;
            this.scheduleTimeout(() => {
                beats.forEach(b => b.classList.remove('beat-active'));
                if (beats[i % beats.length]) {
                    beats[i % beats.length].classList.add('beat-active');
                }
            }, delayMs, id);
        }

        // En ton på slag 1
        const dur = Math.min(tonDuration * beatSec, measureBeats * beatSec);
        this.playTone(measureStart, dur);

        // Stoppa efter takten
        const totalMs = (countIn + measureBeats) * beatSec * 1000 + 100;
        this.scheduleTimeout(() => {
            this.stop();
        }, totalMs, id);
    }

    /**
     * Spela en jämförelsesekvens: array av { pattern, tonDuration, beats } objekt.
     * Visar aktiv rad i jämförelsesektionen.
     */
    playComparison(containerEl, measures) {
        this.stop();
        this.ensureContext();

        const id = this.playbackId;
        const rows = containerEl.querySelectorAll('.comparison-measure');
        const playBtn = containerEl.querySelector('.notvarden-play-btn');
        if (playBtn) {
            playBtn.textContent = 'Stopp';
            playBtn.classList.add('playing');
        }
        this.activePlayerEl = containerEl;

        const ctx = this.audioCtx;
        const now = ctx.currentTime + 0.05;
        const beatSec = this.beatDuration;
        let beatOffset = 0;

        measures.forEach((measure, mIdx) => {
            const beats = rows[mIdx] ? rows[mIdx].querySelectorAll('.beat') : [];

            // Markera aktiv rad
            this.scheduleTimeout(() => {
                rows.forEach(r => r.classList.remove('comparison-active'));
                if (rows[mIdx]) rows[mIdx].classList.add('comparison-active');
            }, beatOffset * beatSec * 1000, id);

            for (let i = 0; i < measure.beats; i++) {
                const globalBeat = beatOffset + i;
                const time = now + globalBeat * beatSec;
                const vol = (measure.accentFirst && i === 0) ? 0.35 : 0.15;
                this.playClick(time, vol);

                this.scheduleTimeout(() => {
                    beats.forEach(b => b.classList.remove('beat-active'));
                    if (beats[i]) beats[i].classList.add('beat-active');
                }, globalBeat * beatSec * 1000, id);
            }

            measure.pattern.forEach(startBeat => {
                const time = now + (beatOffset + startBeat) * beatSec;
                const dur = Math.min(measure.tonDuration * beatSec, (measure.beats - startBeat) * beatSec);
                this.playTone(time, dur);
            });

            beatOffset += measure.beats;
        });

        const totalMs = beatOffset * beatSec * 1000 + 100;
        this.scheduleTimeout(() => {
            rows.forEach(r => r.classList.remove('comparison-active'));
            this.stop();
        }, totalMs, id);
    }

    // --- Initialisering ---

    initPlayers() {
        document.querySelectorAll('[data-notvarden-player]').forEach(el => {
            const type = el.dataset.notvardenPlayer;
            // Varaktighet i slag for varje notvärde
            const durations = {
                'fjardedelsnot': { dur: 0.9, beats: 4 },
                'halvnot': { dur: 1.9, beats: 4 },
                'helnot': { dur: 3.9, beats: 4 },
                'attondelsnot': { dur: 0.45, beats: 4 },
                'sextondelsnot': { dur: 0.2, beats: 4 }
            };
            const p = durations[type];
            if (!p) return;

            const btn = el.querySelector('.notvarden-play-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    if (this.activePlayerEl === el) {
                        this.stop();
                    } else {
                        this.playPattern(el, p.dur, p.beats);
                    }
                });
            }
        });
    }

    initComparisons() {
        document.querySelectorAll('[data-notvarden-comparison]').forEach(el => {
            const type = el.dataset.notvardenComparison;

            let measures;
            if (type === 'langsam') {
                measures = [
                    { pattern: [0, 1, 2, 3], tonDuration: 0.9, beats: 4 },
                    { pattern: [0, 2], tonDuration: 1.9, beats: 4 },
                    { pattern: [0], tonDuration: 3.9, beats: 4 }
                ];
            } else if (type === 'snabb') {
                measures = [
                    { pattern: [0, 1, 2, 3], tonDuration: 0.9, beats: 4 },
                    { pattern: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], tonDuration: 0.4, beats: 4 },
                    { pattern: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75], tonDuration: 0.2, beats: 4 }
                ];
            } else if (type === 'paus-1') {
                measures = [
                    { pattern: [0, 1, 2, 3], tonDuration: 0.9, beats: 4 },
                    { pattern: [0, 1, 2], tonDuration: 0.9, beats: 4 }
                ];
            } else if (type === 'paus-2') {
                measures = [
                    { pattern: [0, 1, 2, 3], tonDuration: 0.9, beats: 4 },
                    { pattern: [0, 1, 3], tonDuration: 0.9, beats: 4 }
                ];
            } else if (type === 'takt-44') {
                measures = [
                    { pattern: [], tonDuration: 0, beats: 4, accentFirst: true },
                    { pattern: [], tonDuration: 0, beats: 4, accentFirst: true }
                ];
            } else if (type === 'takt-34') {
                measures = [
                    { pattern: [], tonDuration: 0, beats: 3, accentFirst: true },
                    { pattern: [], tonDuration: 0, beats: 3, accentFirst: true }
                ];
            }

            if (!measures) return;

            const btn = el.querySelector('.notvarden-play-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    if (this.activePlayerEl === el) {
                        this.stop();
                    } else {
                        this.playComparison(el, measures);
                    }
                });
            }
        });
    }

    init() {
        this.initPlayers();
        this.initComparisons();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const nva = new NotvardenAudio();
    nva.init();
});
