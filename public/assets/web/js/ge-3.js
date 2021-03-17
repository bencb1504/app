$(function(){
    $('.details-list-box__pic li:nth-child(n+5)').each(function(){
        $(this).css({display:'none'});
    })
    $('.details-list-box__pic').each(function(){
      if ($('.details-list-box__pic li').length > 5) {
        $(this).append('<li class="dots"><img src="assets/images/common/dott.svg"></li>');
      }
    })
});
