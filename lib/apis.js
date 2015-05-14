var bodyParser = require('body-parser');
var methodOverride = require('method-override');

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

};
