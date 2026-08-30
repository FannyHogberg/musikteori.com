const fs = require('fs');

// Read all quiz files
const noterna = JSON.parse(fs.readFileSync('noterna-quiz.json', 'utf8'));
const pauser = JSON.parse(fs.readFileSync('pauser-quiz.json', 'utf8'));
const taktarter = JSON.parse(fs.readFileSync('taktarter-quiz.json', 'utf8'));
const tonernasNamn = JSON.parse(fs.readFileSync('tonernas-namn-quiz.json', 'utf8'));

// Combine all questions
let allQuestions = [];
let idCounter = 1;

// Add questions from each quiz and renumber them
[...noterna.questions, ...pauser.questions, ...taktarter.questions, ...tonernasNamn.questions].forEach(q => {
    allQuestions.push({
        ...q,
        id: idCounter++
    });
});

// Create final quiz
const finalQuiz = {
    title: "Avslutande prov: Grundläggande Musikteori",
    description: "Testa dina kunskaper från hela kursen",
    passingScore: 80,
    randomQuestions: 10,
    questions: allQuestions
};

// Write to file
fs.writeFileSync('avslutande-prov-quiz.json', JSON.stringify(finalQuiz, null, 2));
console.log(`Created final quiz with ${allQuestions.length} questions`);
