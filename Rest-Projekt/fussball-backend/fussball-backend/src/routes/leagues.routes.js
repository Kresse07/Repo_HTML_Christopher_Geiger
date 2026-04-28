const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leagues.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { idParamSchema } = require('../validators/common.schema');
const { createLeagueSchema, updateLeagueSchema, listLeaguesQuerySchema } = require('../validators/leagues.schema');

/**
 * @swagger
 * tags:
 *   name: Leagues
 *   description: Ligen verwalten (z.B. Bundesliga, Premier League)
 *
 * /api/leagues:
 *   get:
 *     summary: Alle Ligen (mit Pagination & Filter)
 *     tags: [Leagues]
 *     parameters:
 *       - { in: query, name: page,    schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,   schema: { type: integer, default: 20 } }
 *       - { in: query, name: country, schema: { type: string } }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Neue Liga anlegen
 *     tags: [Leagues]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, country]
 *             properties:
 *               name:    { type: string, example: "La Liga" }
 *               country: { type: string, example: "Spanien" }
 *     responses:
 *       201: { description: Erstellt }
 *
 * /api/leagues/{id}:
 *   get:
 *     summary: Einzelne Liga abrufen
 *     tags: [Leagues]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Nicht gefunden }
 *   put:
 *     summary: Liga aktualisieren
 *     tags: [Leagues]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: Aktualisiert }
 *   delete:
 *     summary: Liga löschen
 *     tags: [Leagues]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Gelöscht }
 *       409: { description: Liga wird noch von Teams verwendet }
 */

router.get('/',       validate(listLeaguesQuerySchema, 'query'), ctrl.getAll);
router.get('/:id',    validate(idParamSchema, 'params'),         ctrl.getById);
router.post('/',      verifyToken, validate(createLeagueSchema), ctrl.create);
router.put('/:id',    verifyToken, validate(idParamSchema, 'params'), validate(updateLeagueSchema), ctrl.update);
router.delete('/:id', verifyToken, validate(idParamSchema, 'params'), ctrl.remove);

module.exports = router;
