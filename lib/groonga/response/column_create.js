var BaseResponse = require('./base');
var inherit = require('../../inherit');

function ColumnCreateResponse(response) {
  BaseResponse.call(this, response);
}

ColumnCreateResponse.prototype = inherit(BaseResponse.prototype, {
  get created() {
    return this.body[0] === true;
  }
});

module.exports = ColumnCreateResponse;
