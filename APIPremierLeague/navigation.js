document.addEventListener('DOMContentLoaded', function () {

    console.log("navigation.js aktiv");

    // ---------------------------------------------------------
    // GLOBALE ELEMENT-SELEKTOREN FÜR INDEX.HTML
    // ---------------------------------------------------------
    const col1 = document.getElementById('column1');
    const col2 = document.getElementById('column2');

    // --------------------------
    // 1. ALLGEMEINE NAVIGATIONSLOGIK
    // --------------------------

    // mac-book-air4.html: "Get Table 2018" Button klickbar (springt zu index.html)
    var getTableButton = document.querySelector('.mac-book-air4-text5');
    if (getTableButton) {
        getTableButton.style.cursor = "pointer";
        getTableButton.addEventListener('click', function () {
            window.location.href = "index.html";
        });
    }

    // mac-book-air2.html: Bild "mac-book-air2-download2" (Pfeil) zurück zum Index
    var backToIndex = document.querySelectorAll('.mac-book-air2-download2');
    backToIndex.forEach(function (img) {
        img.style.cursor = "pointer";
        img.addEventListener('click', function () {
            window.location.href = "index.html";
        });
    });
    
    // Alte/unbekannte Navigation von Bildern (Klasse wurde beibehalten)
    var backToMacBookAir4_2 = document.querySelectorAll('.mac-book-air1-image2');
    backToMacBookAir4_2.forEach(function (img) {
        img.style.cursor = "pointer";
        img.addEventListener('click', function () {
            window.location.href = "mac-book-air2.html";
        });
    });

    // Klick auf Premier League Logo + Text (im Header) → mac-book-air4.html (Startseite)
    const premierLogoContainer = document.querySelector('.header-left');
    if (premierLogoContainer) {
        premierLogoContainer.style.cursor = 'pointer';
        premierLogoContainer.addEventListener('click', () => {
            window.location.href = "mac-book-air4.html";
        });
    }


    // ---------------------------------------------------------
    // 2. INDEX.HTML SPEZIFISCHE LOGIK (Tabelle füllen)
    // ---------------------------------------------------------
    if (col1 && col2) {
        
        // Macht Team-Zeilen klickbar
        function makeTeamRowsClickable(column) {
            column.addEventListener('click', function (e) {
                const row = e.target.closest('.team-row');
                if (!row) return;
                const team = row.dataset.team;
                console.log("Team geklickt:", team);
                if (team) {
                    // Wichtig: Hier wird der TeamName als Parameter übergeben, wie in der alten JS-Logik benötigt
                    window.location.href = "mac-book-air2.html?team=" + encodeURIComponent(team);
                }
            });
        }

        // Lädt die gesamte Premier League Tabelle 2018
        async function loadPremierLeagueData() {
            try {
                console.log("lade Tabelle von OpenLigaDB...");
                const res = await fetch("https://api.openligadb.de/getbltable/enpl/2018");
                const teams = await res.json();
                console.log("Teams geladen:", teams && teams.length);

                col1.innerHTML = '';
                col2.innerHTML = '';

                teams.forEach((teamObj, index) => {
                    const teamName = teamObj.teamName;
                    const points = teamObj.points ?? "-";
                    const div = document.createElement('div');
                    div.className = 'team-row';
                    div.dataset.team = teamName;
                    const fallbackImg = "public/Huddersfield.png";
                    const logo = teamObj.teamIconUrl || fallbackImg;

                    div.innerHTML = `
                        <div class="team-info">
                            <span class="team-pos">${index + 1}</span>
                            <img src="${logo}" alt="${teamName} Logo"
                                onerror="this.onerror=null; this.src='${fallbackImg}';" />
                            <span class="team-name-text">${teamName}</span>
                        </div>
                        <span class="team-points">${points}</span>
                    `;

                    if (index < 10) col1.appendChild(div);
                    else col2.appendChild(div);
                });

                console.log("Team-Rows erzeugt.");

            } catch (err) {
                console.error("Fehler beim Laden der Premier League Daten:", err);
            }
        }

        // Ausführung der index.html Logik
        makeTeamRowsClickable(col1);
        makeTeamRowsClickable(col2);
        loadPremierLeagueData();
    }


    // ---------------------------------------------------------
    // 3. MAC-BOOK-AIR2.HTML SPEZIFISCHE LOGIK (Laden des 1. Spieltags)
    // ---------------------------------------------------------
    
    // Diese Funktion implementiert die Logik aus dem Inline-Skript des Nutzers
    async function loadFirstMatchDetails() {
        const placeholderImg = "public/Huddersfield.png";
        const params = new URLSearchParams(window.location.search);
        const teamParam = params.get("team");
        if (!teamParam) return; 

        // Endpoint zum Abrufen aller Spiele für ein Team (wird für die Filterung benötigt)
        const apiUrl = `https://api.openligadb.de/getmatchdata/enpl/2018/${encodeURIComponent(teamParam)}`;

        try {
            console.log(`Lade Matchdetails für ${teamParam} (1. Spieltag)...`);
            const response = await fetch(apiUrl);
            const matches = await response.json();

            if (!Array.isArray(matches) || matches.length === 0) {
                document.querySelector(".mac-book-air2-text18").textContent = "Kein Spiel gefunden";
                return;
            }

            // Erstes Spiel des 1. Spieltages finden (Original-Logik des Nutzers)
            const firstMatch = matches.find(m =>
                m.group?.groupOrderID === 1 ||
                (typeof m.group?.groupName === "string" && m.group.groupName.toLowerCase().includes("1. spieltag"))
            );

            if (!firstMatch) {
                document.querySelector(".mac-book-air2-text18").textContent = "Kein Spiel gefunden";
                return;
            }

            const { team1, team2 } = firstMatch;

            // --- Tore bestimmen (Original-Logik des Nutzers) ---
            let goalsTeam1 = "-";
            let goalsTeam2 = "-";

            if (Array.isArray(firstMatch.matchResults) && firstMatch.matchResults.length > 0) {
                // Suche nach offiziellem Endergebnis (resultTypeID 2)
                let endResult = firstMatch.matchResults.find(r => Number(r.resultTypeID) === 2);

                // Fallback: Suche nach "Endergebnis" im Namen
                if (!endResult)
                    endResult = firstMatch.matchResults.find(r =>
                        typeof r.resultName === "string" && r.resultName.toLowerCase().includes("endergebnis")
                    );

                // Fallback: Letztes Ergebnis nehmen
                if (!endResult)
                    endResult = firstMatch.matchResults[firstMatch.matchResults.length - 1];

                goalsTeam1 = endResult?.pointsTeam1 ?? "-";
                goalsTeam2 = endResult?.pointsTeam2 ?? "-";
            }

            // --- Datum formatieren ---
            const date = new Date(firstMatch.matchDateTime);
            const dateString = date.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });

            // --- DOM-Elemente selektieren ---
            const teamRightText = document.querySelector(".mac-book-air2-text20");
            const teamLeftLogo = document.querySelector(".mac-book-air2image96-cc-nnq0ayd-abss-p0v9-lu-q96x961");
            const teamLeftText = document.querySelector(".mac-book-air2-text19");
            const teamRightLogo = document.querySelector(".mac-book-air2image4us2n-cgl6kg-zc0t3hp-w75q96x961");

            /* --- Teamnamen und Logos dynamisch einsetzen --- */
            teamLeftText.textContent = team1.shortName;
            teamLeftLogo.src = team1.teamIconUrl || placeholderImg;
            if(teamLeftLogo.src.includes("Huddersfield_Town"))
                teamLeftLogo.src = placeholderImg;

            teamRightText.textContent = team2.shortName;
            teamRightLogo.src = team2.teamIconUrl || placeholderImg;
            if(teamRightLogo.src.includes("Huddersfield_Town"))
                teamRightLogo.src = placeholderImg;

            // Tore setzen
            document.querySelector(".mac-book-air2-text18").textContent = `${goalsTeam1}:${goalsTeam2}`;

            // Datum setzen
            document.querySelector(".mac-book-air2-text21").textContent = dateString;

            // Matchday aus API setzen
            document.querySelector(".mac-book-air2-text14").textContent = firstMatch.group?.groupName ?? "";

        } catch (error) {
            console.error("API-Fehler beim Laden der Matchdetails:", error);
            document.querySelector(".mac-book-air2-text18").textContent = "API-Fehler";
        }
    }

    // Ausführung der mac-book-air2.html Logik, wenn die Elemente vorhanden sind
    if (document.querySelector('.mac-book-air2-text14')) {
        loadFirstMatchDetails();
    }
});