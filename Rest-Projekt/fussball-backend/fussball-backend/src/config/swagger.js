// =========================================================================
//  SWAGGER-KONFIGURATION
//  H8: Swagger-Dokumentation in REST-API
//
//  swagger-jsdoc liest aus den JSDoc-Kommentaren in den Routen-Dateien
//  (z.B. @swagger-Blöcke in routes/*.js) und erzeugt daraus eine
//  OpenAPI-Spezifikation. swagger-ui-express zeigt diese unter /api-docs
//  als interaktive Oberfläche an - der Lehrer kann dort direkt testen.
// =========================================================================

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Fussball-Verwaltungssystem API',
            version: '1.0.0',
            description:
                'REST-API zur Verwaltung von Ligen, Teams, Spielern, Spielen, ' +
                'Toren und Karten. Schulprojekt mit Node.js, Express und MySQL.'
        },
        servers: [
            {
                url: `http://localhost:${process.env.APP_PORT || 3000}`,
                description: 'Lokaler Docker-Server'
            }
        ],
        // JWT als Sicherheitsmechanismus deklarieren (H7).
        // Dadurch erscheint in Swagger-UI der "Authorize"-Button.
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description:
                        'Nach erfolgreichem Login per POST /api/auth/login ' +
                        'wird hier das JWT-Token ohne "Bearer "-Prefix eingefügt.'
                }
            }
        }
    },
    // Aus diesen Dateien werden die @swagger-Kommentare gelesen
    apis: [
        './src/routes/*.js'
    ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
