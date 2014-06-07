var express = require('express'),
    app     = express(),
    mstx    = require('mustachex'),

    config  = require('./config'),
    routes  = require('./routes')(app);

app.engine('html', mstx.express);
app.set('view engine', mstx.express);
app.set('views', __dirname + '/views');

app.use('/static', express.static(__dirname + '/static'));

app.listen(config.port);
console.log("listening on port " + config.port);
