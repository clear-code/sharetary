function getElementsHeight(collection) {
  try {
    var firstItemPosition = collection.first().offset().top;
    var lastItemPosition = collection.last().offset().top;
    var lastItemHeight = collection.last().height();
    return lastItemPosition + lastItemHeight - firstItemPosition;
  }
  catch(error) {
    return -1;
  }
}

function checkNewEvents() {
  var latestItem = $('.event-item').first();
  var boundary = latestItem.attr('data-created-at');
  var lastBinaryClass = latestItem.attr('data-event-binary');
  var parameters = [
    'boundary=' + boundary,
    'lastBinaryClass=' + lastBinaryClass,
    'authors=' + $('#filter-authors').attr('value'),
    'repository=' + $('#filter-repository').attr('value')
  ];
  $.ajax({
    url: '/timeline-new-events?' + parameters.join('&')
  }).done(function(data) {
    var allowedMaxScrollPosition = $(window).height() / 3;
    var scrollPosition = $(window).scrollTop();

    var newEvents = $(data);

    // 1) Insert events to the document to determine their size.
    newEvents.css({ visibility: 'hidden' });
    $('#events').append(newEvents);

    setTimeout(function() {
      // 2) Calculate size of inserting events.
      var insertedEventsHeight = getElementsHeight(newEvents);

      // 3) Move inserting events to the top of existing events.
      newEvents.css({ visibility: 'visible', display: 'none' });
      $('#events').prepend(newEvents);

      newEvents.animate({ height: 'show', opacity: 'show' }, 'normal');
      if (insertedEventsHeight > -1 &&
          scrollPosition > allowedMaxScrollPosition)
        $("html, body").animate({ scrollTop: scrollPosition + insertedEventsHeight }, 'normal');

      setTimeout(checkNewEvents, 3000);
    }, 0);
  });
}
checkNewEvents();
