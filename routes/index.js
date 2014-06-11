var async  = require('async'),
    path   = require('path'),
    fs     = require('fs'),

    models = require('../models');

function validAPI(req, res, next) {
    if (req.param('version') !== "1") {
        return res.send(400, "API Version unsupported");
    } else if (req.param('game') === undefined) {
        return res.send(400, "Client must specificy game");
    }

    models.Game.forge({name: req.param('game')}).fetch({
        withRelated: ["bots"]
    }).exec(
        function(err, game) {
            if(game === null) {
                return res.send(404, "Game Not Found");
            }
            req.game = game;
            next();
        }
    );
}

function fetchColl(model, cb) {
    function fetch(cb) { model.collection().fetch().exec(cb); }
    if (cb === undefined)
        return fetch;
    fetch(cb);
}

module.exports = function(app) {
    app.param('bot', function(req, res, next, id) {
        models.Bot.forge({
            name: id
        }).fetch({
            withRelated: ['games', 'battles']
        }).exec(function(err, bot) {
            req.params.bot = bot;
            next();
        });
    });

    app.param('game', function(req, res, next, id) {
        models.Game.forge({
            name: id
        }).fetch({
            withRelated: ['bots', 'battles', 'battles.results']
        }).exec(function(err, game) {
            req.params.game = game;
            next();
        });
    });

    app.get('/', function(req, res) {
        async.parallel({
                'bots': fetchColl(models.Bot),
                'games': fetchColl(models.Game),
                'owners': fetchColl(models.Owner)
            }, function (err, results) {
                results.url = req.protocol + '://' + req.get('host') + '/';
                res.format({
                    'text/html': function () {
                        res.render('index.html', JSON.stringify(results));
                    },
                    'application/json': function() {
                        res.json(results);
                    }
                });
            }
        );
    });

    app.get('/bots', function(req, res) {
        fetchColl(models.Bot, function(err, bots) {
            res.format({
                'application/json': function() {
                    res.json(bots);
                }
            });
        });
    });

    app.get('/bots/:bot', function(req, res) {
        res.format({
            'text/html': function() {
                res.render("bot.html", req.params.bot);
            },
            'application/json': function() {
                res.json(req.params.bot);
            },
            'application/java-archive': function() {
                res.sendfile(path.join('./bots/', req.params.bot.get('path')));
            }
        });
    });

    app.post('/bots/:bot/update', function(req, res) {
        req.pipe(req.busboy);

        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var botFile = "bot" + req.params.bot.id + '.jar';

            req.busboy.on('finish', function() {
                req.params.bot.set('path', botFile).save().exec(
                    function(err, bot) {
                        res.redirect('/bots/' + req.params.bot.id);
                    }
                );
            });

            file.pipe(fs.createWriteStream(path.join('./bots', botFile)));
        });

    });

    app.get('/games', function(req, res) {
        fetchColl(models.Game, function(err, games) {
            res.format({
                'application/json': function() {
                    res.json(games);
                }
            });
        });
    });

    app.get('/games/:game', function(req, res) {
        res.json(req.params.game);
    });

    app.get('/games/:game/battlequeue', function(req, res) {
        models._knex(
            'bots as A'
        ).join(
            'bots as B', 'A.id', '!=', 'B.id'
        ).select(
            'A.name as A', 'B.name as B'
        ).whereIn(
            'B.id', function() {
                this.select('bot as id')
                    .from('competitors')
                    .where('game', '=', req.params.game.id)
            }
        ).whereIn(
            'A.id', function() {
                this.select('bot as id')
                    .from('competitors')
                    .where('game', '=', req.params.game.id)
            }
        ).whereRaw(
            [
                 "NOT EXISTS (SELECT * FROM battle_results AS resultsA",
                 "WHERE resultsA.bot = A.id",
                 "AND EXISTS (",
                     "SELECT * FROM battle_results as resultsB",
                     "WHERE resultsB.bot = B.id",
                     "AND resultsB.battle = resultsA.battle",
                 "))"
            ].join(" ")
        ).exec(function(err, data) {
            res.json(data.map(function(e) {
                return [{
                    url: "/bots/" + e.A,
                    name: e.A
                }, {
                    url: "bots/" + e.B,
                    name: e.B
                }]
            }));
        })
        // TODO: get (first) bot (A) for which there exists minimum number of
        //       battle results.
        //       Make list of bots who have fought A fewest times.
        //       Make pairs of each of those bots & A
        //       Send to client who will run fights
    });
};
