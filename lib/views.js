var less = require('less-middleware');
var partials = require('express-partials');
var path = require('path');
var Q = require('q');
var querystring = require('querystring');
var serveStatic = require('serve-static');

var eventsTree = require('./events-tree');

function createFilter(requestQueries) {
  var filters = [];

  if (requestQueries.actors) {
    var targetAuthors = requestQueries.actors.trim().split(/[\|,\s]+/).map(function(actor) {
      return actor.trim();
    }).filter(function(actor) {
      return actor != '';
    });
    if (targetAuthors.length > 0) {
      filters.push(
        '( ' +
        targetAuthors.map(function(actor) {
          return 'actor == "' + actor + '"';
        }).join(' || ') +
        ' )'
      );
    }
  }

  if (requestQueries.scope)
    filters.push('scope == "' + requestQueries.scope + '"');

  if (requestQueries.after)
    filters.push('timestamp >= ' + requestQueries.after);

  if (requestQueries.before)
    filters.push('timestamp <= ' + requestQueries.before);

  if (filters.length > 0)
    return filters.join(' && ');
  else
    return null;
}

function inheritedFilters(requestQueries) {
  return {
    actors:     requestQueries.actors,
    scope:      requestQueries.scope,
    searchTerm: requestQueries.searchTerm,
    after:      requestQueries.after,
    before:     requestQueries.before
  };
}

var keywordSearchMatchColumns = 'type,title,title,description,actor,uri,scope';

exports.init = function(params) {

var application = params.application;
var groonga     = params.groonga;

var baseDir = path.join(__dirname, '..');
application.set('views', path.join(baseDir, 'views'));
application.set('view engine', 'jade');
application.use(less(path.join(baseDir, 'public')));
application.use(serveStatic(path.join(baseDir, 'public')));
application.use(partials());

application.get('/', function(request, response) {
  response.redirect('/timeline');
});

application.get('/timeline', function(request, response) {
  groonga.select({
    table:  'Events',
    sortby: '-created_at',
    limit:  100,
    filter: createFilter(request.query),
    query:  request.query.searchTerm,
    match_columns: keywordSearchMatchColumns
  }).then(function(result) {
    var flatEvents = result.records;
    var events = eventsTree.build(flatEvents);
    response.render('timeline', {
      title:  'Timeline',
      current: '/timeline',
      events: flatEvents,
      filters: inheritedFilters(request.query)
    });
  }).catch(function(error) {
    response.render('error', {
      error: error
    });
  });
});

application.get('/timeline-new-events', function(request, response) {
  var boundary = request.query.boundary;
  var binaryClass = request.query.lastBinaryClass;
  var filters = ['created_at > ' + boundary];
  var baseFilter = createFilter(request.query);
  if (baseFilter)
    filters.push(baseFilter);
  groonga.select({
    table:  'Events',
    sortby: '-created_at',
    limit:  -1,
    filter: filters.join(' && '),
    query:  request.query.searchTerm,
    match_columns: keywordSearchMatchColumns
  }).then(function(result) {
    var flatEvents = result.records;
    var events = eventsTree.build(flatEvents);
    for (var i = result.records.length - 1; i > -1; i--) {
      binaryClass = binaryClass == 'odd' ? 'even' : 'odd' ;
      result.records[i]._binaryClass = binaryClass;
    }
    response.partial('timeline-new-events', {
      events: result.records,
      filters: inheritedFilters(request.query)
    });
  }).catch(function(error) {
    console.log(error);
    response.render('error', {
      error: error
    });
  });
});

application.get('/archive', function(request, response) {
  groonga.select({
    table:  'Events',
    sortby: 'timestamp',
    limit:  -1,
    filter: createFilter(request.query),
    query:  request.query.searchTerm,
    match_columns: keywordSearchMatchColumns
  }).then(function(result) {
    var events = eventsTree.build(result.records);
    response.render('archive', {
      title:  'Archive',
      current: '/archive',
      events: events,
      tree:   true,
      filters: inheritedFilters(request.query)
    });
  }).catch(function(error) {
    response.render('error', {
      error: error
    });
  });
});

application.get('/add', function(request, response) {
  var key = request.query.event;
  response.render('add', {
    title: 'New comment',
    current: '/add'
  });
});

application.get('/reply', function(request, response) {
  var key = request.query.event;
  groonga.select({
    table:  'Events',
    limit:  1,
    filter: '_key @ ' + JSON.stringify(key),
    query:  request.query.searchTerm
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
    var nowSeconds = Math.round(Date.now() / 1000);
    body = querystring.parse(body);
    var key = 'comment-' + Date.now() + ':' + Math.round(Math.random() * 65000);
    var record = {
      _key:        key,
      parent:      body.parent,
      actor:       body.actor,
      title:       body.title,
      description: body.description,
      uri:         body.uri,
      timestamp:   nowSeconds,
      created_at:  nowSeconds
    };

    return groonga.load({
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
    });
  }).bind(this))
  .catch(function(error) {
    response.render('error', {
      error: error
    });
  });
});

};
