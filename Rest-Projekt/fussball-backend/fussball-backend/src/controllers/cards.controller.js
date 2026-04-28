const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

const selectWithJoins = `
    SELECT c.*,
           CONCAT(p.first_name, ' ', p.last_name) AS player_name,
           t.name AS player_team_name,
           m.match_date
    FROM cards c
    JOIN players p ON p.id = c.player_id
    LEFT JOIN teams t ON t.id = p.team_id
    JOIN matches m ON m.id = c.match_id
`;

async function getAll(req, res, next) {
    try {
        const { page, limit, matchId, playerId, cardType } = req.query;
        const offset = (page - 1) * limit;
        const where = [], params = [];
        if (matchId)  { where.push('c.match_id = ?');  params.push(matchId); }
        if (playerId) { where.push('c.player_id = ?'); params.push(playerId); }
        if (cardType) { where.push('c.card_type = ?'); params.push(cardType); }
        const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `${selectWithJoins} ${whereSQL} ORDER BY m.match_date DESC, c.minute LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM cards c ${whereSQL}`, params
        );
        res.json({ data: rows, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
    } catch (e) { next(e); }
}

async function getById(req, res, next) {
    try {
        const [rows] = await pool.query(`${selectWithJoins} WHERE c.id = ?`, [req.params.id]);
        if (rows.length === 0) throw createError(404, 'Karte nicht gefunden.');
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function create(req, res, next) {
    try {
        const { match_id, player_id, minute, card_type, reason } = req.body;
        const [r] = await pool.query(
            `INSERT INTO cards (match_id, player_id, minute, card_type, reason)
             VALUES (?, ?, ?, ?, ?)`,
            [match_id, player_id, minute, card_type, reason || null]
        );
        const [rows] = await pool.query(`${selectWithJoins} WHERE c.id = ?`, [r.insertId]);
        res.status(201).json(rows[0]);
    } catch (e) { next(e); }
}

async function update(req, res, next) {
    try {
        const felder = Object.keys(req.body);
        if (felder.length === 0) throw createError(400, 'Keine Felder zum Aktualisieren.');
        const setClause = felder.map(f => `${f} = ?`).join(', ');
        const werte = [...felder.map(f => req.body[f]), req.params.id];
        const [r] = await pool.query(`UPDATE cards SET ${setClause} WHERE id = ?`, werte);
        if (r.affectedRows === 0) throw createError(404, 'Karte nicht gefunden.');
        const [rows] = await pool.query(`${selectWithJoins} WHERE c.id = ?`, [req.params.id]);
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function remove(req, res, next) {
    try {
        const [r] = await pool.query('DELETE FROM cards WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) throw createError(404, 'Karte nicht gefunden.');
        res.status(204).send();
    } catch (e) { next(e); }
}

module.exports = { getAll, getById, create, update, remove };
