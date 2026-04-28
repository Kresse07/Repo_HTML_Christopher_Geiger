const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cards.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { idParamSchema } = require('../validators/common.schema');
const { createCardSchema, updateCardSchema, listCardsQuerySchema } = require('../validators/cards.schema');

/**
 * @swagger
 * tags:
 *   name: Cards
 *   description: Gelbe und Rote Karten verwalten
 *
 * /api/cards:
 *   get:
 *     summary: Alle Karten (mit Pagination & Filter)
 *     tags: [Cards]
 *     parameters:
 *       - { in: query, name: page,     schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,    schema: { type: integer, default: 20 } }
 *       - { in: query, name: matchId,  schema: { type: integer } }
 *       - { in: query, name: playerId, schema: { type: integer } }
 *       - { in: query, name: cardType, schema: { type: string, enum: [yellow, red] } }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Neue Karte anlegen
 *     tags: [Cards]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [match_id, player_id, minute, card_type]
 *             properties:
 *               match_id:  { type: integer, example: 1 }
 *               player_id: { type: integer, example: 2 }
 *               minute:    { type: integer, example: 55 }
 *               card_type: { type: string, enum: [yellow, red], example: yellow }
 *               reason:    { type: string, example: "Foulspiel" }
 *     responses:
 *       201: { description: Erstellt }
 *
 * /api/cards/{id}:
 *   get:
 *     summary: Einzelne Karte
 *     tags: [Cards]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Nicht gefunden }
 *   put:
 *     summary: Karte aktualisieren
 *     tags: [Cards]
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
 *     summary: Karte löschen
 *     tags: [Cards]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Gelöscht }
 */

router.get('/',       validate(listCardsQuerySchema, 'query'), ctrl.getAll);
router.get('/:id',    validate(idParamSchema, 'params'),       ctrl.getById);
router.post('/',      verifyToken, validate(createCardSchema), ctrl.create);
router.put('/:id',    verifyToken, validate(idParamSchema, 'params'), validate(updateCardSchema), ctrl.update);
router.delete('/:id', verifyToken, validate(idParamSchema, 'params'), ctrl.remove);

module.exports = router;
