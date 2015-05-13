var BaseResponse = require('./base');
var Columns = require('./columns');
var util = require('util');

function TableListResponse(response) {
  BaseResponse.call(this, response);
}

util.inherits(TableListResponse, BaseResponse);

Object.defineProperty(TableListResponse.prototype, 'recordDefinition', {
  get: function() {
    if (!this._recordDefinition)
      this._recordDefinition = new Columns(this.body[0][0]);
    return this._recordDefinition;
  }
});

Object.defineProperty(TableListResponse.prototype, 'tables', {
  get: function() {
    if (!this._tables) {
      this._tables = [];
      var tables = this.body[0].slice(1);
      tables.forEach(function(table) {
        this._tables.push(this.recordDefinition.parseRecord(table));
      }, this);
    }
    return this._tables;
  }
});

module.exports = TableListResponse;
