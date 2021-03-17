$(function () {
  $('.cast-photo__show').slick({
    lazyLoad: 'progressive',
    dots: true,
    customPaging: function (slick, index) {
      slick.$slides.eq(index).css({
          "background-image":"url('/assets/web/images/gm1/ic_default_avatar@3x.png')",
          "background-repeat":"no-repeat",
          "background-size":"cover",
      });
      var targetImage = slick.$slides.eq(index).attr('data-lazy');

      return '<img src=' + targetImage +' class="slide-image">';
    }
  });
});

$(function () {
	var $img = $(".slick-track img");
	var imgWidth = $img.width();
	$img.css('height', imgWidth);
});
