var http = require('http');
var querystring = require('querystring');
var Q = require('q');

var GroongaResponses = require('./response');

function withDefaultValue(value, defaultValue) {
  if (typeof value == 'undefined') {
    if (typeof defaultValue == 'undefined')
      return null;
    else
      return defaultValue;
  }
  else {
    return value;
  }
}

function Client(options) {
  this.base = options.base;
  this.ensureBaseIsGroongaEndpoint();
}

Client.prototype = {
  ensureBaseIsGroongaEndpoint: function() {
    this.base = this.base.replace(/([^\/])$/, '\1\/');
    if (!/\/d\/$/.test(this.base))
      this.base += 'd/';
  },

  _waitResponseBody: function(response) {
    return Q.Promise(function(resolve, reject, notify) {
      var body = '';
      response.on('data', function(chunk) {
        body += chunk;
      });
      response.on('end', function() {
        resolve(body);
      });
      response.on('error', function(error) {
        reject(error);
      });
    });
  },

  getTables: function() {
    return Q.Promise((function(resolve, reject, notify) {
      http.get(this.base + 'table_list', (function(response) {
        this._waitResponseBody(response)
          .then((function(body) {
            var gResponse = new GroongaResponses.TableListResponse(body);
            if (gResponse.succeeded)
              resolve(gResponse.tables);
            else
              reject(gResponse);
          }).bind(this))
          .catch(reject);
      }).bind(this))
      .on('error', reject);
    }).bind(this));
  },

  createTable: function(params) {
    var urlParams = querystring.stringify({
      name:              withDefaultValue(params.name,
      flags:             withDefaultValue(params.flags, 'TABLE_HASH_KEY'),
      key_type:          withDefaultValue(params.key_type),
      value_type:        withDefaultValue(params.value_type),
      default_tokenizer: withDefaultValue(params.default_tokenizer),
      normalizer:        withDefaultValue(params.normalizer),
      token_filters:     withDefaultValue(params.token_filters)
    });
    return Q.Promise((function(resolve, reject, notify) {
      http.get(this.base + 'table_create?' + urlParams, (function(response) {
        this._waitResponseBody(response)
          .then((function(body) {
            var gResponse = new GroongaResponses.TableCreateResponse(body);
            if (gResponse.created)
              resolve();
            else
              reject(gResponse);
          }).bind(this))
          .catch(reject);
      }).bind(this))
      .on('error', reject);
    }).bind(this));
  },

  getColumnsOf: function(tableName) {
    var urlParams = querystring.stringify({
      table: tableName
    });
    return Q.Promise((function(resolve, reject, notify) {
      http.get(this.base + 'column_list?' + urlParams, (function(response) {
        this._waitResponseBody(response)
          .then((function(body) {
            var gResponse = new GroongaResponses.ColumnListResponse(body);
            if (gResponse.succeeded)
              resolve(gResponse.columns);
            else
              reject(gResponse);
          }).bind(this))
          .catch(reject);
      }).bind(this))
      .on('error', reject);
    }).bind(this));
  },

  createColumn: function(params) {
    var urlParams = querystring.stringify({
      table:  params.table,
      name:   params.name,
      flags:  withDefaultValue(params.flags, 'COLUMN_SCALAR'),
      type:   withDefaultValue(params.type, 'ShortText'),
      source: withDefaultValue(params.source, [])
    });
    return Q.Promise((function(resolve, reject, notify) {
      http.get(this.base + 'column_create?' + urlParams, (function(response) {
        this._waitResponseBody(response)
          .then((function(body) {
            var gResponse = new GroongaResponses.ColumnCreateResponse(body);
            if (gResponse.created)
              resolve();
            else
              reject(gResponse);
          }).bind(this))
          .catch(reject);
      }).bind(this))
      .on('error', reject);
    }).bind(this));
  }
};


module.exports = Client;
