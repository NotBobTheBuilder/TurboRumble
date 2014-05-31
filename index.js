var express = require('express'),
    app     = express(),
    mstx    = require('mustachex'),

    config  = require('./config'),
    routes  = require('./routes')(app);

app.engine('robo', mstx.express);
app.set('views', __dirname + '/views');

app.listen(config.port);
console.log("listening on port " + config.port);
