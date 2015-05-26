function getRootEvent(event) {
  var parent = event.parentEvent;
  if (!parent)
    return event;
  return getRootEvent(parent);
}

exports.build = function(flatEvents) {
  var events = [];
  var eventsByKey = {};
  flatEvents.forEach(function(event) {
    event.children = [];
    event.descendants = [];
    eventsByKey[event._key] = event;
  });
  flatEvents.forEach(function(event) {
    if (!event.parent) {
      events.push(event);
      return;
    }
    var parent = eventsByKey[event.parent];
    if (parent) {
    event.parentEvent = parent;
    parent.children.push(event);
    }
    var root = getRootEvent(event);
    root.descendants.push(event);
  });
  return events;
};
