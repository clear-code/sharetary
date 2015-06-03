function scrollToTarget(id) {
  var item = document.getElementById(id);
  if (item)
    $('html, body').animate({ scrollTop: $(item).offset().top }, 'normal');
}

function scrollToEvent(link) {
  var id = link.href.split('#')[1];
  if (id)
    scrollToTarget(id);
}

$(function() {
  var id = encodeURIComponent(location.hash.substr(1));
  if (id)
    scrollToTarget(id);
});
