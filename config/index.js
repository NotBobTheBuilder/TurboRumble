var settings  = require("./settings"),
    defaults  = require("./defaults.json"),

    _         = require("underscore"),
    mode      = process.env.NODE_MODE || "development";


module.exports = _.defaults(settings || {}, defaults[mode]);
