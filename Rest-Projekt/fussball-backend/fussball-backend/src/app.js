// =========================================================================
//  EXPRESS-APP-KONFIGURATION
//
//  Hier wird die Express-Anwendung zusammengebaut:
//    - Basis-Middleware (JSON, CORS, statische Dateien)
//    - Swagger-Dokumentation (H8)
//    - Alle Routen (H9 - ausgelagert nach /routes)
//    - Zentrale Fehler-Behandlung
//
//  Der Server wird NICHT hier gestartet, sondern in server.js.
//  Das macht spätere Tests einfacher.
// =========================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Route-Module (H9)
// Diese werden in den nächsten Schritten schrittweise befüllt.
// Bis dahin reicht es, dass die Dateien existieren.

const app = express();

// ------------------------------------------------------------------------
//  Basis-Middleware
// ------------------------------------------------------------------------

// CORS erlauben (für Postman-Tests aus dem Browser irrelevant, aber schadet nicht)
app.use(cors());

// JSON-Bodies automatisch parsen -> landet in req.body (H1)
app.use(express.json({ limit: '1mb' }));

// URL-encoded Bodies (z.B. aus Formularen) auch parsen
app.use(express.urlencoded({ extended: true }));

// Hochgeladene Bilder statisch ausliefern (unter /uploads/*)
// Damit sind die Dateien später z.B. unter
//   http://localhost:3000/uploads/players/abc.jpg
// abrufbar.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ------------------------------------------------------------------------
//  Swagger-Dokumentation unter /api-docs (H8)
//  Öffentlich erreichbar - KEIN JWT-Schutz, damit der Lehrer direkt testet.
// ------------------------------------------------------------------------
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            persistAuthorization: true  // JWT bleibt nach Page-Reload erhalten
        }
    })
);

// Rohe OpenAPI-Spec als JSON (falls jemand das Schema exportieren möchte)
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// ------------------------------------------------------------------------
//  Health-Check-Route (für Docker, Monitoring, Lehrer-Smoketest)
// ------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        name: 'Fussball-Verwaltungssystem API',
        version: '1.0.0',
        dokumentation: '/api-docs'
    });
});

// ------------------------------------------------------------------------
//  API-Routen (H9: alle ausgelagert in /routes)
// ------------------------------------------------------------------------
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/leagues',   require('./routes/leagues.routes'));
app.use('/api/seasons',   require('./routes/seasons.routes'));
app.use('/api/teams',     require('./routes/teams.routes'));
app.use('/api/stadiums',  require('./routes/stadiums.routes'));
app.use('/api/players',   require('./routes/players.routes'));
app.use('/api/positions', require('./routes/positions.routes'));
app.use('/api/referees',  require('./routes/referees.routes'));
app.use('/api/matches',   require('./routes/matches.routes'));
app.use('/api/goals',     require('./routes/goals.routes'));
app.use('/api/cards',     require('./routes/cards.routes'));
app.use('/api/upload',    require('./routes/upload.routes'));

// ------------------------------------------------------------------------
//  Fehler-Handling (MUSS ganz am Ende stehen!)
// ------------------------------------------------------------------------
app.use(notFoundHandler);   // 404 für unbekannte Routen
app.use(errorHandler);      // fängt alle Fehler ab

module.exports = app;
