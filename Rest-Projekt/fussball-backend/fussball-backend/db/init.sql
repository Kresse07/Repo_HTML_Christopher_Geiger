-- =========================================================================
--  FUSSBALL-VERWALTUNGSSYSTEM - Datenbank-Initialisierung
--  Wird beim ersten Start des MySQL-Containers automatisch ausgeführt.
--  Enthält: 12 Tabellen + realistische Beispieldaten (Seed)
-- =========================================================================

-- Zeichensatz auf utf8mb4 setzen (wichtig für Umlaute in Namen wie "München")
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Datenbank auswählen (wird von docker-compose via MYSQL_DATABASE erstellt)
USE fussball_db;

-- =========================================================================
--  TABELLEN LÖSCHEN (für saubere Neuanlage, falls init.sql erneut läuft)
--  Reihenfolge wegen Foreign Keys: abhängige Tabellen zuerst!
-- =========================================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS stadiums;
DROP TABLE IF EXISTS referees;
DROP TABLE IF EXISTS seasons;
DROP TABLE IF EXISTS leagues;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
--  1) ROLES - Benutzerrollen (z.B. admin)
-- =========================================================================
CREATE TABLE roles (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
--  2) USERS - Benutzer für Login (H7: JWT + bcrypt)
-- =========================================================================
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50) NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,     -- bcrypt-Hash, NIEMALS Klartext!
    role_id       INT NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_users_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
--  3) LEAGUES - Ligen (z.B. Bundesliga, Premier League)
-- =========================================================================
CREATE TABLE leagues (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    country    VARCHAR(50) NOT NULL,
    logo_path  VARCHAR(255),                 -- Pfad zum Logo im Dateisystem
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
--  4) SEASONS - Saisons pro Liga (1 Liga : N Saisons)
-- =========================================================================
CREATE TABLE seasons (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    league_id  INT NOT NULL,
    year_start INT NOT NULL,                 -- z.B. 2024
    year_end   INT NOT NULL,                 -- z.B. 2025
    is_active  BOOLEAN DEFAULT FALSE,        -- aktuelle Saison
    CONSTRAINT fk_seasons_league FOREIGN KEY (league_id) REFERENCES leagues(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uk_season (league_id, year_start, year_end),
    INDEX idx_seasons_league (league_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
--  5) STADIUMS - Stadien
-- =========================================================================
CREATE TABLE stadiums (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    city     VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    country  VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
--  6) TEAMS - Vereine (N:1 Liga, N:1 Stadion)
-- =========================================================================
CREATE TABLE teams (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    short_name   VARCHAR(10),
    league_id    INT NOT NULL,
    stadium_id   INT,
    founded_year INT,
    logo_path    VARCHAR(255),               -- Pfad zum Team-Logo
    CONSTRAINT fk_teams_league FOREIGN KEY (league_id) REFERENCES leagues(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_teams_stadium FOREIGN KEY (stadium_id) REFERENCES stadiums(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_teams_league (league_id),
    INDEX idx_teams_stadium (stadium_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
--  7) POSITIONS - Spielerpositionen (z.B. Torwart, Stürmer)
-- =========================================================================
CREATE TABLE positions (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(50) NOT NULL UNIQUE,    -- z.B. "Torwart"
    short_code VARCHAR(5) NOT NULL UNIQUE     -- z.B. "GK"
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
--  8) PLAYERS - Spieler (N:1 Team, N:1 Position)
-- =========================================================================
CREATE TABLE players (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    first_name     VARCHAR(50) NOT NULL,
    last_name      VARCHAR(50) NOT NULL,
    birthdate      DATE,
    nationality    VARCHAR(50),
    team_id        INT,
    position_id    INT,
    jersey_number  INT,
    portrait_path  VARCHAR(255),              -- Pfad zum Spielerfoto
    CONSTRAINT fk_players_team FOREIGN KEY (team_id) REFERENCES teams(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_players_position FOREIGN KEY (position_id) REFERENCES positions(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_players_team (team_id),
    INDEX idx_players_position (position_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
--  9) REFEREES - Schiedsrichter
-- =========================================================================
CREATE TABLE referees (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(50) NOT NULL,
    last_name   VARCHAR(50) NOT NULL,
    nationality VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 10) MATCHES - Spiele (verbindet Saison, Teams, Stadion, Schiedsrichter)
-- =========================================================================
CREATE TABLE matches (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    season_id    INT NOT NULL,
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    stadium_id   INT,
    referee_id   INT,
    match_date   DATETIME NOT NULL,
    home_score   INT DEFAULT 0,
    away_score   INT DEFAULT 0,
    status       ENUM('scheduled','live','finished','cancelled') DEFAULT 'scheduled',
    CONSTRAINT fk_matches_season FOREIGN KEY (season_id) REFERENCES seasons(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_matches_home FOREIGN KEY (home_team_id) REFERENCES teams(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_matches_away FOREIGN KEY (away_team_id) REFERENCES teams(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_matches_stadium FOREIGN KEY (stadium_id) REFERENCES stadiums(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_matches_referee FOREIGN KEY (referee_id) REFERENCES referees(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    -- Hinweis: Die Regel "home_team_id <> away_team_id" wird via Joi im Backend validiert
    INDEX idx_matches_season (season_id),
    INDEX idx_matches_home (home_team_id),
    INDEX idx_matches_away (away_team_id),
    INDEX idx_matches_date (match_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 11) GOALS - Tore (ein Match hat N Tore)
-- =========================================================================
CREATE TABLE goals (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    match_id   INT NOT NULL,
    player_id  INT NOT NULL,
    minute     INT NOT NULL,                  -- Spielminute (1-120)
    is_penalty BOOLEAN DEFAULT FALSE,
    is_own_goal BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_goals_match FOREIGN KEY (match_id) REFERENCES matches(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_goals_player FOREIGN KEY (player_id) REFERENCES players(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_goals_match (match_id),
    INDEX idx_goals_player (player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 12) CARDS - Karten (Gelb/Rot)
-- =========================================================================
CREATE TABLE cards (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    match_id  INT NOT NULL,
    player_id INT NOT NULL,
    minute    INT NOT NULL,
    card_type ENUM('yellow','red') NOT NULL,
    reason    VARCHAR(255),
    CONSTRAINT fk_cards_match FOREIGN KEY (match_id) REFERENCES matches(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cards_player FOREIGN KEY (player_id) REFERENCES players(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_cards_match (match_id),
    INDEX idx_cards_player (player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================================
--  SEED-DATEN - Beispieldaten für sofortiges Testen
-- =========================================================================

-- --- ROLES ---------------------------------------------------------------
INSERT INTO roles (id, name, description) VALUES
    (1, 'admin', 'Vollzugriff auf alle Endpunkte');

-- --- USERS --------------------------------------------------------------
-- Login-Daten:
--   admin / admin123
--   editor / editor123
-- (Hashes wurden mit bcryptjs, saltRounds=10 erzeugt)
INSERT INTO users (id, username, email, password_hash, role_id) VALUES
    (1, 'admin', 'admin@fussball.local',
     '$2b$10$AGvGlgQDc59FHwLMNjyN0ubwN3f3frDRDFzb.JyTitD3H3UxzqgHO', 1),
    (2, 'editor', 'editor@fussball.local',
     '$2b$10$Kr6K.VX8DmZZSRJGYf.Y5OybB7s.wfDn3/r/MMZwLDsqDTEAKTX4K', 1);

-- --- LEAGUES ------------------------------------------------------------
INSERT INTO leagues (id, name, country, logo_path) VALUES
    (1, 'Bundesliga', 'Deutschland', NULL),
    (2, 'Premier League', 'England', NULL);

-- --- SEASONS ------------------------------------------------------------
INSERT INTO seasons (id, league_id, year_start, year_end, is_active) VALUES
    (1, 1, 2024, 2025, TRUE),
    (2, 1, 2023, 2024, FALSE),
    (3, 2, 2024, 2025, TRUE);

-- --- STADIUMS -----------------------------------------------------------
INSERT INTO stadiums (id, name, city, capacity, country) VALUES
    (1, 'Allianz Arena',       'München',    75024, 'Deutschland'),
    (2, 'Signal Iduna Park',   'Dortmund',   81365, 'Deutschland'),
    (3, 'Red Bull Arena',      'Leipzig',    47069, 'Deutschland'),
    (4, 'BayArena',            'Leverkusen', 30210, 'Deutschland'),
    (5, 'Etihad Stadium',      'Manchester', 53400, 'England'),
    (6, 'Anfield',             'Liverpool',  53394, 'England'),
    (7, 'Emirates Stadium',    'London',     60704, 'England'),
    (8, 'Stamford Bridge',     'London',     40173, 'England');

-- --- TEAMS (8 Teams, 4 pro Liga) ---------------------------------------
INSERT INTO teams (id, name, short_name, league_id, stadium_id, founded_year, logo_path) VALUES
    (1, 'FC Bayern München',    'FCB',  1, 1, 1900, NULL),
    (2, 'Borussia Dortmund',    'BVB',  1, 2, 1909, NULL),
    (3, 'RB Leipzig',           'RBL',  1, 3, 2009, NULL),
    (4, 'Bayer 04 Leverkusen',  'B04',  1, 4, 1904, NULL),
    (5, 'Manchester City',      'MCI',  2, 5, 1880, NULL),
    (6, 'Liverpool FC',         'LIV',  2, 6, 1892, NULL),
    (7, 'Arsenal FC',           'ARS',  2, 7, 1886, NULL),
    (8, 'Chelsea FC',           'CHE',  2, 8, 1905, NULL);

-- --- POSITIONS ----------------------------------------------------------
INSERT INTO positions (id, name, short_code) VALUES
    (1, 'Torwart',      'GK'),
    (2, 'Verteidiger',  'DEF'),
    (3, 'Mittelfeld',   'MID'),
    (4, 'Stürmer',      'FWD');

-- --- PLAYERS (11 pro Team = 88 Spieler) --------------------------------
-- Team 1: FC Bayern München
INSERT INTO players (first_name, last_name, birthdate, nationality, team_id, position_id, jersey_number) VALUES
    ('Manuel',    'Neuer',      '1986-03-27', 'Deutschland', 1, 1,  1),
    ('Joshua',    'Kimmich',    '1995-02-08', 'Deutschland', 1, 3,  6),
    ('Dayot',     'Upamecano',  '1998-10-27', 'Frankreich',  1, 2,  2),
    ('Kim',       'Min-jae',    '1996-11-15', 'Südkorea',    1, 2,  3),
    ('Alphonso',  'Davies',     '2000-11-02', 'Kanada',      1, 2, 19),
    ('Leon',      'Goretzka',   '1995-02-06', 'Deutschland', 1, 3,  8),
    ('Jamal',     'Musiala',    '2003-02-26', 'Deutschland', 1, 3, 42),
    ('Thomas',    'Müller',     '1989-09-13', 'Deutschland', 1, 4, 25),
    ('Harry',     'Kane',       '1993-07-28', 'England',     1, 4,  9),
    ('Leroy',     'Sané',       '1996-01-11', 'Deutschland', 1, 4, 10),
    ('Serge',     'Gnabry',     '1995-07-14', 'Deutschland', 1, 4,  7);

-- Team 2: Borussia Dortmund
INSERT INTO players (first_name, last_name, birthdate, nationality, team_id, position_id, jersey_number) VALUES
    ('Gregor',    'Kobel',      '1997-12-06', 'Schweiz',     2, 1,  1),
    ('Mats',      'Hummels',    '1988-12-16', 'Deutschland', 2, 2, 15),
    ('Niklas',    'Süle',       '1995-09-03', 'Deutschland', 2, 2, 25),
    ('Nico',      'Schlotterbeck','1999-12-01','Deutschland',2, 2,  4),
    ('Julian',    'Ryerson',    '1997-11-17', 'Norwegen',    2, 2, 26),
    ('Emre',      'Can',        '1994-01-12', 'Deutschland', 2, 3, 23),
    ('Marcel',    'Sabitzer',   '1994-03-17', 'Österreich',  2, 3, 20),
    ('Julian',    'Brandt',     '1996-05-02', 'Deutschland', 2, 3, 19),
    ('Karim',     'Adeyemi',    '2002-01-18', 'Deutschland', 2, 4, 27),
    ('Donyell',   'Malen',      '1999-01-19', 'Niederlande', 2, 4, 21),
    ('Niclas',    'Füllkrug',   '1993-02-09', 'Deutschland', 2, 4, 14);

-- Team 3: RB Leipzig
INSERT INTO players (first_name, last_name, birthdate, nationality, team_id, position_id, jersey_number) VALUES
    ('Péter',     'Gulácsi',    '1990-05-06', 'Ungarn',      3, 1,  1),
    ('Willi',     'Orbán',      '1992-11-03', 'Ungarn',      3, 2,  4),
    ('Mohamed',   'Simakan',    '2000-05-03', 'Frankreich',  3, 2,  2),
    ('David',     'Raum',       '1998-04-22', 'Deutschland', 3, 2, 22),
    ('Benjamin',  'Henrichs',   '1997-02-23', 'Deutschland', 3, 2, 39),
    ('Xaver',     'Schlager',   '1997-09-28', 'Österreich',  3, 3,  7),
    ('Kevin',     'Kampl',      '1990-10-09', 'Slowenien',   3, 3, 44),
    ('Dani',      'Olmo',       '1998-05-07', 'Spanien',     3, 3, 25),
    ('Loïs',      'Openda',     '2000-02-16', 'Belgien',     3, 4, 11),
    ('Benjamin',  'Sesko',      '2003-05-31', 'Slowenien',   3, 4, 30),
    ('Xavi',      'Simons',     '2003-04-21', 'Niederlande', 3, 3, 20);

-- Team 4: Bayer 04 Leverkusen
INSERT INTO players (first_name, last_name, birthdate, nationality, team_id, position_id, jersey_number) VALUES
    ('Lukáš',     'Hrádecký',   '1989-11-24', 'Finnland',    4, 1,  1),
    ('Jonathan',  'Tah',        '1996-02-11', 'Deutschland', 4, 2,  4),
    ('Edmond',    'Tapsoba',    '1999-02-02', 'Burkina Faso',4, 2,  3),
    ('Odilon',    'Kossounou',  '2001-01-04', 'Elfenbeink.', 4, 2, 25),
    ('Alejandro', 'Grimaldo',   '1995-09-20', 'Spanien',     4, 2, 20),
    ('Granit',    'Xhaka',      '1992-09-27', 'Schweiz',     4, 3, 34),
    ('Exequiel',  'Palacios',   '1998-10-05', 'Argentinien', 4, 3, 25),
    ('Florian',   'Wirtz',      '2003-05-03', 'Deutschland', 4, 3, 10),
    ('Jeremie',   'Frimpong',   '2000-12-10', 'Niederlande', 4, 2, 30),
    ('Victor',    'Boniface',   '2000-12-23', 'Nigeria',     4, 4, 22),
    ('Patrik',    'Schick',     '1996-01-24', 'Tschechien',  4, 4, 14);

-- Team 5: Manchester City
INSERT INTO players (first_name, last_name, birthdate, nationality, team_id, position_id, jersey_number) VALUES
    ('Ederson',   'Moraes',     '1993-08-17', 'Brasilien',   5, 1, 31),
    ('Kyle',      'Walker',     '1990-05-28', 'England',     5, 2,  2),
    ('Rúben',     'Dias',       '1997-05-14', 'Portugal',    5, 2,  3),
    ('John',      'Stones',     '1994-05-28', 'England',     5, 2,  5),
    ('Joško',     'Gvardiol',   '2002-01-23', 'Kroatien',    5, 2, 24),
    ('Rodri',     'Hernández',  '1996-06-22', 'Spanien',     5, 3, 16),
    ('Kevin',     'De Bruyne',  '1991-06-28', 'Belgien',     5, 3, 17),
    ('Bernardo',  'Silva',      '1994-08-10', 'Portugal',    5, 3, 20),
    ('Phil',      'Foden',      '2000-05-28', 'England',     5, 3, 47),
    ('Erling',    'Haaland',    '2000-07-21', 'Norwegen',    5, 4,  9),
    ('Jack',      'Grealish',   '1995-09-10', 'England',     5, 4, 10);

-- Team 6: Liverpool FC
INSERT INTO players (first_name, last_name, birthdate, nationality, team_id, position_id, jersey_number) VALUES
    ('Alisson',   'Becker',     '1992-10-02', 'Brasilien',   6, 1,  1),
    ('Trent',     'Alexander-Arnold','1998-10-07','England', 6, 2, 66),
    ('Virgil',    'van Dijk',   '1991-07-08', 'Niederlande', 6, 2,  4),
    ('Ibrahima',  'Konaté',     '1999-05-25', 'Frankreich',  6, 2,  5),
    ('Andrew',    'Robertson',  '1994-03-11', 'Schottland',  6, 2, 26),
    ('Alexis',    'Mac Allister','1998-12-24','Argentinien', 6, 3, 10),
    ('Dominik',   'Szoboszlai', '2000-10-25', 'Ungarn',      6, 3,  8),
    ('Curtis',    'Jones',      '2001-01-30', 'England',     6, 3, 17),
    ('Mohamed',   'Salah',      '1992-06-15', 'Ägypten',     6, 4, 11),
    ('Darwin',    'Núñez',      '1999-06-24', 'Uruguay',     6, 4,  9),
    ('Luis',      'Díaz',       '1997-01-13', 'Kolumbien',   6, 4,  7);

-- Team 7: Arsenal FC
INSERT INTO players (first_name, last_name, birthdate, nationality, team_id, position_id, jersey_number) VALUES
    ('David',     'Raya',       '1995-09-15', 'Spanien',     7, 1,  1),
    ('Ben',       'White',      '1997-10-08', 'England',     7, 2,  4),
    ('William',   'Saliba',     '2001-03-24', 'Frankreich',  7, 2,  2),
    ('Gabriel',   'Magalhães',  '1997-12-19', 'Brasilien',   7, 2,  6),
    ('Oleksandr', 'Zinchenko',  '1996-12-15', 'Ukraine',     7, 2, 35),
    ('Declan',    'Rice',       '1999-01-14', 'England',     7, 3, 41),
    ('Martin',    'Ødegaard',   '1998-12-17', 'Norwegen',    7, 3,  8),
    ('Kai',       'Havertz',    '1999-06-11', 'Deutschland', 7, 3, 29),
    ('Bukayo',    'Saka',       '2001-09-05', 'England',     7, 4,  7),
    ('Gabriel',   'Jesus',      '1997-04-03', 'Brasilien',   7, 4,  9),
    ('Gabriel',   'Martinelli', '2001-06-18', 'Brasilien',   7, 4, 11);

-- Team 8: Chelsea FC
INSERT INTO players (first_name, last_name, birthdate, nationality, team_id, position_id, jersey_number) VALUES
    ('Robert',    'Sánchez',    '1997-11-18', 'Spanien',     8, 1,  1),
    ('Reece',     'James',      '1999-12-08', 'England',     8, 2, 24),
    ('Thiago',    'Silva',      '1984-09-22', 'Brasilien',   8, 2,  6),
    ('Levi',      'Colwill',    '2003-02-26', 'England',     8, 2,  6),
    ('Ben',       'Chilwell',   '1996-12-21', 'England',     8, 2, 21),
    ('Enzo',      'Fernández',  '2001-01-17', 'Argentinien', 8, 3,  8),
    ('Moisés',    'Caicedo',    '2001-11-02', 'Ecuador',     8, 3, 25),
    ('Conor',     'Gallagher',  '2000-02-06', 'England',     8, 3, 23),
    ('Cole',      'Palmer',     '2002-05-06', 'England',     8, 4, 20),
    ('Nicolas',   'Jackson',    '2001-06-20', 'Senegal',     8, 4, 15),
    ('Raheem',    'Sterling',   '1994-12-08', 'England',     8, 4,  7);

-- --- REFEREES -----------------------------------------------------------
INSERT INTO referees (id, first_name, last_name, nationality) VALUES
    (1, 'Felix',   'Zwayer',   'Deutschland'),
    (2, 'Daniel',  'Siebert',  'Deutschland'),
    (3, 'Deniz',   'Aytekin',  'Deutschland'),
    (4, 'Michael', 'Oliver',   'England'),
    (5, 'Anthony', 'Taylor',   'England');

-- --- MATCHES (10 Spiele mit Ergebnissen) --------------------------------
INSERT INTO matches (id, season_id, home_team_id, away_team_id, stadium_id, referee_id, match_date, home_score, away_score, status) VALUES
    -- Bundesliga Saison 2024/25
    (1, 1, 1, 2, 1, 1, '2024-09-14 18:30:00', 3, 1, 'finished'),  -- Bayern vs Dortmund
    (2, 1, 3, 4, 3, 2, '2024-09-21 15:30:00', 1, 2, 'finished'),  -- Leipzig vs Leverkusen
    (3, 1, 2, 3, 2, 3, '2024-09-28 18:30:00', 2, 2, 'finished'),  -- Dortmund vs Leipzig
    (4, 1, 4, 1, 4, 1, '2024-10-05 15:30:00', 1, 1, 'finished'),  -- Leverkusen vs Bayern
    (5, 1, 1, 3, 1, 2, '2024-10-19 18:30:00', 2, 0, 'finished'),  -- Bayern vs Leipzig
    -- Premier League Saison 2024/25
    (6, 3, 5, 6, 5, 4, '2024-09-15 17:00:00', 2, 1, 'finished'),  -- Man City vs Liverpool
    (7, 3, 7, 8, 7, 5, '2024-09-22 16:30:00', 3, 0, 'finished'),  -- Arsenal vs Chelsea
    (8, 3, 6, 7, 6, 4, '2024-09-29 17:00:00', 2, 2, 'finished'),  -- Liverpool vs Arsenal
    (9, 3, 8, 5, 8, 5, '2024-10-06 14:00:00', 1, 4, 'finished'),  -- Chelsea vs Man City
    (10, 3, 5, 7, 5, 4, '2024-10-20 17:30:00', 0, 0, 'scheduled'); -- Man City vs Arsenal (noch nicht gespielt)

-- --- GOALS (Tore zu gespielten Matches) ---------------------------------
INSERT INTO goals (match_id, player_id, minute, is_penalty, is_own_goal) VALUES
    -- Match 1: Bayern 3:1 Dortmund
    (1, 9, 15, FALSE, FALSE),   -- Kane
    (1, 7, 34, FALSE, FALSE),   -- Musiala
    (1, 22, 67, FALSE, FALSE),  -- Füllkrug (Dortmund)
    (1, 9, 82, TRUE, FALSE),    -- Kane Elfmeter
    -- Match 2: Leipzig 1:2 Leverkusen
    (2, 31, 23, FALSE, FALSE),  -- Openda (Leipzig)
    (2, 41, 56, FALSE, FALSE),  -- Wirtz
    (2, 43, 78, FALSE, FALSE),  -- Boniface
    -- Match 3: Dortmund 2:2 Leipzig
    (3, 19, 12, FALSE, FALSE),  -- Brandt
    (3, 31, 38, FALSE, FALSE),  -- Openda
    (3, 22, 61, FALSE, FALSE),  -- Füllkrug
    (3, 32, 89, TRUE, FALSE),   -- Sesko Elfmeter
    -- Match 4: Leverkusen 1:1 Bayern
    (4, 41, 27, FALSE, FALSE),  -- Wirtz
    (4, 7, 73, FALSE, FALSE),   -- Musiala
    -- Match 5: Bayern 2:0 Leipzig
    (5, 9, 18, FALSE, FALSE),   -- Kane
    (5, 10, 54, FALSE, FALSE),  -- Sané
    -- Match 6: Man City 2:1 Liverpool
    (6, 54, 21, FALSE, FALSE),  -- Haaland
    (6, 64, 48, FALSE, FALSE),  -- Salah
    (6, 54, 76, FALSE, FALSE),  -- Haaland
    -- Match 7: Arsenal 3:0 Chelsea
    (7, 75, 14, FALSE, FALSE),  -- Saka
    (7, 74, 39, FALSE, FALSE),  -- Havertz
    (7, 77, 67, FALSE, FALSE),  -- Martinelli
    -- Match 8: Liverpool 2:2 Arsenal
    (8, 64, 11, FALSE, FALSE),  -- Salah
    (8, 73, 29, FALSE, FALSE),  -- Ødegaard
    (8, 65, 58, FALSE, FALSE),  -- Núñez
    (8, 75, 84, TRUE, FALSE),   -- Saka Elfmeter
    -- Match 9: Chelsea 1:4 Man City
    (9, 54, 9, FALSE, FALSE),   -- Haaland
    (9, 54, 33, FALSE, FALSE),  -- Haaland
    (9, 86, 52, FALSE, FALSE),  -- Palmer
    (9, 51, 71, FALSE, FALSE),  -- De Bruyne
    (9, 54, 88, FALSE, FALSE);  -- Haaland (Hattrick+)

-- --- CARDS (Gelb-/Rot-Karten zu Matches) --------------------------------
INSERT INTO cards (match_id, player_id, minute, card_type, reason) VALUES
    (1, 13,  28, 'yellow', 'Taktisches Foul'),
    (1, 17,  55, 'yellow', 'Meckern'),
    (1, 2,   71, 'yellow', 'Foulspiel'),
    (2, 31,  44, 'yellow', 'Foulspiel'),
    (2, 34,  63, 'yellow', 'Handspiel'),
    (3, 18,  22, 'yellow', 'Taktisches Foul'),
    (3, 29,  77, 'red',    'Notbremse'),
    (4, 41,  15, 'yellow', 'Foulspiel'),
    (5, 27,  49, 'yellow', 'Meckern'),
    (6, 58,  35, 'yellow', 'Foulspiel'),
    (6, 63,  68, 'yellow', 'Taktisches Foul'),
    (7, 87,  41, 'yellow', 'Foulspiel'),
    (7, 84,  79, 'red',    'Grobes Foulspiel'),
    (8, 62,  50, 'yellow', 'Foulspiel'),
    (9, 85,  25, 'yellow', 'Handspiel'),
    (9, 83,  60, 'yellow', 'Meckern');

-- =========================================================================
--  FERTIG! Datenbank ist einsatzbereit.
-- =========================================================================
