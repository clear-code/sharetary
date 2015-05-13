var assert = require('chai').assert;

var TableCreateResponse = require('../../../lib/groonga/response/table_create');

suite('Groonga response for table_create', function() {
  var succeededSource = [
    [0, 1431504631.3374963, 0.0036923885345458984],
    true
  ];
  var failedSource = [
    [0, 1431504631.3374963, 0.0036923885345458984],
    false
  ];

  test('created', function() {
    var response = new TableCreateResponse(succeededSource);
    assert.isTrue(response.created);
  });

  test('not created', function() {
    var response = new TableCreateResponse(failedSource);
    assert.isFalse(response.created);
  });
});

