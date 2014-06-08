var bookshelf = require('bookshelf'),
    config    = require('../config'),

    db        = bookshelf.initialize(config.db);

var _toJSON = db.Model.prototype.toJSON;

db.Model.prototype.toJSON = function(options) {
    options = options || {};
    options.noPivot = options.noPivot || true;

    return _toJSON.call(this, options);
};

var Owner     = db.Model.extend({
    tableName: "owners",
});

var Bot       = db.Model.extend({
    tableName: "bots",

    toJSON: function() {
        var json = db.Model.prototype.toJSON.call(this);
        delete json.path;
        return json;
    },

    games: function() {
        return this.belongsToMany(Game).through(Competitors, "bot", "game");
    }
})

var Game      = db.Model.extend({
    tableName: "games",
    bots: function() {
        return this.belongsToMany(Bot).through(Competitors, "game", "bot");
    }
});

var Battle    = db.Model.extend({
    tableName: "battles",
});

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
