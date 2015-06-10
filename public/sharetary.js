function formattedDatetime(date) {
  return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).substr(-2) + '-' + ('0' + date.getDate()).substr(-2) + ' ' +
           ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ':' + ('0' + date.getSeconds()).substr(-2);
}

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


function fillDatetimeFields(prefix) {
  var filterValue = $('#filter-' + prefix).attr('value');
  if (filterValue) {
    var date = new Date(parseInt(filterValue) * 1000);
    $('#filter-' + prefix + '-year').attr('value', date.getFullYear());
    $('#filter-' + prefix + '-month').attr('value', date.getMonth() + 1);
    $('#filter-' + prefix + '-date').attr('value', date.getDate());
    $('#filter-' + prefix + '-hour').attr('value', date.getHours());
    $('#filter-' + prefix + '-minute').attr('value', date.getMinutes());
    $('#filter-' + prefix + '-second').attr('value', date.getSeconds());
  }
  else {
    $('#filter-' + prefix + '-year').attr('value', '');
    $('#filter-' + prefix + '-month').attr('value', '');
    $('#filter-' + prefix + '-date').attr('value', '');
    $('#filter-' + prefix + '-hour').attr('value', '');
    $('#filter-' + prefix + '-minute').attr('value', '');
    $('#filter-' + prefix + '-second').attr('value', '');
  }
}


$(function() {
  fillDatetimeFields('after');
  fillDatetimeFields('before');

  var id = encodeURIComponent(location.hash.substr(1));
  if (id)
    scrollToTarget(id);
});
