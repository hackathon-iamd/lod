var processor = require(__dirname + '/../processor.js'),
    assert = require('assert');

describe('Processor', function () {
    describe('#emit(source)', function () {
        it('should return no error if endpoint can be reached', function (done) {
            processor.emit('source', {name: 'test', url: 'http://www.bioassayontology.org', endpoint: 'http://www.ebi.ac.uk/rdf/services/chembl/sparql'}, function (err) {
                assert.equal(err, null);
                
                done();
            });
        });

        it('should return an error if endpoint cannot be reached', function (done) {

            processor.emit('source', {name: 'test', url: 'http://www.bioassayontology.org', endpoint: 'http://www.google.fr/sparql'}, function (err) {
                assert.notEqual(err, null)
                done();
            });
        });
    });
});