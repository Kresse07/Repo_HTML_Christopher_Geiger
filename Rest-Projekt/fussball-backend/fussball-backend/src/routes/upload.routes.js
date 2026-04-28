// =========================================================================
//  UPLOAD-ROUTEN
//  POST /api/upload/:type/:id  (type = players | teams | leagues)
//  Alle Upload-Endpunkte sind per JWT geschützt.
// =========================================================================

const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/auth');
const { createUploader } = require('../middleware/upload');
const { handleUpload } = require('../controllers/upload.controller');

// Drei Uploader-Instanzen, je einer pro Zielordner
const uploaderPlayers = createUploader('players');
const uploaderTeams   = createUploader('teams');
const uploaderLeagues = createUploader('leagues');

// Wählt den passenden Multer-Uploader basierend auf :type
// BEVOR multer die Datei verarbeitet.
function pickUploader(req, res, next) {
    const { type } = req.params;
    let uploader;
    if (type === 'players') uploader = uploaderPlayers;
    else if (type === 'teams')   uploader = uploaderTeams;
    else if (type === 'leagues') uploader = uploaderLeagues;
    else {
        return res.status(400).json({
            error: 'Ungültiger Typ',
            message: `Unbekannter Upload-Typ: "${type}". Erlaubt: players, teams, leagues`
        });
    }
    // single('image') -> Feldname "image" im multipart/form-data
    uploader.single('image')(req, res, next);
}

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Bild-Uploads für Spieler, Teams und Ligen
 *
 * /api/upload/{type}/{id}:
 *   post:
 *     summary: Bild für eine Entität hochladen
 *     description: |
 *       Lädt ein Bild hoch und speichert den Pfad in der Datenbank.
 *       Erlaubte Formate: JPG, PNG, WEBP. Max. Größe: siehe MAX_UPLOAD_MB.
 *       Feldname im Form-Data muss "image" sein.
 *     tags: [Upload]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: type, required: true, schema: { type: string, enum: [players, teams, leagues] } }
 *       - { in: path, name: id,   required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: Upload erfolgreich }
 *       400: { description: Falscher Dateityp oder zu groß oder fehlt }
 *       401: { description: Nicht autorisiert }
 *       404: { description: Datensatz existiert nicht }
 */
router.post('/:type/:id', verifyToken, pickUploader, handleUpload);

module.exports = router;
