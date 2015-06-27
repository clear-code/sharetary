var http = require('http');
var querystring = require('querystring');
var Q = require('q');
var url = require('url');

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

function shrinkParams(params) {
  var shrunken = {};
  Object.keys(params).forEach(function(key) {
    if (params[key] === null)
      return;
    shrunken[key] = params[key];
  });
  return shrunken;
}

function Client(options) {
  this.base = options.base;
  this.ensureBaseIsGroongaEndpoint();
  var groongaUrl = this.base;
  http.get(groongaUrl, function(response) {
    console.log('Groonga is running at ' + groongaUrl);
  }).on('error', function(event) {
    console.log('Groonga is NOT running');
  });
}

Client.prototype = {
  ensureBaseIsGroongaEndpoint: function() {
    this.base = this.base.replace(/([^\/])$/, '$1\/');
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

  select: function(params, extraParams) {
    var completeParams = {
      table:            params.table,
      match_columns:    withDefaultValue(params.match_columns),
      query:            withDefaultValue(params.query),
      filter:           withDefaultValue(params.filter),
      scorer:           withDefaultValue(params.scorer),
      sortby:           withDefaultValue(params.sortby),
      output_columns:   withDefaultValue(params.output_columns, '_id,_key,*'),
      offset:           withDefaultValue(params.offset, 0),
      limit:            withDefaultValue(params.limit, 10),
      drilldown:        withDefaultValue(params.drilldown),
      drilldown_sortby: withDefaultValue(params.drilldown_sortby),
      drilldown_output_columns:
                        withDefaultValue(params.drilldown_output_columns, '_key,_nsubrecs'),
      drilldown_offset: withDefaultValue(params.drilldown_offset, 0),
      drilldown_limit:  withDefaultValue(params.drilldown_limit, 10),
      cache:            withDefaultValue(params.cache, 'yes'),
      match_escalation_threshold:
                        withDefaultValue(params.match_escalation_threshold, 0),
      query_expansion:  withDefaultValue(params.query_expansion),
      query_flags:      withDefaultValue(params.query_flags, 'ALLOW_PRAGMA|ALLOW_COLUMN|ALLOW_UPDATE|ALLOW_LEADING_NOT|NONE'),
      query_expander:   withDefaultValue(params.query_expander),
      adjuster:         withDefaultValue(params.adjuster),
      drilldown_calc_types:
                        withDefaultValue(params.drilldown_calc_types, 'NONE'),
      drilldown_calc_target:
                        withDefaultValue(params.drilldown_calc_target)
    };
    var shrunkenParams = shrinkParams(completeParams);
    if (extraParams) {
      Object.keys(extraParams).forEach(function(key) {
        shrunkenParams[key] = extraParams[key];
      });
    }
    var urlParams = querystring.stringify(shrunkenParams);
    return Q.Promise((function(resolve, reject, notify) {
      http.get(this.base + 'select?' + urlParams, (function(response) {
        this._waitResponseBody(response)
          .then((function(body) {
            var gResponse = new GroongaResponses.SelectResponse(body);
            if (gResponse.mainResult)
              resolve(gResponse);
            else
              reject(gResponse);
          }).bind(this))
          .catch(reject);
      }).bind(this))
      .on('error', reject);
    }).bind(this));
  },

  load: function(params) {
    var urlParams = querystring.stringify({
      table:      params.table,
      input_type: 'json'
    });
    var postData = JSON.stringify(params.records);
    return Q.Promise((function(resolve, reject, notify) {
      var uri = url.parse(this.base + 'load?' + urlParams);
      var requestOptions = {
        host: uri.hostname,
        port: uri.port,
        path: uri.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };
      var request = http.request(requestOptions, (function(response) {
        this._waitResponseBody(response)
          .then((function(body) {
            var gResponse = new GroongaResponses.LoadResponse(body);
            resolve(gResponse.loadedCount);
          }).bind(this))
          .catch(reject);
      }).bind(this));
      request.on('error', reject);
      request.write(postData);
      request.end();
    }).bind(this));
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
    var completeParams = {
      name:              withDefaultValue(params.name),
      flags:             withDefaultValue(params.flags, 'TABLE_HASH_KEY'),
      key_type:          withDefaultValue(params.key_type),
      value_type:        withDefaultValue(params.value_type),
      default_tokenizer: withDefaultValue(params.default_tokenizer),
      normalizer:        withDefaultValue(params.normalizer),
      token_filters:     withDefaultValue(params.token_filters)
    };
    var shrunkenParams = shrinkParams(completeParams);
    var urlParams = querystring.stringify(shrunkenParams);
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
    var completeParams = {
      table:  params.table,
      name:   params.name,
      flags:  withDefaultValue(params.flags, 'COLUMN_SCALAR'),
      type:   withDefaultValue(params.type, 'ShortText'),
      source: withDefaultValue(params.source, [])
    };
    var shrunkenParams = shrinkParams(completeParams);
    var urlParams = querystring.stringify(shrunkenParams);
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
