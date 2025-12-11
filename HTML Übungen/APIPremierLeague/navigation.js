// **navigation.js**

// Das gesamte Skript wird in diese Funktion eingeschlossen.
// 'DOMContentLoaded' stellt sicher, dass das HTML-Dokument vollständig geladen und analysiert wurde,
// bevor das Skript versucht, auf Elemente zuzugreifen (wichtig, um Fehler zu vermeiden).
document.addEventListener('DOMContentLoaded', function () {

    // Gibt eine Nachricht in der Browser-Konsole aus, um zu bestätigen, dass das Skript aktiv ist.
    console.log("navigation.js aktiv");

    // ---------------------------------------------------------
    // GLOBALE ELEMENT-SELEKTOREN FÜR INDEX.HTML
    // ---------------------------------------------------------

    // Holt die Referenz auf die beiden Spalten, die später die Tabelle auf 'index.html' halten.
    // 'const' definiert eine Konstante, die nicht neu zugewiesen werden kann.
    const col1 = document.getElementById('column1');
    const col2 = document.getElementById('column2');

    // --------------------------
    // 1. ALLGEMEINE NAVIGATIONSLOGIK (Funktioniert auf verschiedenen Seiten)
    // --------------------------

    // mac-book-air4.html: "Get Table 2018" Button klickbar (springt zu index.html)
    // document.querySelector() holt das erste passende Element mit dieser CSS-Klasse.
    var getTableButton = document.querySelector('.mac-book-air4-text5');
    
    // Prüft, ob der Button auf der aktuellen Seite existiert, bevor er damit arbeitet.
    if (getTableButton) {
        // Ändert den Mauszeiger, um dem Benutzer zu signalisieren, dass das Element klickbar ist.
        getTableButton.style.cursor = "pointer";
        
        // Fügt einen Event-Listener hinzu: Bei Klick wird die Funktion ausgeführt.
        getTableButton.addEventListener('click', function () {
            // Leitet den Browser zur Haupttabelle (index.html) weiter.
            window.location.href = "index.html";
        });
    }

    // mac-book-air2.html: Bild "mac-book-air2-download2" (Pfeil) zurück zum Index
    // document.querySelectorAll() holt ALLE Elemente mit dieser Klasse (könnten mehrere sein).
    var backToIndex = document.querySelectorAll('.mac-book-air2-download2');
    
    // Durchläuft alle gefundenen 'Zurück'-Bilder.
    backToIndex.forEach(function (img) {
        img.style.cursor = "pointer";
        img.addEventListener('click', function () {
            // Leitet den Browser zur Haupttabelle (index.html) weiter.
            window.location.href = "index.html";
        });
    });
    
    // Alte/unbekannte Navigation von Bildern (Klasse wurde beibehalten)
    var backToMacBookAir4_2 = document.querySelectorAll('.mac-book-air1-image2');
    backToMacBookAir4_2.forEach(function (img) {
        img.style.cursor = "pointer";
        img.addEventListener('click', function () {
            // Leitet den Browser zur mac-book-air2.html weiter (Details-Seite).
            window.location.href = "mac-book-air2.html";
        });
    });

    // Klick auf Premier League Logo + Text (im Header) → mac-book-air4.html (Startseite)
    const premierLogoContainer = document.querySelector('.header-left');
    if (premierLogoContainer) {
        premierLogoContainer.style.cursor = 'pointer';
        // Nutzt eine kürzere Arrow-Funktion für den Klick-Handler.
        premierLogoContainer.addEventListener('click', () => {
            // Leitet zur ursprünglichen Startseite weiter.
            window.location.href = "mac-book-air4.html";
        });
    }


    // ---------------------------------------------------------
    // 2. INDEX.HTML SPEZIFISCHE LOGIK (Tabelle füllen)
    // ---------------------------------------------------------

    // Führt die Logik nur aus, wenn die Spalten-Elemente (col1 und col2) auf der Seite existieren.
    if (col1 && col2) {
        
        // Macht Team-Zeilen klickbar, nachdem sie dynamisch erzeugt wurden.
        // Diese Funktion wird auf beide Spalten angewandt.
        function makeTeamRowsClickable(column) {
            column.addEventListener('click', function (e) {
                // e.target ist das geklickte Element (z.B. Logo oder Text).
                // .closest() sucht nach dem nächsten Elternelement mit der Klasse '.team-row'.
                const row = e.target.closest('.team-row');
                
                // Wenn kein 'team-row' gefunden wird (z.B. wenn man in einen leeren Bereich klickt), wird abgebrochen.
                if (!row) return;
                
                // Holt den Teamnamen aus dem HTML-Attribut 'data-team' der Zeile.
                const team = row.dataset.team; 
                
                console.log("Team geklickt:", team);
                
                if (team) {
                    // Leitet zur Detailseite mac-book-air2.html weiter.
                    // Der TeamName wird als URL-Parameter '?team=TeamName' angehängt.
                    // encodeURIComponent() stellt sicher, dass Leerzeichen und Sonderzeichen korrekt übertragen werden.
                    window.location.href = "mac-book-air2.html?team=" + encodeURIComponent(team);
                }
            });
        }

        // Lädt die gesamte Premier League Tabelle 2018 asynchron über die OpenLigaDB API.
        // 'async' ermöglicht die Verwendung von 'await' innerhalb der Funktion.
        async function loadPremierLeagueData() {
            try {
                console.log("lade Tabelle von OpenLigaDB...");
                // fetch() sendet eine HTTP-Anfrage (GET). 'await' pausiert, bis die Antwort da ist.
                const res = await fetch("https://api.openligadb.de/getbltable/enpl/2018");
                // .json() wandelt die Antwort in ein JavaScript-Objekt/Array um.
                const teams = await res.json(); 
                console.log("Teams geladen:", teams && teams.length);

                // Leert die Spalten, um sie neu mit Daten zu füllen.
                col1.innerHTML = '';
                col2.innerHTML = '';

                // Durchläuft jedes Team im abgerufenen Array.
                teams.forEach((teamObj, index) => {
                    const teamName = teamObj.teamName;
                    // Holt die Punkte; nutzt den Nullish Coalescing Operator (??), um "-" zu verwenden, falls 'points' null oder undefined ist.
                    const points = teamObj.points ?? "-"; 
                    
                    // Erstellt ein neues <div>-Element für die Team-Zeile.
                    const div = document.createElement('div');
                    div.className = 'team-row';
                    // Speichert den Teamnamen als 'data-team' Attribut, um ihn später auszulesen (siehe makeTeamRowsClickable).
                    div.dataset.team = teamName; 
                    
                    const fallbackImg = "public/Huddersfield.png";
                    // Holt die Logo-URL oder nutzt das Fallback-Bild, falls die URL fehlt.
                    const logo = teamObj.teamIconUrl || fallbackImg;

                    // Füllt das div mit dynamischem HTML (Template Literal mit Backticks ``).
                    div.innerHTML = `
                        <div class="team-info">
                            <span class="team-pos">${index + 1}</span> 
                            <img src="${logo}" alt="${teamName} Logo"
                                // 'onerror' ist ein JavaScript-Event im HTML-Tag. 
                                // Wenn das Laden des Logos fehlschlägt, wird das Fallback-Bild geladen.
                                onerror="this.onerror=null; this.src='${fallbackImg}';" /> 
                            <span class="team-name-text">${teamName}</span>
                        </div>
                        <span class="team-points">${points}</span>
                    `;

                    // Verteilt die Teams gleichmäßig auf die zwei Spalten.
                    if (index < 10) col1.appendChild(div); // Teams 1-10
                    else col2.appendChild(div);            // Teams 11-20
                });

                console.log("Team-Rows erzeugt.");

            } catch (err) {
                // Fängt Fehler ab, falls die API-Anfrage fehlschlägt (z.B. keine Internetverbindung).
                console.error("Fehler beim Laden der Premier League Daten:", err);
            }
        }

        // --- Ausführung der index.html Logik ---
        // Aktiviert die Klick-Logik für die Spalten.
        makeTeamRowsClickable(col1);
        makeTeamRowsClickable(col2);
        // Startet das Laden und Anzeigen der Tabelle.
        loadPremierLeagueData();
    }


    // ---------------------------------------------------------
    // 3. MAC-BOOK-AIR2.HTML SPEZIFISCHE LOGIK (Laden des 1. Spieltags)
    // ---------------------------------------------------------
    
    // Lädt die Match-Details für das Team, das über den URL-Parameter ausgewählt wurde.
    async function loadFirstMatchDetails() {
        const placeholderImg = "public/Huddersfield.png";
        
        // Liest die URL-Parameter aus der Adresse (z.B. '?team=...')
        const params = new URLSearchParams(window.location.search);
        // Holt den Wert des 'team'-Parameters.
        const teamParam = params.get("team"); 
        
        // Wenn kein Team-Parameter in der URL vorhanden ist, bricht die Funktion ab.
        if (!teamParam) return; 

        // Erstellt die API-URL, um alle Spiele des ausgewählten Teams in der Saison 2018 zu bekommen.
        const apiUrl = `https://api.openligadb.de/getmatchdata/enpl/2018/${encodeURIComponent(teamParam)}`;

        try {
            console.log(`Lade Matchdetails für ${teamParam} (1. Spieltag)...`);
            const response = await fetch(apiUrl);
            const matches = await response.json();

            if (!Array.isArray(matches) || matches.length === 0) {
                document.querySelector(".mac-book-air2-text18").textContent = "Kein Spiel gefunden";
                return;
            }

            // Sucht im Array aller Spiele nach dem Spiel, das zum 1. Spieltag gehört.
            const firstMatch = matches.find(m =>
                // Prüft entweder die numerische ID der Spieltag-Gruppe (GroupOrderID = 1)
                m.group?.groupOrderID === 1 ||
                // ODER prüft den Namen der Gruppe auf "1. Spieltag".
                (typeof m.group?.groupName === "string" && m.group.groupName.toLowerCase().includes("1. spieltag"))
            );

            if (!firstMatch) {
                document.querySelector(".mac-book-air2-text18").textContent = "Kein Spiel gefunden";
                return;
            }

            const { team1, team2 } = firstMatch; // Destructuring: Zieht team1 und team2 aus dem firstMatch-Objekt.

            // --- Tore bestimmen 
            let goalsTeam1 = "-";
            let goalsTeam2 = "-";

            if (Array.isArray(firstMatch.matchResults) && firstMatch.matchResults.length > 0) {
                // Versucht, das offizielle Endergebnis (resultTypeID 2) zu finden.
                let endResult = firstMatch.matchResults.find(r => Number(r.resultTypeID) === 2);

                // Fallback: Wenn ID 2 fehlt, sucht es nach dem Wort "Endergebnis" im Namen.
                if (!endResult)
                    endResult = firstMatch.matchResults.find(r =>
                        typeof r.resultName === "string" && r.resultName.toLowerCase().includes("endergebnis")
                    );

                // Fallback: Wenn nichts gefunden wird, nimmt es das letzte Ergebnis im Array (oft das Endergebnis).
                if (!endResult)
                    endResult = firstMatch.matchResults[firstMatch.matchResults.length - 1];

                // Setzt die gefundenen Punkte oder bleibt bei "-" (wenn Punkte null/undefined sind).
                goalsTeam1 = endResult?.pointsTeam1 ?? "-";
                goalsTeam2 = endResult?.pointsTeam2 ?? "-";
            }

            // --- Datum formatieren ---
            const date = new Date(firstMatch.matchDateTime);
            // Formatiert das Datum in das deutsche Format (TT.MM.JJJJ).
            const dateString = date.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });

            // --- DOM-Elemente selektieren (Elemente der Detailseite) ---
            const teamRightText = document.querySelector(".mac-book-air2-text20");
            const teamLeftLogo = document.querySelector(".mac-book-air2image96-cc-nnq0ayd-abss-p0v9-lu-q96x961");
            const teamLeftText = document.querySelector(".mac-book-air2-text19");
            const teamRightLogo = document.querySelector(".mac-book-air2image4us2n-cgl6kg-zc0t3hp-w75q96x961");

            /* --- Teamnamen und Logos dynamisch einsetzen --- */
            teamLeftText.textContent = team1.shortName;
            teamLeftLogo.src = team1.teamIconUrl || placeholderImg;
            // Spezielle Korrektur-Logik für ein Team-Logo (Huddersfield).
            if(teamLeftLogo.src.includes("Huddersfield_Town"))
                teamLeftLogo.src = placeholderImg;

            teamRightText.textContent = team2.shortName;
            teamRightLogo.src = team2.teamIconUrl || placeholderImg;
            if(teamRightLogo.src.includes("Huddersfield_Town"))
                teamRightLogo.src = placeholderImg;

            // Setzt das Spielergebnis (z.B. "2:1") ein.
            document.querySelector(".mac-book-air2-text18").textContent = `${goalsTeam1}:${goalsTeam2}`;

            // Setzt das Datum ein.
            document.querySelector(".mac-book-air2-text21").textContent = dateString;

            // Setzt den Namen des Spieltags (z.B. "1. Spieltag").
            document.querySelector(".mac-book-air2-text14").textContent = firstMatch.group?.groupName ?? "";

        } catch (error) {
            console.error("API-Fehler beim Laden der Matchdetails:", error);
            document.querySelector(".mac-book-air2-text18").textContent = "API-Fehler";
        }
    }

    // Führt die Logik aus, sobald das zentrale Element der Detailseite existiert (indiziert, dass wir auf mac-book-air2.html sind).
    if (document.querySelector('.mac-book-air2-text14')) {
        loadFirstMatchDetails();
    }
});