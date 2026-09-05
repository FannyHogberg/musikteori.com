/**
 * Internationalization (i18n) support for Musikteori.com
 * Detects language from URL path (/en/ = English, otherwise Swedish)
 * Provides T() for string translation and localUrl() for URL mapping.
 * Must be loaded BEFORE other JS files.
 */

const LANG = window.location.pathname.startsWith('/en/') ? 'en' : 'sv';

const _translations = {

    // =====================
    // quiz.js
    // =====================
    'quiz.loadError.title': {
        sv: 'Kunde inte ladda quiz',
        en: 'Could not load quiz'
    },
    'quiz.loadError.detail': {
        sv: 'Försök att ladda om sidan eller kontrollera konsolen för mer information.',
        en: 'Try reloading the page or check the console for more information.'
    },
    'quiz.progress': {
        sv: 'Fråga {current} av {total}',
        en: 'Question {current} of {total}'
    },
    'quiz.multipleChoice': {
        sv: '(du kan välja flera alternativ)',
        en: '(you can select multiple options)'
    },
    'quiz.questionImage': {
        sv: 'Frågebild',
        en: 'Question image'
    },
    'quiz.listen': {
        sv: 'Lyssna',
        en: 'Listen'
    },
    'quiz.optionAlt': {
        sv: 'Alternativ {n}',
        en: 'Option {n}'
    },
    'quiz.previous': {
        sv: 'Föregående',
        en: 'Previous'
    },
    'quiz.next': {
        sv: 'Nästa',
        en: 'Next'
    },
    'quiz.finish': {
        sv: 'Avsluta',
        en: 'Finish'
    },
    'quiz.results': {
        sv: 'Resultat',
        en: 'Results'
    },
    'quiz.passed': {
        sv: '🎉 Grattis! Du klarade provet!',
        en: '🎉 Congratulations! You passed the test!'
    },
    'quiz.failed': {
        sv: 'Du behöver minst {score}% för att klara provet. Försök igen!',
        en: 'You need at least {score}% to pass the test. Try again!'
    },
    'quiz.reviewBtn': {
        sv: 'Granska svar',
        en: 'Review answers'
    },
    'quiz.retryBtn': {
        sv: 'Försök igen',
        en: 'Try again'
    },
    'quiz.continueNext': {
        sv: 'Fortsätt till nästa avsnitt',
        en: 'Continue to next section'
    },
    'quiz.tryAnother': {
        sv: 'Prova ett annat quiz',
        en: 'Try another quiz'
    },
    'quiz.reviewTitle': {
        sv: 'Granska dina svar',
        en: 'Review your answers'
    },
    'quiz.questionN': {
        sv: 'Fråga {n}',
        en: 'Question {n}'
    },

    // =====================
    // Common feedback
    // =====================
    'feedback.correct': {
        sv: '✓ Rätt!',
        en: '✓ Correct!'
    },
    'feedback.incorrect': {
        sv: '✗ Fel!',
        en: '✗ Wrong!'
    },
    'feedback.incorrectAnswer': {
        sv: '✗ Fel! Rätt svar är {note}',
        en: '✗ Wrong! The correct answer is {note}'
    },

    // =====================
    // Piano exercise questions
    // =====================
    'piano.findKey': {
        sv: 'Var är {note}?',
        en: 'Where is {note}?'
    },
    'piano.findKeyPronunciation': {
        sv: 'Var är {note} ({pronunciation})?',
        en: 'Where is {note}?'
    },
    'piano.nameKey': {
        sv: 'Vilken ton är markerad på pianot?',
        en: 'Which note is highlighted on the piano?'
    },

    // =====================
    // piano-tangenter-ova.js - Sections & levels
    // =====================
    'section.1': {
        sv: 'Del 1: Stamtoner',
        en: 'Part 1: Natural Notes'
    },
    'section.2': {
        sv: 'Del 2: Korsförtecken',
        en: 'Part 2: Sharps'
    },
    'section.3': {
        sv: 'Del 3: B-förtecken',
        en: 'Part 3: Flats'
    },
    'section.4': {
        sv: 'Del 4: Alla toner',
        en: 'Part 4: All Notes'
    },
    'level.withHelp': {
        sv: '(med hjälptext)',
        en: '(with labels)'
    },
    'level.withoutHelp': {
        sv: '(utan hjälptext)',
        en: '(without labels)'
    },
    'level.n': {
        sv: 'Nivå {n}',
        en: 'Level {n}'
    },

    // Level descriptions
    'desc.cde': {
        sv: 'C, D och E',
        en: 'C, D and E'
    },
    'desc.fgab': {
        sv: 'F, G, A och B',
        en: 'F, G, A and B'
    },
    'desc.gab': {
        sv: 'G, A och B',
        en: 'G, A and B'
    },
    'desc.allNatural': {
        sv: 'Alla stamtoner',
        en: 'All natural notes'
    },
    'desc.sharps': {
        sv: 'Korsförtecken',
        en: 'Sharps'
    },
    'desc.flats': {
        sv: 'B-förtecken',
        en: 'Flats'
    },
    'desc.naturalAndSharps': {
        sv: 'Stamtoner och korsförtecken',
        en: 'Natural notes and sharps'
    },
    'desc.naturalAndFlats': {
        sv: 'Stamtoner och b-förtecken',
        en: 'Natural notes and flats'
    },
    'desc.allNotes': {
        sv: 'Alla toner',
        en: 'All notes'
    },
    'desc.allNotesRange': {
        sv: 'Alla toner C-B',
        en: 'All notes C-B'
    },

    // Level completion messages
    'level.wellDone': {
        sv: '🎉 Bra jobbat!',
        en: '🎉 Well done!'
    },
    'level.congrats': {
        sv: '🎊 Grattis!',
        en: '🎊 Congratulations!'
    },
    'level.completedSection': {
        sv: 'Du har klarat alla nivåer i {section}!',
        en: 'You have completed all levels in {section}!'
    },
    'level.readyForTest': {
        sv: 'Redo för provet?',
        en: 'Ready for the test?'
    },
    'level.goToTestNatural': {
        sv: 'Gå till provet - Alla stamtoner →',
        en: 'Go to the test - All Natural Notes →'
    },
    'level.goToTestSharps': {
        sv: 'Gå till provet - Korsförtecken →',
        en: 'Go to the test - Sharps →'
    },
    'level.goToTestFlats': {
        sv: 'Gå till provet - B-förtecken →',
        en: 'Go to the test - Flats →'
    },
    'level.completedThis': {
        sv: 'Du har klarat denna nivå!',
        en: 'You have completed this level!'
    },
    'level.readyForNext': {
        sv: 'Redo för nästa steg?',
        en: 'Ready for the next step?'
    },
    'level.continueTo': {
        sv: 'Fortsätt till {level}',
        en: 'Continue to {level}'
    },
    'level.completedAll': {
        sv: 'Du har klarat alla nivåer!',
        en: 'You have completed all levels!'
    },
    'level.knowAllNotes': {
        sv: 'Nu kan du alla toner på pianot!',
        en: 'Now you know all the notes on the piano!'
    },
    'level.goToTest': {
        sv: 'Gå till provet',
        en: 'Go to the test'
    },

    // =====================
    // piano-oktav.js - Octave names
    // =====================
    'octave.lilla': {
        sv: 'Lilla oktaven',
        en: 'Small octave'
    },
    'octave.ettstrukna': {
        sv: 'Ettstrukna oktaven',
        en: 'One-line octave'
    },
    'octave.tvastrukna': {
        sv: 'Tvåstrukna oktaven',
        en: 'Two-line octave'
    },
    'octave.stora': {
        sv: 'Stora oktaven',
        en: 'Great octave'
    },
    'octave.lillaShort': {
        sv: 'Lilla',
        en: 'Small'
    },
    'octave.ettstruknaShort': {
        sv: 'Ettstrukna',
        en: 'One-line'
    },
    'octave.tvastruknaShort': {
        sv: 'Tvåstrukna',
        en: 'Two-line'
    },
    'exercise.pageTitle': {
        sv: '{name} - Övning {level} - Musikteori.com',
        en: '{name} - Exercise {level} - Musikteori.com'
    },
    'exercise.noteAlt': {
        sv: 'Noten {note}',
        en: 'The note {note}'
    },
    'exercise.noteAltGeneric': {
        sv: 'Not att hitta',
        en: 'Note to find'
    },
    'exercise.completedN': {
        sv: 'Du har klarat övning {level}!',
        en: 'You have completed exercise {level}!'
    },
    'exercise.continueTo': {
        sv: 'Fortsätt till övning {level}',
        en: 'Continue to exercise {level}'
    },
    'exercise.completedAllFor': {
        sv: 'Du har klarat alla övningar för {name}!',
        en: 'You have completed all exercises for the {name}!'
    },
    'exercise.canReadNotes': {
        sv: 'Nu kan du läsa noter i {name}!',
        en: 'Now you can read notes in the {name}!'
    },

    // =====================
    // Test/prov common
    // =====================
    'test.pageTitle': {
        sv: 'Prov - {name} - Musikteori.com',
        en: 'Test - {name} - Musikteori.com'
    },
    'test.title': {
        sv: 'Prov - {name}',
        en: 'Test - {name}'
    },
    'test.confirmAbort': {
        sv: 'Är du säker på att du vill avbryta provet?',
        en: 'Are you sure you want to abort the test?'
    },
    'test.confirmRestart': {
        sv: 'Är du säker på att du vill börja om från början?',
        en: 'Are you sure you want to start over?'
    },
    'test.completed': {
        sv: 'Provet slutfört!',
        en: 'Test completed!'
    },
    'test.passed': {
        sv: '🎉 Grattis! Du är godkänd!',
        en: '🎉 Congratulations! You passed!'
    },
    'test.failed': {
        sv: 'Tyvärr blev du inte godkänd. Du behöver minst {required} rätt av {total}.',
        en: 'Unfortunately, you did not pass. You need at least {required} correct out of {total}.'
    },
    'test.continueBtn': {
        sv: 'Fortsätt öva →',
        en: 'Continue practicing →'
    },
    'test.retakeBtn': {
        sv: 'Gör om provet',
        en: 'Retake the test'
    },
    'test.changeBtn': {
        sv: 'Byt övning',
        en: 'Change exercise'
    },

    // Specific test continuation buttons
    'test.startSection1': {
        sv: 'Börja med Del 1: Stamtoner →',
        en: 'Start with Part 1: Natural Notes →'
    },
    'test.continueSection2': {
        sv: 'Fortsätt till Del 2: Korsförtecken →',
        en: 'Continue to Part 2: Sharps →'
    },
    'test.continueSection3': {
        sv: 'Fortsätt till Del 3: B-förtecken →',
        en: 'Continue to Part 3: Flats →'
    },
    'test.continueSection4': {
        sv: 'Fortsätt till Del 4: Alla toner →',
        en: 'Continue to Part 4: All Notes →'
    },
    'test.completedAllPiano': {
        sv: '<strong>Du har klarat alla piano-övningar!</strong><br>Nu kan du alla toner på pianot. Dags att lära dig läsa noter!',
        en: '<strong>You have completed all piano exercises!</strong><br>Now you know all the notes on the piano. Time to learn to read sheet music!'
    },
    'test.startTrebleClef': {
        sv: 'Börja med noter i G-klav →',
        en: 'Start with notes in treble clef →'
    },

    // =====================
    // piano-flera-oktaver.js
    // =====================
    'multiOctave.description': {
        sv: 'Test: {names} - {total} frågor, minst {required} rätt för godkänt',
        en: 'Test: {names} - {total} questions, {required} correct to pass'
    },

    // =====================
    // notlasning.js
    // =====================
    'noteReading.title': {
        sv: 'Notläsning',
        en: 'Note Reading'
    },
    'noteReading.correct': {
        sv: 'Rätt:',
        en: 'Correct:'
    },
    'noteReading.attempts': {
        sv: 'Försök:',
        en: 'Attempts:'
    },
    'noteReading.streak': {
        sv: 'Rad:',
        en: 'Streak:'
    },
    'noteReading.restart': {
        sv: 'Börja om',
        en: 'Start over'
    },
    'noteReading.noteAlt': {
        sv: 'Not att läsa',
        en: 'Note to read'
    },

    // =====================
    // notvarden.js
    // =====================
    'audio.listen': {
        sv: 'Lyssna',
        en: 'Listen'
    },
    'audio.stop': {
        sv: 'Stopp',
        en: 'Stop'
    }
};

/**
 * Get a translated string with optional parameter substitution.
 * Parameters use {name} syntax: T('key', {name: 'value'})
 */
function T(key, params) {
    const entry = _translations[key];
    if (!entry) return key;
    var str = entry[LANG] !== undefined ? entry[LANG] : entry['sv'];
    if (str === null || str === undefined) return null;
    if (typeof str !== 'string') return str;
    if (params) {
        Object.keys(params).forEach(function(k) {
            str = str.split('{' + k + '}').join(String(params[k]));
        });
    }
    return str;
}

/**
 * Get pronunciation guide for a note (Swedish only).
 * Returns null in English since C#/Db notation is standard.
 */
function getNotePronunciation(note) {
    if (LANG !== 'sv') return null;
    var map = {
        'C#': 'Ciss', 'D#': 'Diss', 'F#': 'Fiss', 'G#': 'Giss', 'A#': 'Aiss',
        'Db': 'Dess', 'Eb': 'Ess', 'Gb': 'Gess', 'Ab': 'Ass', 'Bb': 'Bess'
    };
    return map[note] || null;
}

/**
 * Map a local page URL to the correct language version.
 * Swedish mode returns path unchanged. English mode maps filenames.
 */
function localUrl(path) {
    if (LANG === 'sv') return path;

    var qIndex = path.indexOf('?');
    var filename = qIndex >= 0 ? path.substring(0, qIndex) : path;
    var query = qIndex >= 0 ? path.substring(qIndex) : '';

    var mapping = {
        'piano-hub.html': 'piano-hub.html',
        'piano-tangenter-ova.html': 'piano-keys-exercise.html',
        'piano-tangenter-prov.html': 'piano-keys-test.html',
        'piano-stamtoner-prov.html': 'piano-natural-notes-test.html',
        'piano-kors-prov.html': 'piano-sharps-test.html',
        'piano-b-prov.html': 'piano-flats-test.html',
        'piano-alla-toner-prov.html': 'piano-all-notes-test.html',
        'piano-oktav.html': 'piano-octave.html',
        'piano-oktav-prov.html': 'piano-octave-test.html',
        'piano-flera-oktaver.html': 'piano-multiple-octaves.html',
        'noter-g-klav-hub.html': 'notes-treble-clef-hub.html',
        'noter-f-klav-hub.html': 'notes-bass-clef-hub.html',
        'notlasning.html': 'note-reading.html'
    };

    var mapped = mapping[filename] || filename;
    return mapped + query;
}
