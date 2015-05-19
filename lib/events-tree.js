exports.build = function(flatEvents) {
  var events = [];
  var eventsByKey = {};
  flatEvents.forEach(function(event) {
    event.children = [];
    eventsByKey[event._key] = event;
  });
  flatEvents.forEach(function(event) {
    if (!event.parent) {
      events.push(event);
      return;
    }
    var parent = eventsByKey[event.parent];
    parent.children.push(event);
  });
  return events;
};
