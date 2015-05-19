var less = require('less-middleware');
var path = require('path');
var serveStatic = require('serve-static');

var eventsTree = require('./events-tree');

exports.init = function(params) {

var application = params.application;
var groonga     = params.groonga;

var baseDir = path.join(__dirname, '..');
application.set('views', path.join(baseDir, 'views'));
application.set('view engine', 'jade');
application.use(less(path.join(baseDir, 'public')));
application.use(serveStatic(path.join(baseDir, 'public')));


application.get('/', function(request, response) {
  response.redirect('/timeline');
});

application.get('/timeline', function(request, response) {
  groonga.select({
    table:  'Events',
    sortby: '-timestamp',
    limit:  100
  }).then(function(result) {
    var events = eventsTree.build(result.records);
    response.render('timeline', {
      events: events
    });
  }).catch(function(error) {
    response.render('error', {
      error: error
    });
  });
});

application.get('/archive', function(request, response) {
  groonga.select({
    table:  'Events',
    sortby: 'timestamp',
    limit:  -1
  }).then(function(result) {
    var events = eventsTree.build(result.records);
    response.render('archive', {
      events: events
    });
  }).catch(function(error) {
    response.render('error', {
      error: error
    });
  });
});

};
