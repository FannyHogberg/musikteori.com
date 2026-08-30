# Musikteori.com - Projektstatus

## Vad vi bygger
En ny version av musikteori.com utan WordPress. Ren HTML/CSS/JavaScript som kan hostas gratis.

## Klart

### Grundstruktur
- `index.html` - Startsida med hero, feature-kort, sociala länkar
- `kurser.html` - Kurslista
- `ovningar.html` - Placeholder
- `quiz.html` - Placeholder
- `kontakt.html` - Placeholder
- `css/style.css` - All styling (grön tema, responsiv design)
- `js/main.js` - Meny-toggle för mobil

### Kurser
- `kurser/grundlaggande-musikteori/noterna-och-deras-varden.html` - Avsnitt 1 (klart)
- `kurser/grundlaggande-musikteori/pauser.html` - Avsnitt 2 (klart)

### Bilder
Ligger i `images/noter/`:
- Noter: helnot.svg, halvnot.svg, fjardedelsnot.svg, attondelsnot.svg, sextondelsnot.svg, trettiotvaondelsnot.svg
- Pauser: helpaus.png, halvpaus.png, fjardedelsPause.png, attondelspause.png, sextondelsPause.png

## Kvar att göra

### Kurser - Grundläggande Musikteori
- [ ] Avsnitt 3: Taktarter och deras betydelse
- [ ] Avsnitt 4: Tonernas namn
- [ ] Quiz efter varje avsnitt
- [ ] Avslutande test med blandade frågor

### Övningar
- [ ] Notmemory (para ihop not med bokstav, olika nivåer)
- [ ] Notläsning (se noter, svara vilken not)
- [ ] Drag-and-drop (dra not till rätt bokstav)

### Quiz-sida
- [ ] Samla alla quiz på en sida

### Kontakt-sida
- [ ] Kontaktformulär/info

### Övrigt
- [ ] Instagram-länk (kanske senaste poster - kräver API)
- [ ] Facebook-länk
- [ ] Reklam (kommer senare)
- [ ] Publicera sidan (Netlify/GitHub Pages/Vercel)

## Att köra lokalt
```bash
cd /Users/fannyhogberg/Code/musikteori.com
python3 -m http.server 8000
```
Öppna sedan: http://localhost:8000

## Tekniska detaljer
- Titel i tab: "Bli ett musikaliskt geni - Lär dig Musikteori"
- Signaturfärg: Grön (#2ecc71)
- Copyright: 2026
