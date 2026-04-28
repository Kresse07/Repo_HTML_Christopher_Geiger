// =========================================================================
//  POSITIONS-ROUTEN  (H9: ausgelagert)
// =========================================================================

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/positions.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { idParamSchema } = require('../validators/common.schema');
const {
    createPositionSchema, updatePositionSchema, listPositionsQuerySchema
} = require('../validators/positions.schema');

/**
 * @swagger
 * tags:
 *   name: Positions
 *   description: Spielerpositionen (z.B. Torwart, Stürmer)
 *
 * /api/positions:
 *   get:
 *     summary: Alle Positionen abrufen (mit Pagination)
 *     tags: [Positions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Liste der Positionen
 *   post:
 *     summary: Neue Position anlegen
 *     tags: [Positions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, short_code]
 *             properties:
 *               name:       { type: string, example: "Libero" }
 *               short_code: { type: string, example: "LIB" }
 *     responses:
 *       201: { description: Position erstellt }
 *       401: { description: Nicht autorisiert }
 *
 * /api/positions/{id}:
 *   get:
 *     summary: Einzelne Position abrufen
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Position }
 *       404: { description: Nicht gefunden }
 *   put:
 *     summary: Position aktualisieren
 *     tags: [Positions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:       { type: string }
 *               short_code: { type: string }
 *     responses:
 *       200: { description: Aktualisiert }
 *   delete:
 *     summary: Position löschen
 *     tags: [Positions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Gelöscht }
 */

// --- Öffentliche GET-Routen ---
router.get('/',    validate(listPositionsQuerySchema, 'query'), ctrl.getAll);
router.get('/:id', validate(idParamSchema, 'params'),           ctrl.getById);

// --- Geschützte POST/PUT/DELETE-Routen (H7) ---
router.post('/',      verifyToken, validate(createPositionSchema), ctrl.create);
router.put('/:id',    verifyToken, validate(idParamSchema, 'params'), validate(updatePositionSchema), ctrl.update);
router.delete('/:id', verifyToken, validate(idParamSchema, 'params'), ctrl.remove);

module.exports = router;
