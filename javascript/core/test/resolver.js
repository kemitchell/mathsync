(function () {
  'use strict';

  var resolver = require('../src/resolver');
  var summarizer = require('../src/summarizer');
  var sha1 = require('../src/sha1');
  var bucketSelector = require('../src/bucketSelector').padAndHash(sha1, 3);
  var assertThatSetOfArrayEquals = require('./utils').assertThatSetOfArrayEquals;

  function serialize(value) {
    return new Int8Array(value).buffer;
  }
  function deserialize(value) {
    var view = new Int8Array(value);
    var res = [];
    for (var i = 0; i < view.length; i++) {
      res.push(view[i]);
    }
    return res;
  }

  describe('Resolver', function() {
    describe('fromSummarizers', function() {
      it('generate difference', function(done) {
        var localItems = [[1, 2], [2, 2], [3, 2]];
        var local = summarizer.fromItems(localItems, serialize, sha1, bucketSelector);

        var remoteItems = [[1, 2], [4, 2]];
        var remote = summarizer.fromItems(remoteItems, serialize, sha1, bucketSelector);

        resolver.fromSummarizers(local, remote, deserialize)().then(function (difference) {
          assertThatSetOfArrayEquals(difference.added, [[4, 2]]);
          assertThatSetOfArrayEquals(difference.removed, [[2, 2], [3, 2]]);
          done();
        }, done);
      });
    });
    describe('fromItems', function () {
      it('generate difference', function (done) {
        var localItems = [[1, 2], [2, 2], [3, 2]];

        var remoteItems = [[1, 2], [4, 2]];
        var remote = summarizer.fromItems(remoteItems, serialize, sha1, bucketSelector);

        resolver.fromItems(localItems, remote, serialize, deserialize)().then(function (difference) {
          assertThatSetOfArrayEquals(difference.added, [[4, 2]]);
          assertThatSetOfArrayEquals(difference.removed, [[2, 2], [3, 2]]);
          done();
        }, done);
      });
    });
  });
})();
