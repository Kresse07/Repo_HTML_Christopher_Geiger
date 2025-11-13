document.addEventListener('DOMContentLoaded', function () {
    // mac-book-air4.html: Nur "Get Table 2018" Button klickbar
    var getTableButton = document.querySelector('.mac-book-air4-text5');
    if (getTableButton) {
        getTableButton.style.cursor = "pointer";
        getTableButton.addEventListener('click', function () {
            window.location.href = "index.html";
        });
    }

    var backToMacBookAir4_2 = document.querySelectorAll('.mac-book-air1-image2');
    backToMacBookAir4_2.forEach(function (img) {
    img.style.cursor = "pointer";
    img.addEventListener('click', function () {
        window.location.href = "mac-book-air4.html";
    });
    });

    // index.html: Team-Kacheln alle klickbar
    var teamTiles = document.querySelectorAll(
        '.mac-book-air1-component1, .mac-book-air1-component9, .mac-book-air1-component10, .mac-book-air1-component11, .mac-book-air1-component12, .mac-book-air1-component13, .mac-book-air1-component14, .mac-book-air1-component15, .mac-book-air1-component16, .mac-book-air1-component17, .mac-book-air1-component18, .mac-book-air1-component19, .mac-book-air1-component20, .mac-book-air1-component21, .mac-book-air1-component22, .mac-book-air1-component23, .mac-book-air1-component24, .mac-book-air1-component25'
    );
    teamTiles.forEach(function (tile) {
        tile.style.cursor = "pointer";
        tile.addEventListener('click', function () {
            window.location.href = "mac-book-air2.html";
        });
    });

    // mac-book-air2.html: Bild "mac-book-air2-download2" bringt zurück zum Index
    var backToIndex = document.querySelectorAll('.mac-book-air2-download2');
    backToIndex.forEach(function (img) {
        img.style.cursor = "pointer";
        img.addEventListener('click', function () {
            window.location.href = "index.html";
        });
    });

    document.addEventListener('DOMContentLoaded', function () {
    fetch('https://api.openligadb.de/getbltable/enpl/2018')
        .then(response => response.json())
        .then(data => updateTiles(data))
        .catch(e => console.error('API-Fehler', e));
});

function updateTiles(teams) {
    // Hol dir alle vorhandenen Komponenten-Kacheln (z.B. die ersten 20)
    // Hier als Beispiel alle Divs mit passender Klasse
    const tiles = document.querySelectorAll('[class^="mac-book-air1-component"]');
    // Für jeden Team-Datensatz und Kachel je ein Mapping
    tiles.forEach((tile, i) => {
        if (!teams[i]) return;
        tile.querySelector('.mac-book-air1-text31').textContent = (i+1); // Platz
        tile.querySelector('.mac-book-air1-text38').textContent = teams[i].teamName; // Teamname
        tile.querySelector('.mac-book-air1-text39').textContent = teams[i].points; // Punkte
        // Optional: Änderung des TeamIcons (wenn gewollt)
        let img = tile.querySelector('.mac-book-air1-rectangle318');
        if (img) img.src = teams[i].teamIconUrl;
    });
}
});
