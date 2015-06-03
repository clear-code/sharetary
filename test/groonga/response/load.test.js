var assert = require('chai').assert;

var LoadResponse = require('../../../lib/groonga/response/load');

suite('Groonga response for load', function() {
  var source = [
    [0, 1431504631.3374963, 0.0036923885345458984],
    29
  ];

  test('loadedCount', function() {
    var response = new LoadResponse(source);
    assert.equal(29, response.loadedCount);
  });
});

