var events = require('events'),
    processor = new events.EventEmitter(),
    fs = require('fs'),
    http = require('http'),
    utils = require(__dirname + '/utils.js'),
    rdf = require('rdf');


/**
 * 
 * @return {[type]} [description]
 */
String.prototype.urlFormat = function () {
    return this.toString().replace(/ /g, '+').replace(/:/g, '%3A').replace(/\//g, '%2F').replace(/\?/g, '%3F').replace(/#/g, '%23');
};

processor.on('source', function (data, db, cb) {
    db.command("insert into Source set name='" + data.name + "', uri='" + data.uri + "', endpoint='" + data.endpoint + "'", function(err) {
        if (err) {
            throw err;
        }
        cb.call(null);
        
        //processor.addSource({ id: '#0' }, data, cb);
        //processor.fetchData('#0', data.endpoint);
    });
});

processor.allowedSources = [];

processor.queue = new utils.Queue();
processor.closed = new utils.Index();

processor.init = function (db, cb) {

    db.command("select from Source", function(err, sources) {
        if (err) {
            throw err;
        }

        for (var i=0; i <sources.length; i++) {
            if (undefined != sources[i]['uri']) {
                processor.allowedSources.push(sources[i]['uri']);
            }
        }

        processor.timer = setInterval(function () {
            if (processor.queue.empty()) {
                return;
            }
            processor.processQueue();
        }, 100);


        cb.call(null);
    });
};

processor.processQueue = function () {

    var cb = function () {
        if (processor.queue.empty()) {
            return;
        }
        var o = processor.queue.poll();
        processor.closed.put(o.uri, function () {
            var query = 'DESCRIBE <' + o.uri + '>';
            query = o.endpoint + '?format=N3&query=' + query.urlFormat();
            
            http.get(query, function (res) {
                err = null
                if (res.statusCode != 200) {
                    err = 'An error occured'
                }

                var body = '';
                res.on('data', function (chunk) {
                    body += chunk;
                });

                res.on('end', function () {
                    var turtleParser = new rdf.TurtleParser();
                    turtleParser.parse(body, function (graph) {
                        if (graph.length != 0){
                            console.log(graph)
                        }
                    }, null, function (triple) {
                        var subject = triple.subject.nominalValue;
                        var predicate = triple.predicate.nominalValue;
                        var target = triple.object.nominalValue;

                        for (var i in processor.allowedSources) {
                            if (target.indexOf(processor.allowedSources[i]) == 0) {
                                processor.queue.add({ uri: target, endpoint: o.endpoint })
                                return !processor.closed.hasSync(target);
                            }
                        }
                        return false;
                    });
                });
            });
        });
    };
    cb.call();
};

/**
 * Fetch types given an endpoint 
 * @param  {[type]} source   [description]
 * @param  {[type]} endpoint [description]
 */
processor.addSource = function (source, data, cb) {
    var query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX owl: <http://www.w3.org/2002/07/owl#> SELECT ?c WHERE { ?c a owl:Class }';
    query = data.endpoint + '?format=CSV&query=' + query.urlFormat();

    http.get(query, function (res) {
        err = null
        if (res.statusCode != 200) {
            err = 'An error occured'
        }

        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var types = body.split(/\r?\n/);
            cb.call(null, err);
            for (var i=1; i < types.length; i++) {
                processor.queue.add({ source: source.id, uri: types[i], endpoint: data.endpoint });
            }
        });

    }).on('error', function (e) {
        cb.call(null, e.message);
    });
};

module.exports = processor;