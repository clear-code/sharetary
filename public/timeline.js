function checkNewEvents() {
  var boundary = $('.event-item').first().attr('data-timestamp');
  $.ajax({
    url: '/timeline-new-events?boundary=' + boundary
  }).done(function(data) {
    var newEvents = $(data);
    $('#events').prepend(newEvents);
    setTimeout(checkNewEvents, 3000);
  });
}
checkNewEvents();
