// =========================================================================
//  SERVER-EINSTIEGSPUNKT
//
//  Dies ist die Datei, die beim Start aufgerufen wird:
//    node src/server.js      (bzw. im Docker-Container)
//
//  Ablauf:
//    1) .env-Variablen laden (H2)
//    2) DB-Pool testen (H4) - falls DB nicht erreichbar, abbrechen
//    3) Upload-Verzeichnisse sicherstellen
//    4) Express-Server auf APP_PORT starten
// =========================================================================

// .env IMMER als Erstes laden, BEVOR andere Module geladen werden.
// Grund: andere Module (db.js, swagger.js, ...) lesen bereits process.env.
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = Number(process.env.APP_PORT) || 3000;

/**
 * Stellt sicher, dass die Upload-Ordner existieren.
 * Wichtig, weil multer sonst beim ersten Upload crasht.
 */
function bereiteUploadOrdnerVor() {
    const basis = path.join(__dirname, '..', 'uploads');
    const ordner = ['players', 'teams', 'leagues'];
    for (const name of ordner) {
        const voll = path.join(basis, name);
        if (!fs.existsSync(voll)) {
            fs.mkdirSync(voll, { recursive: true });
            console.log(`✓ Upload-Ordner erstellt: ${voll}`);
        }
    }
}

/**
 * Haupt-Startroutine - async weil wir auf die DB warten (H3).
 */
async function starteServer() {
    try {
        console.log('Starte Fussball-Verwaltungssystem...');

        // 1) Upload-Ordner vorbereiten
        bereiteUploadOrdnerVor();

        // 2) DB-Verbindung testen
        await testConnection();

        // 3) Express-Server starten
        app.listen(PORT, () => {
            console.log('');
            console.log('========================================');
            console.log(`  Server läuft auf Port ${PORT}`);
            console.log(`  API:           http://localhost:${PORT}`);
            console.log(`  Swagger-Docs:  http://localhost:${PORT}/api-docs`);
            console.log(`  Umgebung:      ${process.env.NODE_ENV}`);
            console.log('========================================');
            console.log('');
        });

    } catch (fehler) {
        console.error('✗ Server konnte nicht starten:', fehler.message);
        process.exit(1);
    }
}

// --- Graceful Shutdown (z.B. bei Ctrl+C oder Docker stop) ---------------
process.on('SIGTERM', () => {
    console.log('SIGTERM empfangen - Server fährt herunter...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT empfangen - Server fährt herunter...');
    process.exit(0);
});

// Los geht's!
starteServer();
