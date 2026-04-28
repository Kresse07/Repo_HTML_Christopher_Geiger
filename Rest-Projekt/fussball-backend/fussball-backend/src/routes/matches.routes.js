const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/matches.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { idParamSchema } = require('../validators/common.schema');
const { createMatchSchema, updateMatchSchema, listMatchesQuerySchema } = require('../validators/matches.schema');

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Spiele verwalten
 *
 * /api/matches:
 *   get:
 *     summary: Alle Spiele (mit Pagination & Filter)
 *     tags: [Matches]
 *     parameters:
 *       - { in: query, name: page,     schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,    schema: { type: integer, default: 20 } }
 *       - { in: query, name: seasonId, schema: { type: integer } }
 *       - { in: query, name: teamId,   schema: { type: integer }, description: "Spiele eines Teams (Heim ODER Gast)" }
 *       - { in: query, name: status,   schema: { type: string, enum: [scheduled, live, finished, cancelled] } }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Neues Spiel anlegen
 *     tags: [Matches]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [season_id, home_team_id, away_team_id, match_date]
 *             properties:
 *               season_id:    { type: integer, example: 1 }
 *               home_team_id: { type: integer, example: 1 }
 *               away_team_id: { type: integer, example: 2 }
 *               stadium_id:   { type: integer, example: 1 }
 *               referee_id:   { type: integer, example: 1 }
 *               match_date:   { type: string, format: date-time, example: "2025-05-17T15:30:00Z" }
 *               home_score:   { type: integer, example: 0 }
 *               away_score:   { type: integer, example: 0 }
 *               status:       { type: string, enum: [scheduled, live, finished, cancelled] }
 *     responses:
 *       201: { description: Erstellt }
 *
 * /api/matches/{id}:
 *   get:
 *     summary: Einzelnes Spiel (inkl. Teams, Stadion, Schiedsrichter, Liga)
 *     tags: [Matches]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Nicht gefunden }
 *   put:
 *     summary: Spiel aktualisieren (z.B. Ergebnis eintragen)
 *     tags: [Matches]
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
 *     summary: Spiel löschen
 *     tags: [Matches]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Gelöscht }
 */

router.get('/',       validate(listMatchesQuerySchema, 'query'), ctrl.getAll);
router.get('/:id',    validate(idParamSchema, 'params'),         ctrl.getById);
router.post('/',      verifyToken, validate(createMatchSchema),  ctrl.create);
router.put('/:id',    verifyToken, validate(idParamSchema, 'params'), validate(updateMatchSchema), ctrl.update);
router.delete('/:id', verifyToken, validate(idParamSchema, 'params'), ctrl.remove);

module.exports = router;
