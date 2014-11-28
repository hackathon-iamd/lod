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
var orient = require('orientdb'),
    Db = orient.Db,
    Server = orient.Server;

var processor = require(__dirname + '/processor.js');

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


var dbConfig = require(__dirname + '/config.js')
var serverConfig = {
    host: '193.50.40.95',
    port: 2424
};

var server = new Server(serverConfig);
var db = new Db('LoD', server, dbConfig);

io.on('connection', function(socket){
    db.command("select from (select @rid, name, in('Contains') from Type) LIMIT 30", function (err, types) {
        if (err) {
            throw err;
        }

        var ts = {};

        for (var i in types) {
            ts[types[i]['rid']] = {id: types[i]['@rid'], name: types[i]['name'], sources: types[i]['in'] };
        }

        db.command("select from (select @rid, name, out('Contains') from Source)", function(err, sources) {
            if (err) {
                throw err;
            }

            ss = {};
            for (i in sources) {
                ss[sources[i]['rid']] = { id: sources[i]['@rid'], name: sources[i]['name'], types: sources[i]['out'] };
            }

            graph = { sources: ss, types: ts };
            socket.emit('graph', JSON.stringify(graph));
            ss = null;
            ts = null;
        });
    });
    
    socket.on('source', function(data){
        data = JSON.parse(data);
        process.emit('source', data, function () {
            // TODO emit source
        });
    });
});


db.open(function(err) {

    if (err) {
        console.log(err);
        return;
    }

    console.log("Database '" + db.databaseName + "' has " + db.clusters.length + " clusters");

    processor.init(db, function () {
        http.listen(3000, function(){
            console.log('listening on *:3000');
        });
    })
});
