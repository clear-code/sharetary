var BaseResponse = require('./base');
var Columns = require('./columns');
var inherit = require('../../inherit');

function TableListResponse(response) {
  BaseResponse.call(this, response);
}

TableListResponse.prototype = inherit(BaseResponse.prototype, {
  get columns() {
    if (!this._columns)
      this._columns = new Columns(this.body[0][0]);
    return this._columns;
  },

  get tables() {
    if (!this._tables) {
      this._tables = [];
      var tables = this.body[0].slice(1);
      tables.forEach(function(table) {
        this._tables.push(this.columns.parseRecord(table));
      }, this);
    }
    return this._tables;
  }
});

module.exports = TableListResponse;
