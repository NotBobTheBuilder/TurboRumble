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
            withRelated: ['games']
        }).exec(function(err, bot) {
            req.params.bot = bot;
            next();
        });
    });

    app.param('game', function(req, res, next, id) {
        models.Game.forge({
            name: id
        }).fetch({
            withRelated: ['bots']
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
                res.format({
                    'text/html': function () {
                        for (var k in results) {
                            results[k] = results[k].toJSON();
                        }
                        res.render('index.html', results);
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
};
