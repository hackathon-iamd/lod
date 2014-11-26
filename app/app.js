var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = fs = require('fs');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Express middlewares
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    console.log(res.sendFile);
    fs.readFile(__dirname + '/views/index.html', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(data);
    });
});

io.on('connection', function(socket){
    socket.emit('graph', '{ "sources": [{"id": "11:0", "name": "a", "types": ["12:0", "12:1"] }], "types": [{ "id": "12:0", "name": "b" }, { "id": "12:1", "name": "c" }] }');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});