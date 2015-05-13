var assert = require('chai').assert;

var ColumnCreateResponse = require('../../../lib/groonga/response/column_create');

suite('Groonga response for column_create', function() {
  var succeededSource = [
    [0, 1431504631.3374963, 0.0036923885345458984],
    true
  ];
  var failedSource = [
    [0, 1431504631.3374963, 0.0036923885345458984],
    false
  ];

  test('created', function() {
    var response = new ColumnCreateResponse(succeededSource);
    assert.isTrue(response.created);
  });

  test('not created', function() {
    var response = new ColumnCreateResponse(failedSource);
    assert.isFalse(response.created);
  });
});

