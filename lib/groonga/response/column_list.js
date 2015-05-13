var BaseResponse = require('./base');
var Columns = require('./columns');
var inherit = require('../../inherit');

function ColumnListResponse(response) {
  BaseResponse.call(this, response);
}

ColumnListResponse.prototype = inherit(BaseResponse.prototype, {
  get recordDefinition() {
    if (!this._recordDefinition)
      this._recordDefinition = new Columns(this.body[0][0]);
    return this._recordDefinition;
  },

  get columns() {
    if (!this._columns) {
      this._columns = [];
      var columns = this.body[0].slice(1);
      columns.forEach(function(column) {
        this._columns.push(this.recordDefinition.parseRecord(column));
      }, this);
    }
    return this._columns;
  }
});

module.exports = ColumnListResponse;
