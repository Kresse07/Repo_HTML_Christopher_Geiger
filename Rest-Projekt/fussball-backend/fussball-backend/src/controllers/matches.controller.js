// =========================================================================
//  MATCHES-CONTROLLER
//  Komplexeste Entität - verknüpft Season, 2x Team, Stadium, Referee
// =========================================================================

const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

const selectWithJoins = `
    SELECT m.*,
           ht.name  AS home_team_name,  ht.short_name AS home_team_short,
           at.name  AS away_team_name,  at.short_name AS away_team_short,
           s.name   AS stadium_name,
           CONCAT(r.first_name, ' ', r.last_name) AS referee_name,
           se.year_start, se.year_end,
           l.name   AS league_name
    FROM matches m
    JOIN teams ht    ON ht.id = m.home_team_id
    JOIN teams at    ON at.id = m.away_team_id
    LEFT JOIN stadiums s ON s.id = m.stadium_id
    LEFT JOIN referees r ON r.id = m.referee_id
    JOIN seasons se  ON se.id = m.season_id
    JOIN leagues l   ON l.id = se.league_id
`;

async function getAll(req, res, next) {
    try {
        const { page, limit, seasonId, teamId, status } = req.query;
        const offset = (page - 1) * limit;
        const where = [], params = [];
        if (seasonId) { where.push('m.season_id = ?'); params.push(seasonId); }
        if (teamId)   { where.push('(m.home_team_id = ? OR m.away_team_id = ?)'); params.push(teamId, teamId); }
        if (status)   { where.push('m.status = ?'); params.push(status); }
        const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `${selectWithJoins} ${whereSQL} ORDER BY m.match_date DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM matches m ${whereSQL}`, params
        );
        res.json({ data: rows, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
    } catch (e) { next(e); }
}

async function getById(req, res, next) {
    try {
        const [rows] = await pool.query(`${selectWithJoins} WHERE m.id = ?`, [req.params.id]);
        if (rows.length === 0) throw createError(404, 'Spiel nicht gefunden.');
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function create(req, res, next) {
    try {
        const {
            season_id, home_team_id, away_team_id, stadium_id, referee_id,
            match_date, home_score, away_score, status
        } = req.body;
        const [r] = await pool.query(
            `INSERT INTO matches
             (season_id, home_team_id, away_team_id, stadium_id, referee_id,
              match_date, home_score, away_score, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                season_id, home_team_id, away_team_id,
                stadium_id || null, referee_id || null,
                match_date, home_score, away_score, status
            ]
        );
        const [rows] = await pool.query(`${selectWithJoins} WHERE m.id = ?`, [r.insertId]);
        res.status(201).json(rows[0]);
    } catch (e) { next(e); }
}

async function update(req, res, next) {
    try {
        // Bei Update: falls beide team_ids gesendet werden, prüfen dass sie verschieden sind
        if (req.body.home_team_id && req.body.away_team_id &&
            req.body.home_team_id === req.body.away_team_id) {
            throw createError(400, 'Heim- und Gastteam müssen unterschiedlich sein.');
        }

        const felder = Object.keys(req.body);
        if (felder.length === 0) throw createError(400, 'Keine Felder zum Aktualisieren.');
        const setClause = felder.map(f => `${f} = ?`).join(', ');
        const werte = [...felder.map(f => req.body[f]), req.params.id];
        const [r] = await pool.query(`UPDATE matches SET ${setClause} WHERE id = ?`, werte);
        if (r.affectedRows === 0) throw createError(404, 'Spiel nicht gefunden.');
        const [rows] = await pool.query(`${selectWithJoins} WHERE m.id = ?`, [req.params.id]);
        res.json(rows[0]);
    } catch (e) { next(e); }
}

async function remove(req, res, next) {
    try {
        const [r] = await pool.query('DELETE FROM matches WHERE id = ?', [req.params.id]);
        if (r.affectedRows === 0) throw createError(404, 'Spiel nicht gefunden.');
        res.status(204).send();
    } catch (e) { next(e); }
}

module.exports = { getAll, getById, create, update, remove };
