# Övningar och Prov - Teknisk Dokumentation

Detta dokument beskriver hur övningar och prov fungerar i Musikteori.com.

## Struktur

### Tre typer av övningar:

1. **Läs noter (G-klav och F-klav)**
   - Hub-sidor: `noter-g-klav-hub.html`, `noter-f-klav-hub.html`
   - Övningar: `piano-oktav.html`
   - Prov: `piano-oktav-prov.html`, `piano-flera-oktaver.html`

2. **Lär dig tangenter på pianot**
   - Hub-sida: `piano-hub.html`
   - Övningar: `piano-tangenter-ova.html`
   - Prov: `piano-tangenter-prov.html`, `piano-stamtoner-prov.html`, `piano-kors-prov.html`, `piano-b-prov.html`, `piano-alla-toner-prov.html`

3. **Grundövning (gammal)**
   - Fil: `piano-tangenter.html` + `piano-exercise.js`
   - Används ej från hubbar

## JavaScript-filer och parametrar

### Noter med klav-stöd

#### `piano-oktav.js` (Övningar)
- **Används av:** `piano-oktav.html`
- **URL-parametrar:**
  - `octave`: lilla | ettstrukna | tvastrukna | stora | ettstrukna-fg
  - `level`: 1 | 2
  - `clef`: g-klav | f-klav (default: g-klav)
- **Bildmapp:** `/images/noter/${clef}/${octaveFolder}/`
- **Tillbaka-knapp:** Går till `noter-g-klav-hub.html` eller `noter-f-klav-hub.html` beroende på clef

#### `piano-oktav-prov.js` (Prov, en oktav)
- **Används av:** `piano-oktav-prov.html`
- **URL-parametrar:**
  - `octave`: lilla | ettstrukna | tvastrukna | stora | ettstrukna-fg
  - `clef`: g-klav | f-klav (default: g-klav)
- **Bildmapp:** `/images/noter/${clef}/${octaveFolder}/`
- **Tillbaka-knapp:** Går till `noter-g-klav-hub.html` eller `noter-f-klav-hub.html` beroende på clef

#### `piano-flera-oktaver.js` (Prov, flera oktaver)
- **Används av:** `piano-flera-oktaver.html`
- **URL-parametrar:**
  - `octaves`: kommaseparerad lista (ex: `lilla,ettstrukna,tvastrukna`)
  - `clef`: g-klav | f-klav (default: g-klav)
- **Bildmapp:** `/images/noter/${clef}/${octaveFolder}/`
- **Tillbaka-knapp:** Går till `noter-g-klav-hub.html` eller `noter-f-klav-hub.html` beroende på clef

### Piano tangenter

#### `piano-tangenter-ova.js` (Övningar)
- **Används av:** `piano-tangenter-ova.html`
- **URL-parametrar:**
  - `level`: 1-12
- **Tillbaka-knapp:** Går till `piano-hub.html`

#### `piano-tangenter-prov.js` (Prov, alla toner)
- **Används av:** `piano-tangenter-prov.html`
- **Tillbaka-knapp:** Går till `piano-hub.html`
- **Efter godkänt:** "Lär dig noter G-klav" → `noter-g-klav-hub.html`

#### `piano-stamtoner-prov.js` (Prov, stamtoner)
- **Används av:** `piano-stamtoner-prov.html`
- **Tillbaka-knapp:** Går till `piano-hub.html`

#### `piano-kors-prov.js` (Prov, korsförtecken)
- **Används av:** `piano-kors-prov.html`
- **Tillbaka-knapp:** Går till `piano-hub.html`

#### `piano-b-prov.js` (Prov, b-förtecken)
- **Används av:** `piano-b-prov.html`
- **Tillbaka-knapp:** Går till `piano-hub.html`

#### `piano-alla-toner-prov.js` (Prov, alla toner mixed)
- **Används av:** `piano-alla-toner-prov.html`
- **Tillbaka-knapp:** Går till `piano-hub.html`
- **Efter godkänt:** "Lär dig noter G-klav" → `noter-g-klav-hub.html`

## Bildmappar

### G-klav noter
```
/images/noter/g-klav/
  ├── ettstruknaOktaven/  (c, d, e, f, g, a, h)
  ├── lillaOktaven/       (g, a, h)  ← Bara tre noter!
  └── tvastruknaOktaven/  (c, d, e, f, g, a, h)
```

### F-klav noter
```
/images/noter/f-klav/
  ├── ettstruknaOktaven/  (c, d, e, f, g)  ← Bara fem noter!
  ├── lillaOktaven/       (c, d, e, f, g, a, h)
  └── storaOktaven/       (c, d, e, f, g, a, h)
```

## Viktiga regler

### Lilla oktaven - olika för G-klav och F-klav

**G-klav:**
- Bara noterna G, A, H finns som bilder
- `piano-oktav.js` och `piano-oktav-prov.js` måste filtrera till bara G, A, H när clef=g-klav
- `piano-flera-oktaver.js` måste också filtrera

**F-klav:**
- Alla noter C-H finns som bilder
- Visar alla noter progressivt (som vanligt)

### Ettstrukna-fg (endast F-klav)
- `octave=ettstrukna-fg` är en speciell oktav som bara går till G (c' - g')
- Används bara för F-klav
- Bildmapp: `f-klav/ettstruknaOktaven/` (som bara har c, d, e, f, g)
- **Pianot visar:** Två oktaver (lilla + ettstrukna) för kontext
- **Frågor om:** Bara C-G i ettstrukna oktaven

### Frågeräknare (Question Counter)

**VIKTIGT:** Alla prov-filer MÅSTE ha både class OCH id på frågeräknaren!

**HTML-struktur (OBLIGATORISK):**
```html
<div class="question-counter" id="question-counter">
    Fråga <span id="current-question">0</span> av 30
</div>
```

**Gäller filer:**
- `piano-oktav-prov.html`
- `piano-tangenter-prov.html`
- `piano-stamtoner-prov.html`
- `piano-kors-prov.html`
- `piano-b-prov.html`
- `piano-alla-toner-prov.html`

**CSS styling (samma i alla filer):**
```css
.question-counter {
    background: var(--background-alt);
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    display: inline-block;
    font-weight: 600;
    color: #333;
    margin-bottom: 1.5rem;
}

@keyframes questionUpdate {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); background: #e8f5e9; }
    100% { transform: scale(1); }
}

.question-counter.updated {
    animation: questionUpdate 0.4s ease-out;
}
```

**JavaScript trigger (samma i alla prov-filer):**
```javascript
const counter = document.getElementById('question-counter');
counter.classList.remove('updated');
document.getElementById('current-question').textContent = this.questionCount;
void counter.offsetWidth; // Force reflow
counter.classList.add('updated');
setTimeout(() => counter.classList.remove('updated'), 400);
```

### Piano overflow

Alla `.piano` klasser **MÅSTE** ha:
```css
overflow-x: auto;
overflow-y: hidden;
-webkit-overflow-scrolling: touch;
```

Detta gäller alla HTML-filer med piano.

## Navigationsflöde

```
ovningar.html
  ├── Lär dig noter G-klav → noter-g-klav-hub.html
  │   ├── Ettstrukna oktaven
  │   │   ├── Nivå 1 → piano-oktav.html?octave=ettstrukna&level=1&clef=g-klav
  │   │   ├── Nivå 2 → piano-oktav.html?octave=ettstrukna&level=2&clef=g-klav
  │   │   └── Prov → piano-oktav-prov.html?octave=ettstrukna&clef=g-klav
  │   ├── Lilla oktaven (g-h)
  │   │   ├── Nivå 1 → piano-oktav.html?octave=lilla&level=1&clef=g-klav
  │   │   ├── Nivå 2 → piano-oktav.html?octave=lilla&level=2&clef=g-klav
  │   │   └── Prov → piano-oktav-prov.html?octave=lilla&clef=g-klav
  │   ├── Tvåstrukna oktaven
  │   │   └── ...
  │   └── Flera oktaver → piano-flera-oktaver.html?octaves=...&clef=g-klav
  │
  ├── Lär dig noter F-klav → noter-f-klav-hub.html
  │   ├── Lilla oktaven (c-h)
  │   │   ├── Nivå 1 → piano-oktav.html?octave=lilla&level=1&clef=f-klav
  │   │   ├── Nivå 2 → piano-oktav.html?octave=lilla&level=2&clef=f-klav
  │   │   └── Prov → piano-oktav-prov.html?octave=lilla&clef=f-klav
  │   ├── Stora oktaven
  │   │   └── ...
  │   ├── Ettstrukna oktaven (c-g)
  │   │   └── ...
  │   └── Flera oktaver → piano-flera-oktaver.html?octaves=...&clef=f-klav
  │
  └── Lär dig tonerna på pianot → piano-hub.html
      ├── Del 1: Stamtoner
      │   ├── Nivå 1-2: C, D, E (med/utan hjälp)
      │   ├── Nivå 3-4: F, G, A, H (med/utan hjälp)
      │   ├── Nivå 5: Alla stamtoner C-H (utan hjälp)
      │   └── Prov → piano-stamtoner-prov.html
      ├── Del 2: Korsförtecken
      │   ├── Nivåer 6-7 → piano-tangenter-ova.html?level=6-7
      │   └── Prov → piano-kors-prov.html
      ├── Del 3: B-förtecken
      │   ├── Nivåer 8-9 → piano-tangenter-ova.html?level=8-9
      │   └── Prov → piano-b-prov.html
      └── Del 4: Alla toner
          ├── Nivåer 10-12 → piano-tangenter-ova.html?level=10-12
          └── Prov → piano-alla-toner-prov.html
```

## UI/UX Regler (KRITISKA!)

### Prov ska INTE visa rätt/fel under testet

**VIKTIGT:** Prov får INTE visa antal rätt eller fel under testet!

- Endast övningar (ova) visar löpande statistik
- Prov visar bara slutresultat efter alla 30 frågor
- Prov-HTML får INTE ha `<div class="stats">`
- Prov-JS får INTE ha `updateStats()`, `correctCount`, eller `incorrectCount`

**Exempel på korrekt prov-struktur:**
```html
<!-- INTE detta i prov: -->
<div class="stats">
    <div class="stat-box">
        <div class="stat-label">Rätt</div>
        <div class="stat-value" id="correct-count">0</div>
    </div>
</div>

<!-- Prov ska bara ha piano och fråga -->
<div class="piano">
    <div class="piano-keys" id="piano-keys"></div>
</div>
```

**Prov använder endast:**
- `this.answers = []` - array för att spara alla svar
- Beräknar rätt/fel först i `completeTest()` / `showResults()`
- Visar bara slutresultat (X/30, Y%)

### Tillbaka-knappar under pågående prov

**ALLA prov-filer MÅSTE ha:**
1. En "← Byt övning" knapp synlig under provet
2. Alert-bekräftelse när man klickar på knappen
3. Klav-medveten navigering (g-klav/f-klav → rätt hub)

**HTML (lägg till i prov-HTML):**
```html
<div style="text-align: center; margin-top: 2rem;">
    <button class="btn" id="back-to-hub-btn">← Byt övning</button>
</div>
```

**JavaScript (i init() eller liknande):**
```javascript
const backBtn = document.getElementById('back-to-hub-btn');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        if (confirm('Är du säker på att du vill avbryta provet?')) {
            // För klav-prov (g-klav/f-klav):
            if (this.clef === 'f-klav') {
                window.location.href = 'noter-f-klav-hub.html';
            } else {
                window.location.href = 'noter-g-klav-hub.html';
            }

            // För piano-tangenter prov:
            // window.location.href = 'piano-hub.html';
        }
    });
}
```

**VIKTIGT:** Dölj tillbaka-knappen när provet är klart!
```javascript
// I completeTest() eller showResults():
const backButton = document.getElementById('back-to-hub-btn');
if (backButton && backButton.parentElement) {
    backButton.parentElement.style.display = 'none';
}

// För piano-flera-oktaver.js som har .controls div:
const controls = document.querySelector('.controls');
if (controls) {
    controls.style.display = 'none';
}
```

### Resultatskärm efter prov

**ALLA prov MÅSTE visa:**
- **När godkänt (passed):** 3 knappar
  1. "Fortsätt till [nästa del/steg] →" (btn btn-primary) - går till NÄSTA övning/del
  2. "Gör om provet" (btn) - reload
  3. "Byt övning" (btn) - går till relevant hub

- **När ej godkänt (failed):** 2 knappar
  1. "Gör om provet" (btn btn-primary) - reload
  2. "Byt övning" (btn) - går till relevant hub

**VIKTIGT:** Första knappen när godkänt ska leda FRAMÅT i progressionen, inte tillbaka till hub!

**HTML-mall (använd i alla prov):**
```javascript
<div class="quiz-actions" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
    ${passed
        ? '<button class="btn btn-primary" id="continue-btn">Fortsätt öva →</button>'
        : ''
    }
    <button class="btn ${passed ? '' : 'btn-primary'}" id="retry-btn">Gör om provet</button>
    <button class="btn" id="back-btn">Byt övning</button>
</div>
```

### Progression - Vart "Fortsätt"-knappen ska leda

**Piano tangenter-prov (EXAKT ORDNING!):**

1. **piano-tangenter-prov.js** (första provet)
   - Knapptext: "Börja med Del 1: Stamtoner →"
   - Går till: `piano-tangenter-ova.html?level=1`

2. **piano-stamtoner-prov.js** (Del 1)
   - Knapptext: "Fortsätt till Del 2: Korsförtecken →"
   - Går till: `piano-tangenter-ova.html?level=6`

3. **piano-kors-prov.js** (Del 2)
   - Knapptext: "Fortsätt till Del 3: B-förtecken →"
   - Går till: `piano-tangenter-ova.html?level=8`

4. **piano-b-prov.js** (Del 3)
   - Knapptext: "Fortsätt till Del 4: Alla toner →"
   - Går till: `piano-tangenter-ova.html?level=10`

5. **piano-alla-toner-prov.js** (Del 4, sista)
   - Knapptext: "Lär dig noter G-klav →"
   - Går till: `noter-g-klav-hub.html`

**Noter-prov (klav-beroende):**

6. **piano-oktav-prov.js** (alla oktaver)
   - Knapptext: "Fortsätt öva →"
   - Går till: `noter-g-klav-hub.html` eller `noter-f-klav-hub.html` (beroende på clef)

7. **piano-flera-oktaver.js** (flera oktaver test)
   - Knapptext: "Fortsätt öva →"
   - Går till: `noter-g-klav-hub.html` eller `noter-f-klav-hub.html` (beroende på clef)

**Kod-exempel:**

```javascript
// Piano tangenter progression
if (passed) {
    document.getElementById('continue-btn').addEventListener('click', () => {
        // EXEMPEL: Del 1 → Del 2
        window.location.href = 'piano-tangenter-ova.html?level=6';
    });
}

// Klav-prov progression
if (passed) {
    document.getElementById('continue-btn').addEventListener('click', () => {
        if (this.clef === 'f-klav') {
            window.location.href = 'noter-f-klav-hub.html';
        } else {
            window.location.href = 'noter-g-klav-hub.html';
        }
    });
}

// Standard event listeners
document.getElementById('retry-btn').addEventListener('click', () => {
    window.location.reload();
});

document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'piano-hub.html'; // eller rätt hub
});
```

### Övningar - Tillbaka-knapp SYNLIG på slutskärm

**För övningar (`piano-tangenter-ova.js`, `piano-oktav.js`):**
Tillbaka-knappen "← Byt övning" ska FÖRBLI SYNLIG när nivån är klar, så att användaren kan välja att gå tillbaka till hubben istället för att fortsätta till nästa nivå.

**VIKTIGT:** Dölj INTE tillbaka-knappen i `completeLevel()` för övningar!

## Checklista vid ändringar

När du ändrar något, kontrollera:

### Grundläggande
- [ ] Går alla tillbaka-knappar till rätt hub?
- [ ] Har du ändrat bildvägar? Kontrollera att bilderna faktiskt finns!
- [ ] För lilla oktaven: kollade du både G-klav (g, a, h) och F-klav (c-h)?
- [ ] Har piano `.overflow-y: hidden`?
- [ ] Funkar både level 1 och level 2 för övningar?
- [ ] Testat både G-klav och F-klav om det är en klav-övning?

### UI/UX (KRITISKT!)
- [ ] Har frågeräknaren både `class="question-counter"` OCH `id="question-counter"`?
- [ ] Har frågeräknaren animation med 'updated' class?
- [ ] Prov visar INTE rätt/fel under testet (inga stats-divs i prov-HTML)?
- [ ] Finns "← Byt övning" knapp synlig under alla prov?
- [ ] Har alla "← Byt övning" knappar alert-bekräftelse?
- [ ] Visar resultatskärmen 3 knappar när godkänt, 2 när ej godkänt?
- [ ] Är "Fortsätt öva →" (primary) första knappen när godkänt?
- [ ] Är "Gör om provet" (primary) första knappen när ej godkänt?
- [ ] Döljs tillbaka-knappen när PROV är klart? (Övningar ska BEHÅLLA knappen synlig!)
- [ ] För klav-prov: går continue/back till rätt hub baserat på clef-parameter?
- [ ] Leder "Fortsätt"-knappen FRAMÅT till nästa del (inte tillbaka till hub)?
- [ ] Stämmer progressionen: tangenter→stamtoner→kors→b→alla toner→noter?
