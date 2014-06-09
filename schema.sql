DROP TABLE IF EXISTS owners;
CREATE TABLE owners(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    NOT NULL
);

DROP TABLE IF EXISTS bots;
CREATE TABLE bots(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,
    path    TEXT,
    owner   INTEGER REFERENCES owners
);

DROP TABLE IF EXISTS games;
CREATE TABLE games(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,
    type    TEXT NOT NULL
);

DROP TABLE IF EXISTS battles;
CREATE TABLE battles(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    NOT NULL
);

DROP TABLE IF EXISTS competitors;
CREATE TABLE competitors(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    game    INTEGER REFERENCES games,
    bot     INTEGER REFERENCES bots
);

INSERT INTO bots (name, owner) VALUES ("bot1", 1);
INSERT INTO games (name, type) VALUES ("game1", "1v1");
INSERT INTO competitors (game, bot) VALUES (1, 1);
