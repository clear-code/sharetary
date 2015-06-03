function getElementHeights(collection) {
  var heights = [];
  collection.each(function(index, element) {
  try {
    heights.push($(element).height());
  }
  catch(error) {
    heights.push(-1);
  }
  });
  return heights;
}

showNewEvent.events = [];
showNewEvent.running = false;
function showNewEvent() {
  if (showNewEvent.events.length == 0) {
    showNewEvent.running = false;
    return;
  }

  showNewEvent.running = true;
  var event = showNewEvent.events.shift();
  $(event.event).animate({ height: 'show', opacity: 'show' }, 'normal', showNewEvent);

  var allowedMaxScrollPosition = $(window).height() / 3;
  var scrollPosition = $(window).scrollTop();
  if (event.height > -1 &&
      scrollPosition > allowedMaxScrollPosition) {
      console.log('Scroll');
    $('html, body').animate({ scrollTop: scrollPosition + event.height }, 'normal');
  }
}

jQuery.fn.reverse = [].reverse;

function checkNewEvents() {
  var latestItem = $('.event-item').first();
  var boundary = latestItem.attr('data-created-at');
  var lastBinaryClass = latestItem.attr('data-event-binary');
  var parameters = [
    'boundary=' + boundary,
    'lastBinaryClass=' + lastBinaryClass,
    'actors=' + $('#filter-actors').attr('value'),
    'scope=' + $('#filter-scope').attr('value')
  ];
  $.ajax({
    url: '/timeline-new-events?' + parameters.join('&')
  }).done(function(data) {
    var newEvents = $(data);

    // 1) Insert events to the document to determine their size.
    newEvents.css({ visibility: 'hidden' });
    $('#events').append(newEvents);

    setTimeout(function() {
      // 2) Calculate size of inserting events.
      var insertedEventHeights = getElementHeights(newEvents).reverse();

      // 3) Move inserting events to the top of existing events.
      newEvents.css({ visibility: 'visible', display: 'none' });
      $('#events').prepend(newEvents);

      newEvents.reverse().each(function(index, event) {
        showNewEvent.events.push({
          event:  event,
          height: insertedEventHeights[index]
        });
      });
      if (!showNewEvent.running)
        showNewEvent();

      setTimeout(checkNewEvents, 3000);
    }, 0);
  });
}
checkNewEvents();
