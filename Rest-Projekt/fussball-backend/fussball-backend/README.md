# Fussball-Verwaltungssystem

REST-API zur Verwaltung von Ligen, Teams, Spielern, Spielen, Toren und Karten. Schulprojekt mit **Node.js**, **Express**, **MySQL** und **Docker**.

---

## 🚀 Schnellstart

**Voraussetzung:** Docker Desktop muss laufen (Docker Engine + Docker Compose).

```bash
# Ins Projektverzeichnis wechseln
cd fussball-backend

# Alles starten (App + DB + init.sql werden automatisch aufgesetzt)
docker compose up --build -d
```

Beim ersten Start dauert es ca. 30-60 Sekunden, bis die Datenbank initialisiert ist. Danach:

- **API:** http://localhost:3000
- **Swagger-Doku:** http://localhost:3000/api-docs ← **zum Testen einfach im Browser öffnen**
- **MySQL extern:** Port `3307` (Benutzer: `fussball_user`, Passwort: `fussball_pass`)

**Stoppen:**
```bash
docker compose down           # Container stoppen, Daten bleiben erhalten
docker compose down -v        # auch Volumes löschen (DB + Uploads weg)
```

---

## 🔑 Login-Daten (aus dem Seed)

| Benutzername | Passwort | Rolle |
|---|---|---|
| `admin` | `admin123` | admin |
| `editor` | `editor123` | admin |

**Wichtig:** Ohne Login kann man nur lesen (GET). Für POST/PUT/DELETE und Uploads wird ein JWT-Token benötigt.

---

## 📋 Nachweis aller geforderten Hauptmerkmale (H1–H9)

| # | Anforderung | Umsetzung | Datei(en) |
|---|---|---|---|
| **H1** | REST-Übergabeparameter (`req.body`, `req.params`, `req.query`) | In jedem Controller, z.B. `page/limit/filter` über Query, `id` über Params, Objekte über Body | `src/controllers/*.js` |
| **H2** | Sensible Informationen schützen | Alle Secrets in `.env`, via `dotenv` geladen | `.env`, `src/server.js` |
| **H3** | async/await in Node.js | Alle Controller-Funktionen sind `async`, DB-Aufrufe mit `await` | `src/controllers/*.js` |
| **H4** | Connection Pool in MySQL | `mysql2/promise` Pool mit 10 Verbindungen | `src/config/db.js` |
| **H5** | GET-Routen aus DB | z.B. `GET /api/leagues` via Pool | `src/controllers/*.js` |
| **H6** | JSON-Schema-Validator | **Joi** mit `abortEarly: false` (sammelt alle Fehler) | `src/validators/*.js`, `src/middleware/validate.js` |
| **H7** | JWT + Passwort-Hashing | `bcryptjs` für Hash, `jsonwebtoken` für Token, Middleware prüft `Authorization: Bearer`-Header | `src/controllers/auth.controller.js`, `src/middleware/auth.js` |
| **H8** | Swagger-Doku | `swagger-jsdoc` + `swagger-ui-express` unter `/api-docs` | `src/config/swagger.js`, `@swagger`-Blöcke in Routes |
| **H9** | Routen ausgelagert | 12 Route-Dateien in `/src/routes/`, pro Entität | `src/routes/*.js` |

**Zusätzlich erfüllt:**
- ✅ **> 10 Tabellen**: 12 Tabellen (`roles`, `users`, `leagues`, `seasons`, `stadiums`, `teams`, `positions`, `players`, `referees`, `matches`, `goals`, `cards`)
- ✅ **Bilder-Handling**: Multer-Upload auf Dateisystem (Docker Volume), nur Pfad in der DB
- ✅ **Docker**: `Dockerfile` + `docker-compose.yml` + `init.sql` mit Auto-Seed

---

## 📂 Projektstruktur

```
fussball-backend/
├── docker-compose.yml       # App + MySQL-Container
├── Dockerfile               # Node-App Image
├── .env                     # Secrets (DB-Passwörter, JWT-Secret)
├── .env.example             # Vorlage ohne Secrets
├── db/
│   └── init.sql             # 12 Tabellen + Seed-Daten (auto-executed beim 1. Start)
├── uploads/                 # Docker Volume - hier landen hochgeladene Bilder
│   ├── players/
│   ├── teams/
│   └── leagues/
└── src/
    ├── server.js            # Einstiegspunkt (lädt .env, startet Server)
    ├── app.js               # Express-Konfiguration + Middleware + Routes
    ├── config/
    │   ├── db.js            # [H4] MySQL Connection Pool
    │   └── swagger.js       # [H8] OpenAPI/Swagger-Setup
    ├── middleware/
    │   ├── auth.js          # [H7] JWT-Verifikation
    │   ├── validate.js      # [H6] Joi-Middleware-Wrapper
    │   ├── upload.js        # Multer (UUID-Dateinamen, 5 MB Limit, JPG/PNG/WEBP)
    │   └── errorHandler.js  # Zentrale Fehlerbehandlung
    ├── routes/              # [H9] Alle 12 Route-Dateien
    ├── controllers/         # Business-Logik mit async/await
    └── validators/          # [H6] Joi-Schemas pro Entität
```

---

## 🔧 API-Endpunkte im Überblick

Alle Endpunkte außer Auth sind einem festen Muster folgen: `GET` (Liste + Einzel), `POST` (anlegen), `PUT` (aktualisieren), `DELETE` (löschen).

| Entität | Basis-Route | Endpunkte | Filter-Query-Params |
|---|---|---|---|
| **Auth** | `/api/auth` | `POST /register`, `POST /login`, `GET /me` | – |
| **Leagues** | `/api/leagues` | `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` | `country` |
| **Seasons** | `/api/seasons` | (wie oben) | `leagueId`, `active` |
| **Stadiums** | `/api/stadiums` | (wie oben) | `city`, `country` |
| **Teams** | `/api/teams` | (wie oben) | `leagueId`, `stadiumId` |
| **Positions** | `/api/positions` | (wie oben) | – |
| **Players** | `/api/players` | (wie oben) | `teamId`, `positionId`, `nationality` |
| **Referees** | `/api/referees` | (wie oben) | `nationality` |
| **Matches** | `/api/matches` | (wie oben) | `seasonId`, `teamId`, `status` |
| **Goals** | `/api/goals` | (wie oben) | `matchId`, `playerId` |
| **Cards** | `/api/cards` | (wie oben) | `matchId`, `playerId`, `cardType` |
| **Upload** | `/api/upload/:type/:id` | `POST` | type = `players`/`teams`/`leagues` |

Alle GET-Listen-Routen unterstützen **Pagination** via `?page=1&limit=20`.

---

## 🧪 Schnelltest mit curl

### 1) Einloggen und Token holen

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    | python -c "import sys,json;print(json.load(sys.stdin)['token'])")
echo $TOKEN
```

### 2) Öffentliche Daten abfragen (GET — kein Token nötig)

```bash
# Alle Ligen
curl http://localhost:3000/api/leagues

# Alle Bayern-Spieler (Filter über req.query)
curl "http://localhost:3000/api/players?teamId=1&limit=20"

# Spiel 1 mit allen Details (JOINs auf Teams, Stadion, Referee, Liga)
curl http://localhost:3000/api/matches/1
```

### 3) Geschützte Endpunkte (mit Token)

```bash
# Neues Team anlegen
curl -X POST http://localhost:3000/api/teams \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"SK Rapid Wien","short_name":"RAP","league_id":1,"founded_year":1899}'

# Match-Ergebnis aktualisieren
curl -X PUT http://localhost:3000/api/matches/10 \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"home_score":2,"away_score":1,"status":"finished"}'
```

### 4) Bild-Upload

```bash
# Portrait für Spieler 1 hochladen
curl -X POST http://localhost:3000/api/upload/players/1 \
    -H "Authorization: Bearer $TOKEN" \
    -F "image=@./mein-bild.jpg"

# Danach ist das Bild abrufbar unter:
# http://localhost:3000/uploads/players/<uuid>.jpg
```

---

## 🐳 Docker-Details

- **Image MySQL:** `mysql:8.0` (offiziell)
- **Image Node:** `node:20-alpine` (klein, LTS)
- **Netzwerk:** Bridge `fussball_net` (App und DB intern verbunden)
- **Healthcheck:** App startet erst, wenn `mysqladmin ping` auf DB erfolgreich ist → kein Race-Condition
- **Volumes:**
  - `fussball_mysql_data` — MySQL-Daten (bleiben erhalten)
  - `fussball_uploads_data` — hochgeladene Bilder (bleiben erhalten)

### Volume zurücksetzen (wenn Änderungen in `init.sql` neu eingespielt werden sollen)

```bash
docker compose down -v
docker compose up --build -d
```

`init.sql` wird nur einmalig beim **Erststart** der MySQL ausgeführt — nur wenn das Volume leer ist. Darum muss man es bei SQL-Änderungen löschen.

---

## 📝 Joi-Validierung in Aktion

Die API sammelt alle Validierungsfehler auf einmal (nicht nur den ersten). Beispiel:

```bash
curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"ab","email":"keinmail","password":"xy"}'
```

Antwort:
```json
{
    "error": "Validierungsfehler",
    "message": "Die gesendeten Daten sind ungültig.",
    "details": [
        { "feld": "username", "hinweis": "Der Benutzername muss mindestens 3 Zeichen lang sein." },
        { "feld": "email",    "hinweis": "Die E-Mail-Adresse ist ungültig." },
        { "feld": "password", "hinweis": "Das Passwort muss mindestens 6 Zeichen lang sein." }
    ]
}
```

---

## 🛠 Lokale Entwicklung ohne Docker (optional)

Wenn du das Projekt direkt mit Node (ohne Docker) laufen lassen willst:

```bash
# MySQL muss lokal laufen und die DB muss existieren
mysql -u root -p < db/init.sql

# Abhängigkeiten installieren
npm install

# .env anpassen: DB_HOST=127.0.0.1, DB_PORT=3306
# Dann starten:
npm start
```

---

## 📚 Eingesetzte Bibliotheken

| Paket | Zweck |
|---|---|
| `express` | Web-Framework |
| `mysql2` | MySQL-Client mit Connection Pool |
| `joi` | JSON-Schema-Validierung (H6) |
| `bcryptjs` | Passwort-Hashing (H7) |
| `jsonwebtoken` | JWT erzeugen & prüfen (H7) |
| `multer` | Datei-Uploads |
| `uuid` | Eindeutige Dateinamen beim Upload |
| `swagger-jsdoc` + `swagger-ui-express` | OpenAPI-Doku (H8) |
| `dotenv` | `.env`-Loader (H2) |
| `cors` | CORS-Header |

---

## ❓ Problembehebung

**Problem:** `docker compose up` hängt/schlägt fehl beim ersten Start.
**Lösung:** Manchmal ist Port `3306` oder `3307` auf dem Host belegt. Ändere in `.env` den Wert `DB_EXTERNAL_PORT` (z.B. auf `3308`) und starte neu.

**Problem:** Login gibt "Ungültige Zugangsdaten" zurück, obwohl `admin/admin123` verwendet wird.
**Lösung:** Das Volume enthält eine alte DB. Mit `docker compose down -v` zurücksetzen und neu hochfahren.

**Problem:** Upload landet nicht im Uploads-Ordner.
**Lösung:** Prüfen, dass das Volume `fussball_uploads_data` existiert (`docker volume ls`). Im Container liegt der Ordner unter `/app/uploads`.
