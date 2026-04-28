// =========================================================================
//  ZENTRALER FEHLER-HANDLER
//
//  Statt in jedem Controller try/catch zu schreiben, werfen die
//  Controller ihre Fehler einfach an next(err) weiter. Diese
//  Middleware fängt alles zentral ab und gibt saubere JSON-Antworten
//  mit passenden HTTP-Status-Codes zurück.
// =========================================================================

/**
 * 404-Handler: greift, wenn keine andere Route gematcht hat.
 * Muss NACH allen Routen eingehängt werden.
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({
        error: 'Nicht gefunden',
        message: `Die Route ${req.method} ${req.originalUrl} existiert nicht.`
    });
}

/**
 * Globaler Error-Handler: muss 4 Parameter haben (err, req, res, next),
 * sonst erkennt Express ihn nicht als Error-Middleware.
 */
function errorHandler(err, req, res, next) {
    // Fehler in die Konsole loggen (für Debugging)
    console.error('[FEHLER]', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // --- Joi-Validierungsfehler (H6) -----------------------------------
    if (err.isJoi) {
        return res.status(400).json({
            error: 'Validierungsfehler',
            message: 'Die gesendeten Daten sind ungültig.',
            details: err.details.map(d => ({
                feld: d.path.join('.'),
                hinweis: d.message
            }))
        });
    }

    // --- JWT-Fehler (H7) -----------------------------------------------
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Ungültiges Token',
            message: 'Das übergebene JWT-Token ist nicht gültig.'
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token abgelaufen',
            message: 'Bitte erneut einloggen.'
        });
    }

    // --- MySQL-Fehler --------------------------------------------------
    // Fremdschlüssel-Verletzung (z.B. team_id zeigt auf nicht existierendes Team)
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
        return res.status(400).json({
            error: 'Ungültige Referenz',
            message: 'Ein referenzierter Datensatz existiert nicht (z.B. team_id, league_id).'
        });
    }
    // Eintrag kann nicht gelöscht werden, weil andere Tabellen darauf verweisen
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
        return res.status(409).json({
            error: 'Löschen nicht möglich',
            message: 'Der Datensatz wird noch von anderen Tabellen referenziert.'
        });
    }
    // Duplikat (z.B. username oder email schon vergeben)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'Duplikat',
            message: 'Ein Datensatz mit diesen eindeutigen Werten existiert bereits.'
        });
    }

    // --- Multer-Upload-Fehler ------------------------------------------
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'Datei zu groß',
            message: `Die maximale Dateigröße beträgt ${process.env.MAX_UPLOAD_MB} MB.`
        });
    }

    // --- Vom Controller bewusst geworfene Fehler mit statusCode --------
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.error || 'Fehler',
            message: err.message
        });
    }

    // --- Fallback: Unbekannter Fehler (500) ----------------------------
    res.status(500).json({
        error: 'Interner Serverfehler',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Etwas ist schiefgelaufen.'
    });
}

/**
 * Helfer, um in Controllern kurz & knackig HTTP-Fehler zu werfen:
 *     throw createError(404, 'Spieler nicht gefunden');
 */
function createError(statusCode, message, errorName = null) {
    const err = new Error(message);
    err.statusCode = statusCode;
    if (errorName) err.error = errorName;
    return err;
}

module.exports = { notFoundHandler, errorHandler, createError };
