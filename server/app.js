/*
 * Copyright 2013-2015 Intel Corporation.
 * 
 * See the file LICENSE for copying permission.
 */
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var data = require('./routes/data');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
// app.get('/', user.list);
app.post('/update', data.update);
app.get('/data/:name', data.download);
app.get('/config/:name', data.download);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
