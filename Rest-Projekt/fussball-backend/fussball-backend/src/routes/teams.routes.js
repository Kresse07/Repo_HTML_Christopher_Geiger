const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teams.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { idParamSchema } = require('../validators/common.schema');
const { createTeamSchema, updateTeamSchema, listTeamsQuerySchema } = require('../validators/teams.schema');

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Vereine verwalten
 *
 * /api/teams:
 *   get:
 *     summary: Alle Teams (mit Pagination & Filter)
 *     tags: [Teams]
 *     parameters:
 *       - { in: query, name: page,      schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,     schema: { type: integer, default: 20 } }
 *       - { in: query, name: leagueId,  schema: { type: integer }, description: "Filter nach Liga-ID" }
 *       - { in: query, name: stadiumId, schema: { type: integer }, description: "Filter nach Stadion-ID" }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Neues Team anlegen
 *     tags: [Teams]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, league_id]
 *             properties:
 *               name:         { type: string,  example: "SK Rapid Wien" }
 *               short_name:   { type: string,  example: "RAP" }
 *               league_id:    { type: integer, example: 1 }
 *               stadium_id:   { type: integer, example: 1 }
 *               founded_year: { type: integer, example: 1899 }
 *     responses:
 *       201: { description: Erstellt }
 *       400: { description: Ungültige Referenz (league_id existiert nicht) }
 *
 * /api/teams/{id}:
 *   get:
 *     summary: Einzelnes Team (inkl. Liga + Stadion)
 *     tags: [Teams]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Nicht gefunden }
 *   put:
 *     summary: Team aktualisieren
 *     tags: [Teams]
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
 *     summary: Team löschen
 *     tags: [Teams]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Gelöscht }
 *       409: { description: Team wird noch von Spielen oder Spielern referenziert }
 */

router.get('/',       validate(listTeamsQuerySchema, 'query'), ctrl.getAll);
router.get('/:id',    validate(idParamSchema, 'params'),       ctrl.getById);
router.post('/',      verifyToken, validate(createTeamSchema), ctrl.create);
router.put('/:id',    verifyToken, validate(idParamSchema, 'params'), validate(updateTeamSchema), ctrl.update);
router.delete('/:id', verifyToken, validate(idParamSchema, 'params'), ctrl.remove);

module.exports = router;
