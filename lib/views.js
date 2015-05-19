var less = require('less-middleware');
var path = require('path');
var Q = require('q');
var querystring = require('querystring');
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
    var flatEvents = result.records;
    var events = eventsTree.build(flatEvents);
    response.render('events', {
      title:  'Timeline',
      current: '/timeline',
      events: flatEvents
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
    response.render('events', {
      title:  'Archive',
      current: '/archive',
      events: events,
      tree:   true
    });
  }).catch(function(error) {
    response.render('error', {
      error: error
    });
  });
});

application.get('/reply', function(request, response) {
  var key = request.query.event;
  groonga.select({
    table:  'Events',
    filter: '_key @ ' + JSON.stringify(key),
    limit:  1
  }).then(function(result) {
    var events = result.records;
    if (events.length == 0) {
      respopnse.render('error', {
        error: 'no event for the key: ' + key
      });
      return;
    }
    var event = events[0];
    var label = event.title || event.uri;
    response.render('reply', {
      title: 'Reply for "' + label + '"',
      parent: key,
      from:   request.query.from
    });
  }).catch(function(error) {
    response.render('error', {
      error: error
    });
  });
});

application.post('/add-event', function(request, response) {
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

    groonga.load({
      table:   'Events',
      records: [record]
    }).then(function(loadedCount) {
      if (loadedCount != 1) {
        respopnse.render('error', {
          error: 'failed to add new reply for ' + body.parent
        });
        return;
      }
      var redirection = '/';
      if (body.from == '/timeline' ||
          body.from == '/archive')
        redirection = body.from;
      response.redirect(redirection);
    }).catch(function(error) {
      response.render('error', {
        error: error
      });
    });
  }).bind(this));
});

};
