// =========================================================================
//  MULTER-MIDDLEWARE für Bild-Uploads
//  Regeln:
//    - Nur jpg, jpeg, png, webp
//    - Max. Dateigröße: MAX_UPLOAD_MB aus .env
//    - Dateinamen: UUID + Original-Extension (verhindert Kollisionen)
//    - Bilder werden auf dem Dateisystem gespeichert, NICHT in der DB
// =========================================================================

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Erlaubte MIME-Typen
const ERLAUBTE_TYPEN = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Erstellt eine Multer-Instanz für einen bestimmten Unterordner.
 * Verwendung in Routen:
 *     const upload = createUploader('players');
 *     router.post('/upload/player/:id', upload.single('image'), ...);
 *
 * @param {'players'|'teams'|'leagues'} unterordner
 */
function createUploader(unterordner) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const ziel = path.join(__dirname, '..', '..', 'uploads', unterordner);
            cb(null, ziel);
        },
        filename: (req, file, cb) => {
            // UUID + Extension -> z.B. "f47ac10b-...-bb71.jpg"
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${uuidv4()}${ext}`);
        }
    });

    return multer({
        storage,
        limits: {
            fileSize: Number(process.env.MAX_UPLOAD_MB) * 1024 * 1024
        },
        fileFilter: (req, file, cb) => {
            if (ERLAUBTE_TYPEN.includes(file.mimetype)) {
                cb(null, true);
            } else {
                const err = new Error('Nur JPG, PNG und WEBP sind erlaubt.');
                err.statusCode = 400;
                cb(err);
            }
        }
    });
}

module.exports = { createUploader };
