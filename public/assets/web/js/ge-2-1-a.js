$(function(){
  // button green-----------------------------------
  $('body').on('change', ".button--green.area",function(){
    var thisButton = $(this);
    //$(this).css("background","red")
    $(this).siblings().removeClass("active");
    $(this).toggleClass("active");
    if($(this).attr("id") != "area_input"){
      $(".area-input").css("display","none");
    }
  })
  $('body').on('change', "#area_input",function(){
    if($("input[type='radio']:checked")){
      $(".area-input").css("display","flex");
    }
  })


  //date_input--------------------------------------------
  var dateButton = $(".button--green.date");
  dateButton.on("change",function(){
    var thisButton = $(this);
    $(this).siblings().removeClass("active");
    $(this).toggleClass("active");
    if($(this).attr("id") != "date_input"){
      $(".date-input").css("display","none");
    }
  })
  $("#date_input").on("change",function(){
    if($("input[type='radio']:checked")){
      $(".date-input").css("display","flex");
    }
  })

  $(".date-input").on("click",function(){
    $(".overlay").fadeIn().css("display","flex")
  })

  $(".date-select__cancel").on("click",function(){
    $(".overlay").fadeOut();
  })



  //time_input--------------------------------------------
  var tiemButton = $(".button--green.time");
  tiemButton.on("change",function(){
    var thisButton = $(this);
    $(this).siblings().removeClass("active");
    $(this).toggleClass("active");
    if($(this).attr("id") != "time-input"){
      $(".time-input").css("display","none");
    }
  })
  $("#time-input").on("change",function(){
    if($("input[type='radio']:checked")){
      $(".time-input").css("display","flex");
    }
  })


  //-----------------------------
  // $(".cast-number__button-plus").on("click",function(){
  //   var number_val = parseInt( $(".cast-number__value input").val());
  //   number_val = number_val + 1;
  //   $(".cast-number__value input").val(number_val)
  // })

  // $(".cast-number__button-minus").on("click",function(){
  //   var number_val = parseInt( $(".cast-number__value input").val());
  //   if(number_val > 0){
  //     number_val = number_val - 1;
  //     $(".cast-number__value input").val(number_val)
  //   }
  // })

})
