// =========================================================================
//  AUTH-CONTROLLER
//  H3: async/await  |  H7: JWT + bcrypt
//
//  Drei Endpunkte:
//    register -> neuen Benutzer anlegen (öffentlich)
//    login    -> Token ausstellen (öffentlich)
//    me       -> Infos zum eingeloggten Benutzer (geschützt)
// =========================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

// Kosten-Faktor für bcrypt. 10 ist ein guter Kompromiss aus Sicherheit
// und Performance (eine Hash-Berechnung dauert ca. 60-100 ms).
const BCRYPT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Legt einen neuen Benutzer an (standardmäßig mit der einzigen Rolle "admin",
 * weil das Schulprojekt kein weiteres Rollen-Management vorsieht).
 */
async function register(req, res, next) {
    try {
        const { username, email, password } = req.body;

        // 1) Prüfen ob Benutzername oder E-Mail schon vergeben sind
        //    (H5: Daten aus DB mit SELECT holen - hier aus dem Pool)
        const [vorhandene] = await pool.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        if (vorhandene.length > 0) {
            throw createError(
                409,
                'Benutzername oder E-Mail-Adresse ist bereits vergeben.',
                'Duplikat'
            );
        }

        // 2) Passwort hashen (NIEMALS im Klartext speichern!)
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // 3) admin-Rolle aus der DB holen (wir haben derzeit nur diese eine)
        const [rollen] = await pool.query(
            'SELECT id FROM roles WHERE name = ?',
            ['admin']
        );
        if (rollen.length === 0) {
            throw createError(500, 'Standardrolle "admin" nicht gefunden.');
        }
        const roleId = rollen[0].id;

        // 4) Benutzer in die DB einfügen
        const [ergebnis] = await pool.query(
            `INSERT INTO users (username, email, password_hash, role_id)
             VALUES (?, ?, ?, ?)`,
            [username, email, passwordHash, roleId]
        );

        // 5) Erfolgsantwort - NIEMALS den Hash zurückgeben!
        res.status(201).json({
            message: 'Benutzer erfolgreich registriert.',
            user: {
                id: ergebnis.insertId,
                username,
                email,
                role: 'admin'
            }
        });
    } catch (fehler) {
        next(fehler);
    }
}

/**
 * POST /api/auth/login
 * Prüft Zugangsdaten und gibt ein JWT-Token zurück.
 */
async function login(req, res, next) {
    try {
        const { username, password } = req.body;

        // 1) Benutzer inkl. Rollenname aus der DB holen (JOIN)
        const [benutzer] = await pool.query(
            `SELECT u.id, u.username, u.email, u.password_hash, r.name AS role
             FROM users u
             JOIN roles r ON r.id = u.role_id
             WHERE u.username = ?`,
            [username]
        );

        // Bewusst identische Fehlermeldung bei "User existiert nicht"
        // und "Passwort falsch" - sonst könnte man Benutzernamen erraten.
        if (benutzer.length === 0) {
            throw createError(401, 'Ungültige Zugangsdaten.', 'Nicht autorisiert');
        }

        const user = benutzer[0];

        // 2) Passwort gegen den gespeicherten Hash prüfen
        const passwortKorrekt = await bcrypt.compare(password, user.password_hash);
        if (!passwortKorrekt) {
            throw createError(401, 'Ungültige Zugangsdaten.', 'Nicht autorisiert');
        }

        // 3) JWT generieren - enthält nur das Nötigste (keine Passwörter!)
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 4) Erfolgsantwort
        res.json({
            message: 'Login erfolgreich.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (fehler) {
        next(fehler);
    }
}

/**
 * GET /api/auth/me
 * Gibt Infos zum aktuell eingeloggten Benutzer zurück.
 * Benötigt ein gültiges JWT im Authorization-Header.
 */
async function me(req, res, next) {
    try {
        // req.user wurde von der verifyToken-Middleware aus dem JWT befüllt
        const [benutzer] = await pool.query(
            `SELECT u.id, u.username, u.email, u.created_at, r.name AS role
             FROM users u
             JOIN roles r ON r.id = u.role_id
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (benutzer.length === 0) {
            throw createError(404, 'Benutzer nicht mehr vorhanden.');
        }

        res.json(benutzer[0]);
    } catch (fehler) {
        next(fehler);
    }
}

module.exports = { register, login, me };
