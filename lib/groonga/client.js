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

  getTableList: function() {
    return Q.Promise((function(resolve, reject, notify) {
      http.get(this.base + 'table_list', (function(response) {
        var gResponse = new GroongaResponses.TableListResponse(response.body);
        if (gResponse.failed)
          return reject(gResponse);
        else
          resolve(gResponse.tables);
      }).bind(this))
      .on('error', function(error) {
        reject(error);
      });
    }).bind(this));
  },
};


module.exports = Client;
