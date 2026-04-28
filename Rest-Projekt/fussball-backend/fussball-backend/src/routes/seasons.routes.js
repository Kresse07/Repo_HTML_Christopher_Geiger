const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/seasons.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { idParamSchema } = require('../validators/common.schema');
const { createSeasonSchema, updateSeasonSchema, listSeasonsQuerySchema } = require('../validators/seasons.schema');

/**
 * @swagger
 * tags:
 *   name: Seasons
 *   description: Saisons pro Liga verwalten
 *
 * /api/seasons:
 *   get:
 *     summary: Alle Saisons (mit Pagination & Filter)
 *     tags: [Seasons]
 *     parameters:
 *       - { in: query, name: page,     schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,    schema: { type: integer, default: 20 } }
 *       - { in: query, name: leagueId, schema: { type: integer } }
 *       - { in: query, name: active,   schema: { type: boolean }, description: "Nur aktive Saison" }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Neue Saison anlegen
 *     tags: [Seasons]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [league_id, year_start, year_end]
 *             properties:
 *               league_id:  { type: integer, example: 1 }
 *               year_start: { type: integer, example: 2025 }
 *               year_end:   { type: integer, example: 2026 }
 *               is_active:  { type: boolean, example: false }
 *     responses:
 *       201: { description: Erstellt }
 *
 * /api/seasons/{id}:
 *   get:
 *     summary: Einzelne Saison
 *     tags: [Seasons]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Nicht gefunden }
 *   put:
 *     summary: Saison aktualisieren
 *     tags: [Seasons]
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
 *     summary: Saison löschen
 *     tags: [Seasons]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Gelöscht }
 */

router.get('/',       validate(listSeasonsQuerySchema, 'query'), ctrl.getAll);
router.get('/:id',    validate(idParamSchema, 'params'),         ctrl.getById);
router.post('/',      verifyToken, validate(createSeasonSchema), ctrl.create);
router.put('/:id',    verifyToken, validate(idParamSchema, 'params'), validate(updateSeasonSchema), ctrl.update);
router.delete('/:id', verifyToken, validate(idParamSchema, 'params'), ctrl.remove);

module.exports = router;
