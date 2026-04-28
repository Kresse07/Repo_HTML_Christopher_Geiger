// =========================================================================
//  TEAMS-CONTROLLER - zeigt JOIN-Queries für verknüpfte Tabellen
// =========================================================================

const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

// JOIN-Query: liefert auch Liga-Name und Stadion-Name mit
const selectWithJoins = `
    SELECT t.*,
           l.name AS league_name,
           s.name AS stadium_name,
           s.city AS stadium_city
    FROM teams t
    JOIN leagues l  ON l.id = t.league_id
    LEFT JOIN stadiums s ON s.id = t.stadium_id
`;

async function getAll(req, res, next) {
    try {
        const { page, limit, leagueId, stadiumId } = req.query;
        const offset = (page - 1) * limit;
        const where = [], params = [];
        if (leagueId)  { where.push('t.league_id = ?');  params.push(leagueId); }
        if (stadiumId) { where.push('t.stadium_id = ?'); params.push(stadiumId); }
        const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `${selectWithJoins} ${whereSQL} ORDER BY t.name LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM teams t ${whereSQL}`, params
        );
        res.json({ data: rows, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
    } catch (e) { next(e); }
}

async function getById(req, res, next) {
    try {
        const [rows] = await pool.query(`${selectWithJoins} WHERE t.id = ?`, [req.params.id]);
        if (rows.length === 0) throw createError(404, 'Team nicht gefunden.');
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function create(req, res, next) {
    try {
        const { name, short_name, league_id, stadium_id, founded_year } = req.body;
        const [r] = await pool.query(
            `INSERT INTO teams (name, short_name, league_id, stadium_id, founded_year)
             VALUES (?, ?, ?, ?, ?)`,
            [name, short_name || null, league_id, stadium_id || null, founded_year || null]
        );
        const [rows] = await pool.query(`${selectWithJoins} WHERE t.id = ?`, [r.insertId]);
        res.status(201).json(rows[0]);
    } catch (e) { next(e); }
}

async function update(req, res, next) {
    try {
        const felder = Object.keys(req.body);
        if (felder.length === 0) throw createError(400, 'Keine Felder zum Aktualisieren.');
        const setClause = felder.map(f => `${f} = ?`).join(', ');
        const werte = [...felder.map(f => req.body[f]), req.params.id];
        const [r] = await pool.query(`UPDATE teams SET ${setClause} WHERE id = ?`, werte);
        if (r.affectedRows === 0) throw createError(404, 'Team nicht gefunden.');
        const [rows] = await pool.query(`${selectWithJoins} WHERE t.id = ?`, [req.params.id]);
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function remove(req, res, next) {
    try {
        const [r] = await pool.query('DELETE FROM teams WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) throw createError(404, 'Team nicht gefunden.');
        res.status(204).send();
    } catch (e) { next(e); }
}

module.exports = { getAll, getById, create, update, remove };
