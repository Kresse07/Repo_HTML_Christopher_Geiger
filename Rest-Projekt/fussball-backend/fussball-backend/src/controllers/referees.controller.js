const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

async function getAll(req, res, next) {
    try {
        const { page, limit, nationality } = req.query;
        const offset = (page - 1) * limit;

        // Optionaler Filter via req.query (H1)
        const where = [];
        const params = [];
        if (nationality) { where.push('nationality = ?'); params.push(nationality); }
        const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `SELECT * FROM referees ${whereSQL} ORDER BY last_name LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM referees ${whereSQL}`, params
        );

        res.json({ data: rows, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
    } catch (e) { next(e); }
}

async function getById(req, res, next) {
    try {
        const [rows] = await pool.query('SELECT * FROM referees WHERE id = ?', [req.params.id]);
        if (rows.length === 0) throw createError(404, 'Schiedsrichter nicht gefunden.');
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function create(req, res, next) {
    try {
        const { first_name, last_name, nationality } = req.body;
        const [r] = await pool.query(
            'INSERT INTO referees (first_name, last_name, nationality) VALUES (?, ?, ?)',
            [first_name, last_name, nationality]
        );
        const [rows] = await pool.query('SELECT * FROM referees WHERE id = ?', [r.insertId]);
        res.status(201).json(rows[0]);
    } catch (e) { next(e); }
}

async function update(req, res, next) {
    try {
        const felder = Object.keys(req.body);
        if (felder.length === 0) throw createError(400, 'Keine Felder zum Aktualisieren.');
        const setClause = felder.map(f => `${f} = ?`).join(', ');
        const werte = [...felder.map(f => req.body[f]), req.params.id];

        const [r] = await pool.query(`UPDATE referees SET ${setClause} WHERE id = ?`, werte);
        if (r.affectedRows === 0) throw createError(404, 'Schiedsrichter nicht gefunden.');

        const [rows] = await pool.query('SELECT * FROM referees WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function remove(req, res, next) {
    try {
        const [r] = await pool.query('DELETE FROM referees WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) throw createError(404, 'Schiedsrichter nicht gefunden.');
        res.status(204).send();
    } catch (e) { next(e); }
}

module.exports = { getAll, getById, create, update, remove };
