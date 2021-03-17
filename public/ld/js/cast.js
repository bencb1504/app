$(document).ready(function () {
$(".btn-bounce1").hover(
function () {
$(".bounce1-txt").addClass("animated bounce");
},
function () {
$(".bounce1-txt").removeClass("animated bounce");
}
);
});



$(function() {
  $('.inviewfadeIn').on('inview', function(event, isInView) {
    if (isInView) {
      $(this).addClass('fadeIn');
    }
  });
  $('.inviewfadeInUp').on('inview', function(event, isInView) {
    if (isInView) {
      $(this).addClass('fadeInUp');
    }
  });
  $('.price-border-yellow').on('inview', function(event, isInView) {
    if (isInView) {
      $(this).addClass('extend');
    }
  });
});