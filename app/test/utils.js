var utils = require(__dirname + '/../utils.js'),
    assert = require('assert');

describe('utils', function () {
    describe('.Index', function () {
        describe('#put', function () {
            var index = new utils.Index();

            index.put('tast', function () {
                index.put('test2', function () {
                    index.put('test', function () {
                        it('should insert keys', function (done) {
                            assert.notEqual(index.root['t'], undefined);
                            assert.notEqual(index.root['t']['e'], undefined);
                            assert.notEqual(index.root['t']['e']['s'], undefined);
                            assert.notEqual(index.root['t']['e']['s']['t'], undefined);
                            assert.equal(index.root['a'], undefined);
                            assert.equal(index.root['t']['z'], undefined);
                            done();
                        });
                    });
                });
            });
        });

        describe('#has', function () {
            var index = new utils.Index();

            index.put('tast', function () {
                index.put('test', function () {
                    it('should insert keys', function (done) {
                        index.has('test', function (has) {
                            assert.equal(has, true);
                            index.has('tast', function (has) {
                                assert.equal(has, true);
                                index.has('test2', function (has) {
                                    assert.equal(has, false);
                                    done()
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});