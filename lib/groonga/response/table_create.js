var BaseResponse = require('./base');
var util = require('util');

function TableCreateResponse(response) {
  BaseResponse.call(this, response);
}

util.inherits(TableCreateResponse, BaseResponse);

Object.defineProperty(TableCreateResponse.prototype, 'created', {
  get: function() {
    return this.body[0] === true;
  }
});

module.exports = TableCreateResponse;
