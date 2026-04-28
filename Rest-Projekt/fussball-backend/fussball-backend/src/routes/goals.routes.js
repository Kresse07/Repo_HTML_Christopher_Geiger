const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/goals.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { idParamSchema } = require('../validators/common.schema');
const { createGoalSchema, updateGoalSchema, listGoalsQuerySchema } = require('../validators/goals.schema');

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Tore verwalten
 *
 * /api/goals:
 *   get:
 *     summary: Alle Tore (mit Pagination & Filter)
 *     tags: [Goals]
 *     parameters:
 *       - { in: query, name: page,     schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,    schema: { type: integer, default: 20 } }
 *       - { in: query, name: matchId,  schema: { type: integer } }
 *       - { in: query, name: playerId, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Neues Tor anlegen
 *     tags: [Goals]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [match_id, player_id, minute]
 *             properties:
 *               match_id:    { type: integer, example: 1 }
 *               player_id:   { type: integer, example: 9 }
 *               minute:      { type: integer, example: 42 }
 *               is_penalty:  { type: boolean, example: false }
 *               is_own_goal: { type: boolean, example: false }
 *     responses:
 *       201: { description: Erstellt }
 *
 * /api/goals/{id}:
 *   get:
 *     summary: Einzelnes Tor
 *     tags: [Goals]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Nicht gefunden }
 *   put:
 *     summary: Tor aktualisieren
 *     tags: [Goals]
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
 *     summary: Tor löschen
 *     tags: [Goals]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Gelöscht }
 */

router.get('/',       validate(listGoalsQuerySchema, 'query'), ctrl.getAll);
router.get('/:id',    validate(idParamSchema, 'params'),       ctrl.getById);
router.post('/',      verifyToken, validate(createGoalSchema), ctrl.create);
router.put('/:id',    verifyToken, validate(idParamSchema, 'params'), validate(updateGoalSchema), ctrl.update);
router.delete('/:id', verifyToken, validate(idParamSchema, 'params'), ctrl.remove);

module.exports = router;
