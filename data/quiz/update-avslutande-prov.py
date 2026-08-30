#!/usr/bin/env python3
"""
Skript för att uppdatera avslutande-prov.json med alla frågor från kursens quiz.
Kör detta skript varje gång du ändrar någon av de individuella quizen.

Användning:
    python3 update-avslutande-prov.py
"""

import json

print("Uppdaterar avslutande prov...")

# Läs alla quiz-filer
with open('noterna-quiz.json', 'r', encoding='utf-8') as f:
    noterna = json.load(f)
with open('pauser-quiz.json', 'r', encoding='utf-8') as f:
    pauser = json.load(f)
with open('taktarter-quiz.json', 'r', encoding='utf-8') as f:
    taktarter = json.load(f)
with open('tonernas-namn-quiz.json', 'r', encoding='utf-8') as f:
    tonernas_namn = json.load(f)

# Kombinera alla frågor och numrera om dem
all_questions = []
id_counter = 1

for quiz in [noterna, pauser, taktarter, tonernas_namn]:
    for question in quiz['questions']:
        new_question = question.copy()
        new_question['id'] = id_counter
        all_questions.append(new_question)
        id_counter += 1

# Skapa det avslutande provet
final_quiz = {
    "title": "Avslutande prov: Grundläggande Musikteori",
    "description": "Testa dina kunskaper från hela kursen",
    "passingScore": 80,
    "randomQuestions": 10,
    "questions": all_questions
}

# Skriv till fil
with open('avslutande-prov.json', 'w', encoding='utf-8') as f:
    json.dump(final_quiz, f, ensure_ascii=False, indent=2)

print(f"✓ Klart! Avslutande prov uppdaterat med {len(all_questions)} frågor")
print(f"  - {len(noterna['questions'])} frågor från Noterna")
print(f"  - {len(pauser['questions'])} frågor från Pauser")
print(f"  - {len(taktarter['questions'])} frågor från Taktarter")
print(f"  - {len(tonernas_namn['questions'])} frågor från Tonernas namn")
