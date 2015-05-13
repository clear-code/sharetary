var BaseResponse = require('./base');
var util = require('util');

function ColumnCreateResponse(response) {
  BaseResponse.call(this, response);
}

util.inherits(ColumnCreateResponse, BaseResponse);

Object.defineProperty(ColumnCreateResponse.prototype, 'created', {
  get: function() {
    return this.body[0] === true;
  }
});

module.exports = ColumnCreateResponse;
