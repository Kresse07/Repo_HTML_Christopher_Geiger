// =========================================================================
//  DATENBANK-VERBINDUNG
//  H4: Verbindungspool in MySQL/MariaDB
//
//  Warum ein Pool und nicht eine einzelne Verbindung?
//  --------------------------------------------------
//  Bei jeder HTTP-Anfrage eine neue Verbindung zur DB aufzubauen wäre
//  teuer (3-Wege-Handshake, Auth, etc.). Ein Pool hält mehrere offene
//  Verbindungen bereit und gibt sie bei Bedarf aus. Nach dem Query
//  wandert die Verbindung zurück in den Pool und kann wiederverwendet
//  werden. Das ist bei vielen parallelen Requests massiv schneller.
// =========================================================================

const mysql = require('mysql2/promise');

// Pool erstellen - Werte kommen aus der .env-Datei (H2)
const pool = mysql.createPool({
    host:            process.env.DB_HOST,
    port:            Number(process.env.DB_PORT),
    user:            process.env.DB_USER,
    password:        process.env.DB_PASSWORD,
    database:        process.env.DB_NAME,

    // Pool-spezifische Einstellungen:
    waitForConnections: true,   // Anfragen warten, wenn keine Verbindung frei ist
    connectionLimit:    10,     // Maximal 10 parallele DB-Verbindungen
    queueLimit:         0,      // Keine Obergrenze für wartende Anfragen

    // Zeichensatz für Umlaute (München, Ödegaard etc.)
    charset: 'utf8mb4'
});

/**
 * Prüft beim Start, ob die Datenbank erreichbar ist.
 * Wird in server.js aufgerufen, bevor der Express-Server startet.
 */
async function testConnection() {
    const verbindung = await pool.getConnection();
    try {
        await verbindung.ping();
        console.log('✓ Datenbank-Pool erfolgreich verbunden');
    } finally {
        // Verbindung IMMER zurückgeben, auch bei Fehler
        verbindung.release();
    }
}

module.exports = { pool, testConnection };
