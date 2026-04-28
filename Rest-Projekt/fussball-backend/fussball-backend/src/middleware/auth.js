// =========================================================================
//  JWT-AUTHENTIFIZIERUNGS-MIDDLEWARE
//  H7: JSON-Web-Token zur Authentifizierung
//
//  Schützt Routen vor unbefugtem Zugriff. Wird so verwendet:
//      router.post('/teams', verifyToken, teamsController.create);
//
//  Der Client muss das Token im Authorization-Header mitsenden:
//      Authorization: Bearer <jwt-token>
//
//  In Swagger-UI: nach dem Login den Token per "Authorize"-Button
//  eintragen - er wird dann bei allen Requests automatisch angehängt.
// =========================================================================

const jwt = require('jsonwebtoken');

/**
 * Prüft den Authorization-Header auf ein gültiges JWT-Token.
 * Bei Erfolg: req.user enthält die decodierten Token-Daten
 *            { id, username, role, iat, exp }
 * Bei Misserfolg: HTTP 401 mit Fehlermeldung (vom errorHandler.js)
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    // Prüfen ob Header vorhanden und richtig formatiert ist
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Nicht autorisiert',
            message: 'Authorization-Header fehlt. Format: "Bearer <token>"'
        });
    }

    // "Bearer " (7 Zeichen) abschneiden
    const token = authHeader.substring(7);

    if (!token) {
        return res.status(401).json({
            error: 'Nicht autorisiert',
            message: 'Kein Token im Authorization-Header gefunden.'
        });
    }

    try {
        // jwt.verify prüft Signatur UND Ablaufdatum
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // { id, username, role, iat, exp }
        next();
    } catch (fehler) {
        // JsonWebTokenError  -> ungültige Signatur
        // TokenExpiredError  -> abgelaufen
        // Beides wird im zentralen errorHandler sauber behandelt.
        next(fehler);
    }
}

module.exports = { verifyToken };
