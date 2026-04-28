# =========================================================================
#  DOCKERFILE - Node.js Backend
#  Baut das Image für den Express-Server.
# =========================================================================

# Node 20 (LTS) auf Alpine Linux - klein, schnell, stabil
FROM node:20-slim

# Arbeitsverzeichnis im Container
WORKDIR /app

# Erst nur package.json kopieren -> besseres Caching beim Build.
# Solange sich package.json nicht ändert, wird "npm install" aus dem Cache genommen.
COPY package*.json ./

# Produktions-Abhängigkeiten installieren
RUN npm install --omit=dev

# Jetzt den restlichen Code kopieren
COPY . .

# Uploads-Ordner anlegen (falls er im Git-Repo nicht existiert)
# Die Unterordner werden beim App-Start automatisch geprüft/erstellt.
RUN mkdir -p /app/uploads/players /app/uploads/teams /app/uploads/leagues

# Standard-Port freigeben (wird von docker-compose überschrieben falls nötig)
EXPOSE 3000

# Startbefehl
CMD ["node", "src/server.js"]
