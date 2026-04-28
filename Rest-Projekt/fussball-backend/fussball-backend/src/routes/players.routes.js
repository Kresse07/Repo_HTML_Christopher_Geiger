const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/players.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { idParamSchema } = require('../validators/common.schema');
const { createPlayerSchema, updatePlayerSchema, listPlayersQuerySchema } = require('../validators/players.schema');

/**
 * @swagger
 * tags:
 *   name: Players
 *   description: Spieler verwalten
 *
 * /api/players:
 *   get:
 *     summary: Alle Spieler (mit Pagination & Filter)
 *     tags: [Players]
 *     parameters:
 *       - { in: query, name: page,        schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,       schema: { type: integer, default: 20 } }
 *       - { in: query, name: teamId,      schema: { type: integer }, description: "Filter nach Team-ID" }
 *       - { in: query, name: positionId,  schema: { type: integer }, description: "Filter nach Position-ID" }
 *       - { in: query, name: nationality, schema: { type: string } }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Neuen Spieler anlegen
 *     tags: [Players]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name]
 *             properties:
 *               first_name:    { type: string,  example: "Marko" }
 *               last_name:     { type: string,  example: "Arnautovic" }
 *               birthdate:     { type: string,  format: date, example: "1989-04-19" }
 *               nationality:   { type: string,  example: "Österreich" }
 *               team_id:       { type: integer, example: 1 }
 *               position_id:   { type: integer, example: 4 }
 *               jersey_number: { type: integer, example: 7 }
 *     responses:
 *       201: { description: Erstellt }
 *
 * /api/players/{id}:
 *   get:
 *     summary: Einzelnen Spieler abrufen (inkl. Team + Position)
 *     tags: [Players]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Nicht gefunden }
 *   put:
 *     summary: Spieler aktualisieren
 *     tags: [Players]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: Aktualisiert }
 *   delete:
 *     summary: Spieler löschen
 *     tags: [Players]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Gelöscht }
 */

router.get('/',       validate(listPlayersQuerySchema, 'query'), ctrl.getAll);
router.get('/:id',    validate(idParamSchema, 'params'),         ctrl.getById);
router.post('/',      verifyToken, validate(createPlayerSchema), ctrl.create);
router.put('/:id',    verifyToken, validate(idParamSchema, 'params'), validate(updatePlayerSchema), ctrl.update);
router.delete('/:id', verifyToken, validate(idParamSchema, 'params'), ctrl.remove);

module.exports = router;
