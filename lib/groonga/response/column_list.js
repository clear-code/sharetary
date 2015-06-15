var BaseResponse = require('./base');
var Columns = require('./columns');
var util = require('util');

function ColumnListResponse(response) {
  BaseResponse.call(this, response);
}

util.inherits(ColumnListResponse, BaseResponse);

Object.defineProperty(ColumnListResponse.prototype, 'recordDefinition', {
  get: function() {
    if (!this._recordDefinition)
      this._recordDefinition = new Columns(this.body[0][0]);
    return this._recordDefinition;
  }
});

Object.defineProperty(ColumnListResponse.prototype, 'columns', {
  get: function() {
    if (!this._columns) {
      this._columns = [];
      var columns = (this.body[0] || []).slice(1);
      columns.forEach(function(column) {
        this._columns.push(this.recordDefinition.parseRecord(column));
      }, this);
    }
    return this._columns;
  }
});

module.exports = ColumnListResponse;
