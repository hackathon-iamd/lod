var events = require('events'),
    processor = new events.EventEmitter(),
    fs = require('fs'),
    http = require('http'),
    utils = require(__dirname + '/utils.js');

/**
 * 
 * @return {[type]} [description]
 */
String.prototype.urlFormat = function () {
    return this.toString().replace(/ /g, '+').replace(/:/g, '%3A').replace(/\//g, '%2F').replace(/\?/g, '%3F').replace(/#/g, '%23');
};

processor.on('source', function (data, cb) {
    processor.addSource({ id: '#0' }, data, cb);

    /*db.command("insert into Source set name = '" + data.name + "', url = '" + data.url + "', endpoint = '" + data.npoint + "'", function(err) {
        if (err) {
            throw err;
        }
        cb.call(null);
        
        // TODO source id
        processor.fetchData('#0', data.endpoint);
    });*/
});


processor.queue = new utils.Queue();


processor.timer = setInterval(function () {
    if (processor.queue.empty()) {
        return;
    }
    processor.processQueue();
}, 100);


processor.queue.add({ source: '#0', uri: 'http://www.bioassayontology.org/bao#BAO_0000015', endpoint: 'http://www.ebi.ac.uk/rdf/services/chembl/sparql' });
processor.queue.add({ source: '#0', uri: 'http://www.bioassayontology.org/bao#BAO_0000040', endpoint: 'http://www.ebi.ac.uk/rdf/services/chembl/sparql' });

processor.processQueue = function () {

    var cb = function () {
        if (processor.queue.empty()) {
            return;
        }
        var o = processor.queue.poll();

        var query = 'DESCRIBE <' + o.uri + '>';
        query = o.endpoint + '?format=RDF/XML&query=' + query.urlFormat();
        
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
                console.log(body)
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