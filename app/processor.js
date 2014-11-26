var events = require('events'),
    processor = new events.EventEmitter();

processor.on('source', function (data, cb) {
    db.command("insert into Source set name = '" + data.name + "', url = '" + data.url + "', endpoint = '" + data.npoint + "'", function(err) {
        if (err) {
            throw err;
        }
        cb.call(null);
        
        processor.fetchData(data.endpoint);
    });
});


processor.fetchData = function (endpoint) {

};

module.exports = processor;