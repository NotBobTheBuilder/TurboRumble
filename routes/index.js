var models = require('../models');

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

module.exports = function(app) {
    app.get('/ratingsfile', validAPI, function(req, res) {
        res.render('ratingsfile.robo', {
            robots: req.game.related('bots').map(
                function (e) {
                    return e.attributes;
                }
            )
        });
    });
};
