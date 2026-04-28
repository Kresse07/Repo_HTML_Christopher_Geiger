const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stadiums.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { idParamSchema } = require('../validators/common.schema');
const { createStadiumSchema, updateStadiumSchema, listStadiumsQuerySchema } = require('../validators/stadiums.schema');

/**
 * @swagger
 * tags:
 *   name: Stadiums
 *   description: Stadien verwalten
 *
 * /api/stadiums:
 *   get:
 *     summary: Alle Stadien (mit Pagination & Filter)
 *     tags: [Stadiums]
 *     parameters:
 *       - { in: query, name: page,    schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,   schema: { type: integer, default: 20 } }
 *       - { in: query, name: city,    schema: { type: string } }
 *       - { in: query, name: country, schema: { type: string } }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Neues Stadion anlegen
 *     tags: [Stadiums]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, city, capacity]
 *             properties:
 *               name:     { type: string,  example: "Wembley Stadium" }
 *               city:     { type: string,  example: "London" }
 *               capacity: { type: integer, example: 90000 }
 *               country:  { type: string,  example: "England" }
 *     responses:
 *       201: { description: Erstellt }
 *
 * /api/stadiums/{id}:
 *   get:
 *     summary: Einzelnes Stadion abrufen
 *     tags: [Stadiums]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Nicht gefunden }
 *   put:
 *     summary: Stadion aktualisieren
 *     tags: [Stadiums]
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
 *     summary: Stadion löschen
 *     tags: [Stadiums]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Gelöscht }
 */

router.get('/',       validate(listStadiumsQuerySchema, 'query'), ctrl.getAll);
router.get('/:id',    validate(idParamSchema, 'params'),          ctrl.getById);
router.post('/',      verifyToken, validate(createStadiumSchema), ctrl.create);
router.put('/:id',    verifyToken, validate(idParamSchema, 'params'), validate(updateStadiumSchema), ctrl.update);
router.delete('/:id', verifyToken, validate(idParamSchema, 'params'), ctrl.remove);

module.exports = router;
