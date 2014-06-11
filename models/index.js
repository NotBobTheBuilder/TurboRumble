var bookshelf = require('bookshelf'),
    config    = require('../config'),

    db        = bookshelf.initialize(config.db);

var _toJSON = db.Model.prototype.toJSON;

db.Model.prototype.toJSON = function(options) {
    options = options || {};
    options.noPivot = options.noPivot || true;

    var json = _toJSON.call(this, options);
    if (this instanceof db.Model) {
        json.url = "/" + this.tableName + "/" + json.name;
    }
    return json;
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
        return this.belongsToMany(Game).through(Competitor, "bot", "game");
    },

    battles: function() {
        return this.belongsToMany(Battle).through(Result, "bot", "battle");
    }
});

var Game      = db.Model.extend({
    tableName: "games",
    bots: function() {
        return this.belongsToMany(Bot).through(Competitor, "game", "bot");
    },

    battles: function() {
        return this.hasMany(Battle, "game");
    }
});

var Battle    = db.Model.extend({
    tableName: "battles",

    game: function() {
        return this.belongsTo(Game, "game");
    },

    results: function() {
        return this.hasMany(Result, "battle")
    },

    bots: function() {
        return this.belongsToMany(Bot).through(Result, "battle", "bot", "bot");
    }
});

var Result    = db.Model.extend({
    tableName: "battle_results",

    battle: function() {
        return this.belongsTo(Battle, "battle");
    },
    bot: function() {
        return this.belongsTo(Bot, "bot");
    }
});

var Competitor = db.Model.extend({
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
    "Competitor": Competitor,
    "_knex": db.knex
};
