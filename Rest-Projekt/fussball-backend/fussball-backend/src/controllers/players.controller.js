const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

const selectWithJoins = `
    SELECT p.*,
           t.name  AS team_name,
           pos.name AS position_name,
           pos.short_code AS position_code
    FROM players p
    LEFT JOIN teams t      ON t.id = p.team_id
    LEFT JOIN positions pos ON pos.id = p.position_id
`;

async function getAll(req, res, next) {
    try {
        const { page, limit, teamId, positionId, nationality } = req.query;
        const offset = (page - 1) * limit;
        const where = [], params = [];
        if (teamId)      { where.push('p.team_id = ?');     params.push(teamId); }
        if (positionId)  { where.push('p.position_id = ?'); params.push(positionId); }
        if (nationality) { where.push('p.nationality = ?'); params.push(nationality); }
        const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `${selectWithJoins} ${whereSQL} ORDER BY p.last_name LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM players p ${whereSQL}`, params
        );
        res.json({ data: rows, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
    } catch (e) { next(e); }
}

async function getById(req, res, next) {
    try {
        const [rows] = await pool.query(`${selectWithJoins} WHERE p.id = ?`, [req.params.id]);
        if (rows.length === 0) throw createError(404, 'Spieler nicht gefunden.');
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function create(req, res, next) {
    try {
        const {
            first_name, last_name, birthdate, nationality,
            team_id, position_id, jersey_number
        } = req.body;
        const [r] = await pool.query(
            `INSERT INTO players
             (first_name, last_name, birthdate, nationality, team_id, position_id, jersey_number)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                first_name, last_name, birthdate || null, nationality || null,
                team_id || null, position_id || null, jersey_number || null
            ]
        );
        const [rows] = await pool.query(`${selectWithJoins} WHERE p.id = ?`, [r.insertId]);
        res.status(201).json(rows[0]);
    } catch (e) { next(e); }
}

async function update(req, res, next) {
    try {
        const felder = Object.keys(req.body);
        if (felder.length === 0) throw createError(400, 'Keine Felder zum Aktualisieren.');
        const setClause = felder.map(f => `${f} = ?`).join(', ');
        const werte = [...felder.map(f => req.body[f]), req.params.id];
        const [r] = await pool.query(`UPDATE players SET ${setClause} WHERE id = ?`, werte);
        if (r.affectedRows === 0) throw createError(404, 'Spieler nicht gefunden.');
        const [rows] = await pool.query(`${selectWithJoins} WHERE p.id = ?`, [req.params.id]);
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function remove(req, res, next) {
    try {
        const [r] = await pool.query('DELETE FROM players WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) throw createError(404, 'Spieler nicht gefunden.');
        res.status(204).send();
    } catch (e) { next(e); }
}

module.exports = { getAll, getById, create, update, remove };
