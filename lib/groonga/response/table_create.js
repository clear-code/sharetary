var BaseResponse = require('./base');
var inherit = require('../../inherit');

function TableCreateResponse(response) {
  BaseResponse.call(this, response);
}

TableCreateResponse.prototype = inherit(BaseResponse.prototype, {
  get created() {
    return this.body[0] === true;
  }
});

module.exports = TableCreateResponse;
