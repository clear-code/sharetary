function checkNewEvents() {
  var boundary = $('.event-item').first().attr('data-created-at');
  $.ajax({
    url: '/timeline-new-events?boundary=' + boundary
  }).done(function(data) {
    var newEvents = $(data);
    newEvents.css({ display: 'none' });
    $('#events').prepend(newEvents);
    newEvents.animate({ height: 'show', opacity: 'show' }, 'normal');
    setTimeout(checkNewEvents, 3000);
  });
}
checkNewEvents();
