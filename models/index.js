var bookshelf = require('bookshelf'),
    config    = require('../config'),

    db        = bookshelf.initialize(config.db);

function makeCollection(model) {
    return db.Collection.extend({
        model: model
    });
}

var Owner     = db.Model.extend({
    tableName: "owners",
});
var Owners    = makeCollection(Owner);

var Bot       = db.Model.extend({
    tableName: "bots",
    games: function() {
        return this.belongsToMany(Game).through(Competitors, "bot", "game");
    }
})
var Bots      = makeCollection(Bot);

var Game      = db.Model.extend({
    tableName: "games",
    bots: function() {
        return this.belongsToMany(Bot).through(Competitors, "game", "bot");
    }
});
var Games     = makeCollection(Game);

var Battle    = db.Model.extend({
    tableName: "battles",
});
var Battles   = makeCollection(Battle);

var Competitors = db.Model.extend({
    tableName: "competitors",

    game: function() {
        return this.belongsTo(Game, "game");
    },

    bot: function() {
        return this.belongsTo(Bot, "bot");
    }
});

module.exports = {
    "Owner": Owner,
    "Bot": Bot,
    "Game": Game,
    "Battle": Battle,
    "Competitors": Competitors,
};
