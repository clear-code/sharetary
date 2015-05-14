exports.init = function(params) {

var application = params.application;
var groonga     = params.groonga;

var baseDir = path.join(__dirname, '..', '..');
application.set('views', path.join(baseDir, 'views'));
application.set('view engine', 'jade');

application.get('/', function(request, response) {
  response.redirect('/timeline');
});
application.get('/timeline', function(request, response) {
  groonga.select({
    table:  'Events',
    sortby: '-timestamp',
    limit:  100
  }).then(function(result) {
    response.render('timeline', {
      title:   'Timeline',
      records: result.records
    });
  });
});
application.get('/archive', function(request, response) {
  groonga.select({
    table:  'Events',
    sortby: 'timestamp',
    limit:  -1
  }).then(function(result) {
    response.render('archive', {
      title:   'Archive',
      records: result.records
    });
  });
});

};
