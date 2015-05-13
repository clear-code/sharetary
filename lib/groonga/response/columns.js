var INDEX_COLUMN_NAME = 0;
var INDEX_COLUMN_TYPE = 1;

function Columns(columns) {
  this._hashVersion = {};
  this._arrayVersion = [];
  columns.forEach(function(column, index) {
    var name = column[INDEX_COLUMN_NAME];
    var column = {
      name: name,
      type: column[INDEX_COLUMN_TYPE],
      index: index
    };
    this._hashVersion[name] = column;
    this._arrayVersion.push(column);
    this[index] = this[name] = column;
  }, this);
  this.length = columns.length;
}

Columns.prototype = {
  toHash: function() {
    return this._hashVersion;
  },
  toArray: function() {
    return this._arrayVersion;
  },
  parseRecord: function(arrayRecord) {
    var hashRecord = {};
    arrayRecord.forEach(function(value, index) {
      hashRecord[this[index].name] = value;
    }, this);
    return hashRecord;
  }
};

module.exports = Columns;
