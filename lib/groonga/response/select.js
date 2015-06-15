var BaseResponse = require('./base');
var Columns = require('./columns');
var util = require('util');

function SelectResponse(response) {
  BaseResponse.call(this, response);
}

util.inherits(SelectResponse, BaseResponse);

function parseSelectResult(result) {
  result = result || [];
  var parsedResult = {
    count: 0,
    columns: {},
    records: []
  };
  if (!result) {
    return parsedResult;
  }
  var countRow = result[0] || [0];
  var columnsRow = result[1] || [];
  parsedResult = {
    count:   countRow[0],
    columns: new Columns(columnsRow)
  };
  parsedResult.records = [];
  result.slice(2).forEach(function(record) {
    parsedResult.records.push(parsedResult.columns.parseRecord(record));
  });
  return parsedResult;
}

Object.defineProperty(SelectResponse.prototype, 'mainResult', {
  get: function() {
  	if (!this._mainResult) {
  	  var mainResult = this.body[0] || [];
  	  this._mainResult = parseSelectResult(mainResult[0] || []);
  	}
  	return this._mainResult;
  }
});

Object.defineProperty(SelectResponse.prototype, 'count', {
  get: function() {
    return this.mainResult.count;
  }
});

Object.defineProperty(SelectResponse.prototype, 'columns', {
  get: function() {
    return this.mainResult.columns;
  }
});

Object.defineProperty(SelectResponse.prototype, 'records', {
  get: function() {
    return this.mainResult.records;
  }
});

Object.defineProperty(SelectResponse.prototype, 'drilldownResults', {
  get: function() {
    if (!this._drilldownResults) {
      this._drilldownResults = [];
      (this.body[0] || []).slice(1).forEach(function(result) {
        this._drilldownResults.push(parseSelectResult(result));
      }, this);
    }
    return this._drilldownResults;
  }
});

module.exports = SelectResponse;
