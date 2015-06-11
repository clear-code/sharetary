var less = require('less-middleware');
var partials = require('express-partials');
var path = require('path');
var Q = require('q');
var querystring = require('querystring');
var serveStatic = require('serve-static');

var eventsTree = require('./events-tree');

var UNLIMITED = -1;
var DEFAULT_ARCHIVE_LIMIT = 500;

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

function setFilter(params, requestQueries) {
  var filter = createFilter(requestQueries);
  if (filter)
    params.filter = filter;
}

function setQuery(params, requestQueries) {
  var terms = requestQueries.searchTerm || '';
  terms = terms.trim();
  if (terms) {
    params.query = terms;
    params.match_columns = 'type,title,title,description,actor,uri,scope';
  }
}

function groongaRecorsToHash(groongaResult) {
  var hash = {};
  groongaResult.records.forEach(function(record) {
    hash[record._key] = record;
  });
  return hash;
}

exports.init = function(params) {

var application = params.application;
var groonga     = params.groonga;
var enableLocalComment = params.enableLocalComment;
var refreshInterval = params.refreshInterval;

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
  var params = {
    table:  'Events',
    sortby: '-created_at',
    offset: parseInt(request.query.offset || 0),
    limit:  parseInt(request.query.limit || 100),
    drilldown:                'tags,actor',
    drilldown_output_columns: '_key,_nsubrecs,*',
    drilldown_limit:          UNLIMITED
  };
  setFilter(params, request.query);
  setQuery(params, request.query);
  groonga.select(params).then(function(result) {
    var flatEvents = result.records;
    var events = eventsTree.build(flatEvents);
    response.render('timeline', {
      title:  'Timeline',
      current: '/timeline',
      enableLocalComment: enableLocalComment,
      events: flatEvents,
      tags:   groongaRecorsToHash(result.drilldownResults[0]),
      actors: groongaRecorsToHash(result.drilldownResults[1]),
      filters: inheritedFilters(request.query),
      refreshInterval: refreshInterval
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
  var keyToBypassCache = Math.floor(Date.now() / (refreshInterval * 1000));
  var params = {
    table:  'Events',
    sortby: '-created_at',
    limit:  -1,
    filter: filters.join(' && '),
    drilldown:                'tags,actor',
    drilldown_output_columns: '_key,_nsubrecs,*',
    drilldown_limit:          UNLIMITED
  };
  setQuery(params, request.query);
  groonga.select(params, { _: keyToBypassCache }).then(function(result) {
    var flatEvents = result.records;
    var events = eventsTree.build(flatEvents);
    for (var i = result.records.length - 1; i > -1; i--) {
      binaryClass = binaryClass == 'odd' ? 'even' : 'odd' ;
      result.records[i]._binaryClass = binaryClass;
    }
    response.partial('timeline-new-events', {
      current: '/timeline',
      enableLocalComment: enableLocalComment,
      events: result.records,
      tags:   groongaRecorsToHash(result.drilldownResults[0]),
      actors: groongaRecorsToHash(result.drilldownResults[1]),
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
  var params = {
    table:  'Events',
    sortby: '-timestamp',
    offset: parseInt(request.query.offset || 0),
    drilldown:                'tags,actor',
    drilldown_output_columns: '_key,_nsubrecs,*',
    drilldown_limit:          UNLIMITED
  };
  setFilter(params, request.query);
  setQuery(params, request.query);
  params.limit = parseInt(request.query.limit || UNLIMITED);
  if (!params.filter && !params.query)
    params.limit = DEFAULT_ARCHIVE_LIMIT;
  groonga.select(params).then(function(result) {
    var flatEvents = result.records;
    var events = eventsTree.build(flatEvents.reverse());
    response.render('archive', {
      title:  'Archive',
      current: '/archive',
      enableLocalComment: enableLocalComment,
      events: events,
      tags:   groongaRecorsToHash(result.drilldownResults[0]),
      actors: groongaRecorsToHash(result.drilldownResults[1]),
      tree:   true,
      filters: inheritedFilters(request.query),
      limit:   params.limit,
      limited: params.limit != UNLIMITED && result.count > params.limit
    });
  }).catch(function(error) {
    response.render('error', {
      error: error
    });
  });
});

if (enableLocalComment) {
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
}
};
