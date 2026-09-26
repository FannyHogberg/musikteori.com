/* Interaktiv kvintcirkel: klick på en tonart visar dess fasta förtecken, både som text och på notsystemet. */
(() => {
    const KEYS_SV = [
        { major: 'C-dur', minor: 'A-moll', type: 'none', count: 0, text: 'Inga fasta förtecken.' },
        { major: 'G-dur', minor: 'E-moll', type: 'sharp', count: 1, text: 'Ett korsförtecken: F♯.' },
        { major: 'D-dur', minor: 'B-moll', type: 'sharp', count: 2, text: 'Två korsförtecken: F♯, C♯.' },
        { major: 'A-dur', minor: 'F♯-moll', type: 'sharp', count: 3, text: 'Tre korsförtecken: F♯, C♯, G♯.' },
        { major: 'E-dur', minor: 'C♯-moll', type: 'sharp', count: 4, text: 'Fyra korsförtecken: F♯, C♯, G♯, D♯.' },
        { major: 'B-dur', minor: 'G♯-moll', type: 'sharp', count: 5, text: 'Fem korsförtecken: F♯, C♯, G♯, D♯, A♯.' },
        { major: 'F♯-dur / G♭-dur', minor: 'D♯-moll / E♭-moll', type: 'sharp', count: 6, text: 'Sex korsförtecken: F♯, C♯, G♯, D♯, A♯, E♯. (Samma tonart kan även skrivas som G♭-dur, med sex b-förtecken i stället.)' },
        { major: 'D♭-dur', minor: 'B♭-moll', type: 'flat', count: 5, text: 'Fem b-förtecken: B♭, E♭, A♭, D♭, G♭.' },
        { major: 'A♭-dur', minor: 'F-moll', type: 'flat', count: 4, text: 'Fyra b-förtecken: B♭, E♭, A♭, D♭.' },
        { major: 'E♭-dur', minor: 'C-moll', type: 'flat', count: 3, text: 'Tre b-förtecken: B♭, E♭, A♭.' },
        { major: 'B♭-dur', minor: 'G-moll', type: 'flat', count: 2, text: 'Två b-förtecken: B♭, E♭.' },
        { major: 'F-dur', minor: 'D-moll', type: 'flat', count: 1, text: 'Ett b-förtecken: B♭.' },
    ];

    const KEYS_EN = [
        { major: 'C major', minor: 'A minor', type: 'none', count: 0, text: 'No key signature.' },
        { major: 'G major', minor: 'E minor', type: 'sharp', count: 1, text: 'One sharp: F♯.' },
        { major: 'D major', minor: 'B minor', type: 'sharp', count: 2, text: 'Two sharps: F♯, C♯.' },
        { major: 'A major', minor: 'F♯ minor', type: 'sharp', count: 3, text: 'Three sharps: F♯, C♯, G♯.' },
        { major: 'E major', minor: 'C♯ minor', type: 'sharp', count: 4, text: 'Four sharps: F♯, C♯, G♯, D♯.' },
        { major: 'B major', minor: 'G♯ minor', type: 'sharp', count: 5, text: 'Five sharps: F♯, C♯, G♯, D♯, A♯.' },
        { major: 'F♯ major / G♭ major', minor: 'D♯ minor / E♭ minor', type: 'sharp', count: 6, text: 'Six sharps: F♯, C♯, G♯, D♯, A♯, E♯. (The same key can also be written as G♭ major, with six flats instead.)' },
        { major: 'D♭ major', minor: 'B♭ minor', type: 'flat', count: 5, text: 'Five flats: B♭, E♭, A♭, D♭, G♭.' },
        { major: 'A♭ major', minor: 'F minor', type: 'flat', count: 4, text: 'Four flats: B♭, E♭, A♭, D♭.' },
        { major: 'E♭ major', minor: 'C minor', type: 'flat', count: 3, text: 'Three flats: B♭, E♭, A♭.' },
        { major: 'B♭ major', minor: 'G minor', type: 'flat', count: 2, text: 'Two flats: B♭, E♭.' },
        { major: 'F major', minor: 'D minor', type: 'flat', count: 1, text: 'One flat: B♭.' },
    ];

    const KEYS = (typeof LANG !== 'undefined' && LANG === 'en') ? KEYS_EN : KEYS_SV;

    const circle = document.querySelector('[data-quint-circle]');
    const description = document.querySelector('[data-quint-circle-description]');
    const staff = document.querySelector('[data-quint-circle-staff]');
    const wrap = circle ? circle.closest('.quint-circle-wrap') : null;
    if (!circle || !description) return;

    const nodes = circle.querySelectorAll('.quint-circle-node');
    const sharpImages = document.querySelectorAll('.quint-circle-sharp');
    const flatImages = document.querySelectorAll('.quint-circle-flat');

    /* På bredare skärmar får notbladet plats mitt i cirkeln; på smala skärmar
       är hålet i mitten för litet, så då visas det i stället under diagrammet. */
    if (staff && wrap) {
        const noscript = wrap.querySelector('noscript');
        const mq = window.matchMedia('(min-width: 600px)');

        const layoutStaff = mql => {
            const isCentered = mql.matches;
            staff.classList.toggle('is-centered', isCentered);
            if (isCentered) {
                circle.appendChild(staff);
            } else if (noscript) {
                wrap.insertBefore(staff, noscript);
            } else {
                wrap.appendChild(staff);
            }
        };

        layoutStaff(mq);
        mq.addEventListener('change', layoutStaff);
    }

    function select(index) {
        const key = KEYS[index];
        if (!key) return;

        nodes.forEach(node => {
            node.classList.toggle('is-selected', Number(node.dataset.index) === index);
        });
        description.innerHTML = `<strong>${key.major}</strong> / <strong>${key.minor}</strong>: ${key.text}`;

        sharpImages.forEach(img => {
            img.style.display = key.type === 'sharp' && Number(img.dataset.slot) < key.count ? '' : 'none';
        });
        flatImages.forEach(img => {
            img.style.display = key.type === 'flat' && Number(img.dataset.slot) < key.count ? '' : 'none';
        });
    }

    nodes.forEach(node => {
        node.addEventListener('click', () => select(Number(node.dataset.index)));
    });

    select(0);
})();
