var http = require('http');
var querystring = require('querystring');
var Q = require('q');

var GroongaResponses = require('./response');

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
};


module.exports = Client;
