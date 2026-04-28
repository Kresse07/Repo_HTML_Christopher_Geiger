const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/referees.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { idParamSchema } = require('../validators/common.schema');
const { createRefereeSchema, updateRefereeSchema, listRefereesQuerySchema } = require('../validators/referees.schema');

/**
 * @swagger
 * tags:
 *   name: Referees
 *   description: Schiedsrichter verwalten
 *
 * /api/referees:
 *   get:
 *     summary: Alle Schiedsrichter (mit Pagination & Filter)
 *     tags: [Referees]
 *     parameters:
 *       - { in: query, name: page,        schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,       schema: { type: integer, default: 20 } }
 *       - { in: query, name: nationality, schema: { type: string }, description: "Nach Nationalität filtern" }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Neuen Schiedsrichter anlegen
 *     tags: [Referees]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, nationality]
 *             properties:
 *               first_name:  { type: string, example: "Pierluigi" }
 *               last_name:   { type: string, example: "Collina" }
 *               nationality: { type: string, example: "Italien" }
 *     responses:
 *       201: { description: Erstellt }
 *
 * /api/referees/{id}:
 *   get:
 *     summary: Einzelnen Schiedsrichter abrufen
 *     tags: [Referees]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Nicht gefunden }
 *   put:
 *     summary: Schiedsrichter aktualisieren
 *     tags: [Referees]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:  { type: string }
 *               last_name:   { type: string }
 *               nationality: { type: string }
 *     responses:
 *       200: { description: Aktualisiert }
 *   delete:
 *     summary: Schiedsrichter löschen
 *     tags: [Referees]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Gelöscht }
 */

router.get('/',       validate(listRefereesQuerySchema, 'query'), ctrl.getAll);
router.get('/:id',    validate(idParamSchema, 'params'),          ctrl.getById);
router.post('/',      verifyToken, validate(createRefereeSchema), ctrl.create);
router.put('/:id',    verifyToken, validate(idParamSchema, 'params'), validate(updateRefereeSchema), ctrl.update);
router.delete('/:id', verifyToken, validate(idParamSchema, 'params'), ctrl.remove);

module.exports = router;
