const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

const selectWithJoins = `
    SELECT s.*, l.name AS league_name, l.country AS league_country
    FROM seasons s
    JOIN leagues l ON l.id = s.league_id
`;

async function getAll(req, res, next) {
    try {
        const { page, limit, leagueId, active } = req.query;
        const offset = (page - 1) * limit;
        const where = [], params = [];
        if (leagueId)          { where.push('s.league_id = ?'); params.push(leagueId); }
        if (active !== undefined) { where.push('s.is_active = ?'); params.push(active); }
        const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `${selectWithJoins} ${whereSQL} ORDER BY s.year_start DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM seasons s ${whereSQL}`, params
        );
        res.json({ data: rows, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
    } catch (e) { next(e); }
}

async function getById(req, res, next) {
    try {
        const [rows] = await pool.query(`${selectWithJoins} WHERE s.id = ?`, [req.params.id]);
        if (rows.length === 0) throw createError(404, 'Saison nicht gefunden.');
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function create(req, res, next) {
    try {
        const { league_id, year_start, year_end, is_active } = req.body;
        const [r] = await pool.query(
            `INSERT INTO seasons (league_id, year_start, year_end, is_active)
             VALUES (?, ?, ?, ?)`,
            [league_id, year_start, year_end, is_active ? 1 : 0]
        );
        const [rows] = await pool.query(`${selectWithJoins} WHERE s.id = ?`, [r.insertId]);
        res.status(201).json(rows[0]);
    } catch (e) { next(e); }
}

async function update(req, res, next) {
    try {
        const felder = Object.keys(req.body);
        if (felder.length === 0) throw createError(400, 'Keine Felder zum Aktualisieren.');
        const setClause = felder.map(f => `${f} = ?`).join(', ');
        const werte = [...felder.map(f => req.body[f]), req.params.id];
        const [r] = await pool.query(`UPDATE seasons SET ${setClause} WHERE id = ?`, werte);
        if (r.affectedRows === 0) throw createError(404, 'Saison nicht gefunden.');
        const [rows] = await pool.query(`${selectWithJoins} WHERE s.id = ?`, [req.params.id]);
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function remove(req, res, next) {
    try {
        const [r] = await pool.query('DELETE FROM seasons WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) throw createError(404, 'Saison nicht gefunden.');
        res.status(204).send();
    } catch (e) { next(e); }
}

module.exports = { getAll, getById, create, update, remove };
