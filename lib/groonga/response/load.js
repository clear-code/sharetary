var BaseResponse = require('./base');
var util = require('util');

function LoadResponse(response) {
  BaseResponse.call(this, response);
}

util.inherits(LoadResponse, BaseResponse);

Object.defineProperty(LoadResponse.prototype, 'loadedCount', {
  get: function() {
    return this.body[0];
  }
});

module.exports = LoadResponse;
