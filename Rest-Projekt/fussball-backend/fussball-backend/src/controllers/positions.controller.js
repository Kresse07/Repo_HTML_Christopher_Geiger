// =========================================================================
//  POSITIONS-CONTROLLER
//  Nachweis: H1 (req.body, req.params, req.query), H3 (async/await),
//            H4 (Pool), H5 (SELECT via Pool)
// =========================================================================

const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

/** GET /api/positions?page=1&limit=20  (öffentlich, H1 via req.query) */
async function getAll(req, res, next) {
    try {
        const { page, limit } = req.query;   // bereits durch Joi konvertiert
        const offset = (page - 1) * limit;

        const [rows] = await pool.query(
            'SELECT * FROM positions ORDER BY id LIMIT ? OFFSET ?',
            [limit, offset]
        );
        const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM positions');

        res.json({
            data: rows,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (fehler) { next(fehler); }
}

/** GET /api/positions/:id  (öffentlich, H1 via req.params) */
async function getById(req, res, next) {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM positions WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) throw createError(404, 'Position nicht gefunden.');
        res.json(rows[0]);
    } catch (fehler) { next(fehler); }
}

/** POST /api/positions  (geschützt, H1 via req.body) */
async function create(req, res, next) {
    try {
        const { name, short_code } = req.body;
        const [result] = await pool.query(
            'INSERT INTO positions (name, short_code) VALUES (?, ?)',
            [name, short_code]
        );
        const [rows] = await pool.query('SELECT * FROM positions WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (fehler) { next(fehler); }
}

/** PUT /api/positions/:id  (geschützt, H1 via req.params + req.body) */
async function update(req, res, next) {
    try {
        // Dynamisches UPDATE - nur gesendete Felder werden geändert
        const felder = Object.keys(req.body);
        if (felder.length === 0) throw createError(400, 'Keine Felder zum Aktualisieren.');

        const setClause = felder.map(f => `${f} = ?`).join(', ');
        const werte = felder.map(f => req.body[f]);
        werte.push(req.params.id);

        const [result] = await pool.query(
            `UPDATE positions SET ${setClause} WHERE id = ?`,
            werte
        );
        if (result.affectedRows === 0) throw createError(404, 'Position nicht gefunden.');

        const [rows] = await pool.query('SELECT * FROM positions WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (fehler) { next(fehler); }
}

/** DELETE /api/positions/:id  (geschützt) */
async function remove(req, res, next) {
    try {
        const [result] = await pool.query('DELETE FROM positions WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) throw createError(404, 'Position nicht gefunden.');
        res.status(204).send();
    } catch (fehler) { next(fehler); }
}

module.exports = { getAll, getById, create, update, remove };
