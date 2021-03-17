$(function(){
  let winH = $(window).height();
  let areaH = winH - 150;
//$(".timeline-edit__area").css("height",areaH);

  $(".timeline-edit__area").focusin(function(){
    var inputTop = "45%";
    $(".timeline-edit__input").css("bottom",inputTop);
    //$(".timeline-edit__area").css("height",280);
  })

  $(".timeline-edit__area").focusout(function(){

    $(".timeline-edit__input").css("bottom",0);
    //$(".timeline-edit__area").css("height",areaH);
  });

  /////////////////////////////
  // text sum
  //////////////////////////

  $(document).on("keyup", ".timeline-edit__area", function(){
    let sum = $(".timeline-edit__area").text().length ;
    $(".timeline-edit-sum__text").text(sum.toFixed() );
  })




  ////////////////////////////////////////
  //          timeline-edit-position
  /////////////////////////////////

  let $timelineEditPosition = $(".timeline-edit-position img");

  $timelineEditPosition.on("click", function(){
    console.log("ffff")
    let modalOverlay = $("<div class='modal_overlay'>\
                            <div class='modal_content'>\
                              <div class='position-box'>\
                                <div class='position-box__close'></div>\
                                <div class='position-box__head'>チェックイン</div>\
                                <div class='position-box__body'>\
                                  <input id='positionInput' type='text' placeholder='どこにいますか?'>\
                                </div>\
                                <div class='position-box__foot'>\
                                  <button id='positionOk'>確認</button>\
                                </div>\
                               </div>\
                              </div>")
    $(".mm-page").append(modalOverlay);
    $(".modal_overlay").addClass("active");
  })

  $(document).on("click", "#positionOk", function(){

    let positionText = $("#positionInput").val();
    if( positionText != "" ){
      $(".user-info__bottom p").text(positionText);
      $(this).parents(".modal_overlay").fadeOut(400,function(){
        $(this).remove();
      });
    }
  })


  $(document).on("click", ".position-box__close", function(){
    $(this).parents(".modal_overlay").fadeOut(400,function(){
      $(this).remove();
    });

  })






  // $('div[contenteditable]').keydown(function(e) {
  //     // trap the return key being pressed
  //     if (e.keyCode === 13) {
  //       // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
  //       document.execCommand('insertHTML', false, '<br><br>');
  //       // prevent the default behaviour of return key pressed
  //       return false;
  //     }
  //   });


  /////////////////////////////////
  //   timeline image
  ////////////////////////////////


  let timelineEditPic = $(".timeline-edit-pic");

// document.execCommand("DefaultParagraphSeparator", false, "br");



  timelineEditPic.on("change",function(e){
    var $uploadPreview = $(".timeline-edit__area");
    var _insertPicture = e.target.files[0];
    //console.log(_insertPicture);
    var reader = new FileReader();
    reader.onload = function(e){
      var sel = document.selection;
      if (sel) {
          var textRange = sel.createRange();
          document.execCommand("insertHTML", false, "<div><br></div><div class='timeline-edit-image' contenteditable='false'><img src=" + e.target.result +"><div class='timeline-edit-image__del'><img src='assets/web/images/common/timeline-create-img_del.svg'></div></div><div><br></div>");
          // document.execCommand('insertImage', false, e.target.result);
          textRange.collapse(false);
          textRange.select();
      } else {
          document.execCommand("insertHTML", false, "<div><br></div><div class='timeline-edit-image' contenteditable='false'><img src=" + e.target.result +"><div class='timeline-edit-image__del'><img src='assets/web/images/common/timeline-create-img_del.svg'></div></div><div><br></div>");
          // document.execCommand('insertImage', false, e.target.result);
      }
    };
　　 reader.readAsDataURL(_insertPicture);
    $(".timeline-edit-pic input").remove();








  });



  $(document).on("click", ".timeline-edit-image__del", function(){
    $(".timeline-edit-pic").append("<input type='file' style='display: none' name='image' accept='image/*'>");
    $(this).parent(".timeline-edit-image").fadeOut(300,function(){
      $(this).remove();
    });
  })












})
