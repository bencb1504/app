$(function(){
  var detailsListButton =$(".details-list__button");
  detailsListButton.on("click",function(){
    var thisContent = $(this).parent(".details-list__header").next(".details-list__content");
    thisContent.toggleClass("hide");
    $(this).toggleClass("hide");
  })

});
