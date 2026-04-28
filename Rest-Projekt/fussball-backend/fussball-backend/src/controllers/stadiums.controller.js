const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

async function getAll(req, res, next) {
    try {
        const { page, limit, city, country } = req.query;
        const offset = (page - 1) * limit;
        const where = [], params = [];
        if (city)    { where.push('city = ?');    params.push(city); }
        if (country) { where.push('country = ?'); params.push(country); }
        const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `SELECT * FROM stadiums ${whereSQL} ORDER BY name LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM stadiums ${whereSQL}`, params);
        res.json({ data: rows, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
    } catch (e) { next(e); }
}

async function getById(req, res, next) {
    try {
        const [rows] = await pool.query('SELECT * FROM stadiums WHERE id = ?', [req.params.id]);
        if (rows.length === 0) throw createError(404, 'Stadion nicht gefunden.');
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function create(req, res, next) {
    try {
        const { name, city, capacity, country } = req.body;
        const [r] = await pool.query(
            'INSERT INTO stadiums (name, city, capacity, country) VALUES (?, ?, ?, ?)',
            [name, city, capacity, country || null]
        );
        const [rows] = await pool.query('SELECT * FROM stadiums WHERE id = ?', [r.insertId]);
        res.status(201).json(rows[0]);
    } catch (e) { next(e); }
}

async function update(req, res, next) {
    try {
        const felder = Object.keys(req.body);
        if (felder.length === 0) throw createError(400, 'Keine Felder zum Aktualisieren.');
        const setClause = felder.map(f => `${f} = ?`).join(', ');
        const werte = [...felder.map(f => req.body[f]), req.params.id];
        const [r] = await pool.query(`UPDATE stadiums SET ${setClause} WHERE id = ?`, werte);
        if (r.affectedRows === 0) throw createError(404, 'Stadion nicht gefunden.');
        const [rows] = await pool.query('SELECT * FROM stadiums WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function remove(req, res, next) {
    try {
        const [r] = await pool.query('DELETE FROM stadiums WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) throw createError(404, 'Stadion nicht gefunden.');
        res.status(204).send();
    } catch (e) { next(e); }
}

module.exports = { getAll, getById, create, update, remove };
