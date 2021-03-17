$(document).ready(function() {
  var referrer = document.referrer;

  if (referrer) {
    $('.btn-back.header-item a').attr('href', referrer);
  } else {
    $('.btn-back.header-item a').attr('href', 'cheers://back');
  }

  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var mypage = $('.h-logo a').attr('href');

  $('.h-logo a').click(function (e) {
    e.preventDefault();

    if (/android/i.test(userAgent)) {
      window.location = 'cheers://home';
    } else {
      window.location = mypage;
    }
  });

  $('#year-select')
  .find('option')
  .each(function (index, value) {
    if (index > 0) {
      $(value).text($(value).text() + '”N');
    }
  });
});
