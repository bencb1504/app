$(function(){
  var greenButton =$(".form-grpup .button--green");
  var activeSum;
  greenButton.on("change",function(){
    activeSum = $(".active").length;
    if(activeSum >= 5 && !$(this).hasClass("active")){
      alert("5つまで選択することができます");
    }else{
      $(this).toggleClass("active");
    }
    
  })
})
