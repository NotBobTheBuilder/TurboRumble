DROP TABLE IF EXISTS owners;
CREATE TABLE owners(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL
);

DROP TABLE IF EXISTS bots;
CREATE TABLE bots(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,
    path    TEXT,
    size    INTEGER,
    owner   INTEGER REFERENCES owners
);

DROP TABLE IF EXISTS games;
CREATE TABLE games(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,
    type    TEXT NOT NULL,
    fieldw  INTEGER DEFAULT 800,
    fieldh  INTEGER DEFAULT 600,
    rounds  INTEGER DEFAULT 10
);

DROP TABLE IF EXISTS battles;
CREATE TABLE battles(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    game    INTEGER REFERENCES games,
    numbots INTEGER
);

DROP TABLE IF EXISTS battle_results;
CREATE TABLE battle_results(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    battle  INTEGER REFERENCES battles,
    bot     INTEGER REFERENCES bots,
    rank    INTEGER NOT NULL,
    score   INTEGER NOT NULL,
    damage  INTEGER NOT NULL,
    firsts  INTEGER NOT NULL
);

DROP TABLE IF EXISTS competitors;
CREATE TABLE competitors(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    game    INTEGER REFERENCES games,
    bot     INTEGER REFERENCES bots
);

INSERT INTO bots (name, owner) VALUES ("bot1", 1);
INSERT INTO bots (name, owner) VALUES ("bot2", 1);
INSERT INTO games (name, type) VALUES ("game1", "1v1");
INSERT INTO competitors (game, bot) VALUES (1, 1);
INSERT INTO competitors (game, bot) VALUES (1, 2);

INSERT INTO battles (game, numbots) VALUES (1, 2);
INSERT INTO battle_results(battle, bot, rank, score, damage, firsts) VALUES
            (1, 1, 1, 100, 100, 80),
            (1, 2, 2, 20, 20, 0);
