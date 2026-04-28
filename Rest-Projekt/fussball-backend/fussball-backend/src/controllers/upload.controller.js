// =========================================================================
//  UPLOAD-CONTROLLER
//  Nach erfolgreichem Multer-Upload wird hier der Pfad in die DB geschrieben.
//  Bei Überschreiben wird das alte Bild vom Dateisystem entfernt.
// =========================================================================

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

// Welche Entität -> welche Tabelle + welche Spalte für den Pfad
const MAPPING = {
    players: { table: 'players', column: 'portrait_path', folder: 'players' },
    teams:   { table: 'teams',   column: 'logo_path',     folder: 'teams'   },
    leagues: { table: 'leagues', column: 'logo_path',     folder: 'leagues' }
};

/**
 * Generischer Handler für POST /api/upload/:type/:id
 *     type: 'players' | 'teams' | 'leagues'
 *     id:   Datenbank-ID des Datensatzes
 */
async function handleUpload(req, res, next) {
    try {
        const { type, id } = req.params;
        const config = MAPPING[type];

        if (!config) {
            throw createError(400, `Unbekannter Upload-Typ: "${type}". Erlaubt: ${Object.keys(MAPPING).join(', ')}`);
        }
        if (!req.file) {
            throw createError(400, 'Kein Bild hochgeladen. Feldname muss "image" sein.');
        }

        // 1) Prüfen ob der Datensatz überhaupt existiert
        const [rows] = await pool.query(
            `SELECT id, ${config.column} AS current_path FROM ${config.table} WHERE id = ?`,
            [id]
        );
        if (rows.length === 0) {
            // Hochgeladene Datei wieder löschen (Aufräumen!)
            fs.unlinkSync(req.file.path);
            throw createError(404, `Datensatz mit id=${id} in ${config.table} nicht gefunden.`);
        }

        // 2) Relativen Pfad erzeugen (z.B. "/uploads/players/abc.jpg")
        const relativerPfad = `/uploads/${config.folder}/${req.file.filename}`;

        // 3) Pfad in der DB speichern
        await pool.query(
            `UPDATE ${config.table} SET ${config.column} = ? WHERE id = ?`,
            [relativerPfad, id]
        );

        // 4) Altes Bild löschen (falls vorhanden)
        const alterPfad = rows[0].current_path;
        if (alterPfad) {
            const alterFullPath = path.join(__dirname, '..', '..', alterPfad);
            if (fs.existsSync(alterFullPath)) {
                fs.unlinkSync(alterFullPath);
                console.log(`Altes Bild gelöscht: ${alterPfad}`);
            }
        }

        res.status(201).json({
            message: 'Bild erfolgreich hochgeladen.',
            type,
            id: Number(id),
            path: relativerPfad,
            url: `${req.protocol}://${req.get('host')}${relativerPfad}`
        });
    } catch (fehler) {
        next(fehler);
    }
}

module.exports = { handleUpload };
