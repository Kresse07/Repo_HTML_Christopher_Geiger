// =========================================================================
//  JOI-VALIDIERUNGS-MIDDLEWARE
//  H6: JSON-Schema-Validator
//
//  Verwendung in Routen:
//      router.post('/login', validate(loginSchema), controller.login);
//
//  Standardmäßig wird req.body geprüft. Mit dem zweiten Parameter
//  kann man stattdessen req.params oder req.query validieren:
//      validate(idSchema, 'params')
//      validate(paginationSchema, 'query')
// =========================================================================

/**
 * Erzeugt eine Express-Middleware, die eingehende Daten gegen ein
 * Joi-Schema validiert. Bei Fehlern wird die zentrale
 * Fehler-Behandlung in errorHandler.js aktiv (err.isJoi = true).
 *
 * @param {Joi.Schema} schema - Joi-Schema zum Validieren
 * @param {'body'|'params'|'query'} quelle - welches req-Feld geprüft wird
 */
function validate(schema, quelle = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[quelle], {
            abortEarly: false,    // alle Fehler sammeln, nicht beim ersten abbrechen
            stripUnknown: true,   // unbekannte Felder entfernen (Sicherheit!)
            convert: true         // z.B. Strings "42" zu Zahlen 42 konvertieren
        });

        if (error) {
            // Der zentrale errorHandler erkennt Joi-Fehler und
            // formatiert sie sauber (HTTP 400 mit Feldliste).
            return next(error);
        }

        // Validierte, bereinigte Werte zurückschreiben -
        // z.B. werden Strings wie "5" jetzt wirklich als Number 5 behandelt.
        req[quelle] = value;
        next();
    };
}

module.exports = { validate };
