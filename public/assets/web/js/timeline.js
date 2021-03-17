$(function(){



  //投稿削除ボタン
  let timeLineDelBtn = $(".user-info__del");
  timeLineDelBtn.on("click",function(){

    if( !$(".modal_overlay").hasClass("active") ){
      $(".modal_overlay").addClass("active");
    }else{
      $(".modal_overlay").removeClass("active");
    }

  })
  $(document).on("click",".close_button",function(){
    $(".modal_overlay").removeClass("active");
  })


  $(".timeline-like__icon").on("click",function(){
    let sum = $(this).next(".timeline-like__sum").children("a").text();
    if(!$(this).hasClass("active")){
      $(this).addClass("active");
      $(this).children('img').attr('src',"./assets/web/images/common/like-icon_on.svg");
      sum = parseInt(sum) + 1;

    }else{
      $(this).removeClass("active");
      $(this).children('img').attr('src',"./assets/web/images/common/like-icon.svg");
      sum = parseInt(sum) - 1;
    }
    $(this).next(".timeline-like__sum").children("a").text(sum);
  })





  //

})
