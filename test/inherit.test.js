var assert = require('chai').assert;

var inherit = require('../lib/inherit');

suite('inherit', function() {
  var BaseClass = function() {
  };
  BaseClass.prototype = {
    get getter() { return true; },
    set setter(value) { return value; },
    method: function() { return true },
    property: true
  };

  test('inheritance', function() {
    var SubClass = function() {
    };
    SubClass.prototype = inherit(BaseClass.prototype, {
      extra: true
    });
    var instance = new SubClass();
    var actual = {
      getter: instance.getter,
      setter: (instance.setter = false),
      method: instance.method,
      property: instance.property,
      extra: instance.extra
    };
    var expected = {
      getter: true,
      setter: false,
      method: BaseClass.prototype.method,
      property: true,
      extra: true
    };
    assert.deepEqual(actual, expected);
  });
});

