// =========================================================================
//  AUTH-ROUTEN
//  H9: Routen ausgelagert  |  H8: Swagger-Doku im JSDoc-Format
//
//  Die @swagger-Kommentare werden von swagger-jsdoc automatisch in
//  die OpenAPI-Spec umgewandelt und unter /api-docs angezeigt.
// =========================================================================

const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { registerSchema, loginSchema } = require('../validators/auth.schema');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registrierung, Login und Benutzer-Infos
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Neuen Benutzer registrieren
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: maxmustermann
 *               email:
 *                 type: string
 *                 format: email
 *                 example: max@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: geheim123
 *     responses:
 *       201:
 *         description: Benutzer wurde angelegt
 *       400:
 *         description: Validierungsfehler
 *       409:
 *         description: Benutzername oder E-Mail bereits vergeben
 */
router.post('/register', validate(registerSchema), controller.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Einloggen und JWT-Token erhalten
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login erfolgreich - enthält JWT-Token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: JWT - in Swagger-UI per "Authorize"-Button eintragen
 *                 user:
 *                   type: object
 *       400:
 *         description: Validierungsfehler
 *       401:
 *         description: Ungültige Zugangsdaten
 */
router.post('/login', validate(loginSchema), controller.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Infos zum aktuell eingeloggten Benutzer
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Benutzerdaten
 *       401:
 *         description: Nicht authentifiziert (Token fehlt oder ungültig)
 */
router.get('/me', verifyToken, controller.me);

module.exports = router;
