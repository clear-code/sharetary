var assert = require('chai').assert;

var BaseResponse = require('../../../lib/groonga/response/base');

suite('groonga response Base', function() {
  var succeededSource = [
    [0, 1431504631.3374963, 0.0036923885345458984],
    true
  ];
  var failedSource = [
    [1, 1431504631.3374963, 0.0036923885345458984],
    false
  ];

  test('header', function() {
    var response = new BaseResponse(succeededSource);
    assert.deepEqual(response.header, succeededSource[0]);
  });

  test('body', function() {
    var response = new BaseResponse(succeededSource);
    assert.deepEqual(response.body, succeededSource.slice(1));
  });

  suite('for succeeded response', function() {
    test('succeeded', function() {
      var response = new BaseResponse(succeededSource);
      assert.isTrue(response.succeeded);
    });

    test('failed', function() {
      var response = new BaseResponse(succeededSource);
      assert.isFalse(response.failed);
    });
  });

  suite('for failed response', function() {
    test('succeeded', function() {
      var response = new BaseResponse(failedSource);
      assert.isFalse(response.succeeded);
    });

    test('failed', function() {
      var response = new BaseResponse(failedSource);
      assert.isTrue(response.failed);
    });
  });
});

