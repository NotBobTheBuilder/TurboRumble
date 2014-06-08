var express = require('express'),
    app     = express(),
    mstx    = require('mustachex'),
    busboy  = require('connect-busboy'),

    config  = require('./config'),
    routes  = require('./routes');

app.engine('html', mstx.express);
app.set('view engine', mstx.express);
app.set('views', __dirname + '/views');

app.use('/static', express.static(__dirname + '/static'));
app.use(busboy());

routes(app);

app.listen(config.port);
console.log("listening on port " + config.port);
