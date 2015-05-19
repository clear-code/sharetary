var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var Q = require('q');
var querystring = require('querystring');

var PREFIX = '/api/';

exports.init = function(params) {

var application = params.application;
var groonga     = params.groonga;

application.set('json spaces', 1); // -1 disables pretty print
application.use(PREFIX, bodyParser.json());
application.use(PREFIX, methodOverride());

application.get(PREFIX + 'new_events', function(request, response) {
  var boundary = request.query.boundary;
  groonga.select({
    table:  'Events',
    sortby: '-timestamp',
    limit:  -1,
    filter: 'timestamp > ' + boundary,
  }).then(function(result) {
    response.jsonp(result.records);
  });
});

application.post(PREFIX + 'add-event', function(request, response) {
  Q.Promise(function(resolve, reject, notify) {
    var body = '';
    request.on('data', function(chunk) {
      body += chunk;
    });
    request.on('end', function() {
      resolve(body);
    });
    request.on('error', function(error) {
      reject(error);
    });
  }).then((function(body) {
    body = querystring.parse(body);
    var key = 'comment-' + Date.now() + ':' + Math.round(Math.random() * 65000);
    var record = {
      _key:        key,
      parent:      body.parent,
      author:      body.author,
      title:       body.title,
      description: body.description,
      uri:         body.uri,
      timestamp:   Date.now()
    };

    return groonga.load({
      table:   'Events',
      records: [record]
    }).then(function(loadedCount) {
      if (loadedCount != 1) {
        respopnse.jsonp(500, false);
        return;
      }
      response.jsonp(200, true);
    }).catch(function(error) {
      respopnse.jsonp(500, error);
    });
  }).bind(this))
  .reject(function(error) {
    respopnse.jsonp(500, error);
  });
});

};
