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
  var filterValue = $('#filter-' + prefix).val();
  if (filterValue) {
    var date = new Date(parseInt(filterValue) * 1000);
    $('#filter-' + prefix + '-year').val(date.getFullYear());
    $('#filter-' + prefix + '-month').val(date.getMonth() + 1);
    $('#filter-' + prefix + '-date').val(date.getDate());
    $('#filter-' + prefix + '-hour').val(date.getHours());
    $('#filter-' + prefix + '-minute').val(date.getMinutes());
    $('#filter-' + prefix + '-second').val(date.getSeconds());
  }
  else {
    $('#filter-' + prefix + '-year').val('');
    $('#filter-' + prefix + '-month').val('');
    $('#filter-' + prefix + '-date').val('');
    $('#filter-' + prefix + '-hour').val('');
    $('#filter-' + prefix + '-minute').val('');
    $('#filter-' + prefix + '-second').val('');
  }
}

updateFilterFromFields.timers = {};
function updateFilterFromFields(prefix) {
  if (updateFilterFromFields.timers[prefix])
    window.clearTimeout(updateFilterFromFields.timers[prefix]);
  updateFilterFromFields.timers[prefix] = window.setTimeout(function() {
    delete updateFilterFromFields.timers[prefix];
    var date = new Date();
    date.setFullYear(parseInt($('#filter-' + prefix + '-year').val() || 0),
                     parseInt($('#filter-' + prefix + '-month').val() || '1') - 1,
                     parseInt($('#filter-' + prefix + '-date').val() || 1));
    date.setHours(parseInt($('#filter-' + prefix + '-hours').val() || 0),
                  parseInt($('#filter-' + prefix + '-minute').val() || 0),
                  parseInt($('#filter-' + prefix + '-second').val() || 0),
                  0);
    var unixtime = Math.floor(date.getTime() / 1000);
    $('#filter-' + prefix).val(unixtime);
  }, 100);
}


$(function() {
  fillDatetimeFields('after');
  fillDatetimeFields('before');

  var id = encodeURIComponent(location.hash.substr(1));
  if (id)
    scrollToTarget(id);
});
