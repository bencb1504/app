$(function() {
  /*
   * Check textarea content first time
   */
  var str = localStorage.getItem('textarea_reason');

  if (str) {
    let sum = Array.from(str.split(/[\ufe00-\ufe0f]/).join("")).length;
    if (sum > 180) {
        $(".leave-comment__sum p").css("color", "red");

        $("#leaveSubmit").prop("disabled", true);
    }

    $(".leave-comment__sum p").text(sum.toFixed());
  }


  /*
   * Check local storage item
   */
  $(".leave-reason-list__item input:checkbox").change(function() {
    if (document.getElementById("reason1").checked) {
        localStorage.setItem('reason1', 'サービスの使い方が分からない');
    } else {
        localStorage.removeItem("reason1");
    }

    if (document.getElementById("reason2").checked) {
      localStorage.setItem('reason2', '金額が高すぎる');
    } else {
      localStorage.removeItem("reason2");
    }

    if (document.getElementById("reason3").checked) {
      localStorage.setItem('reason3', '一緒に飲みたいキャストがいない');
    } else {
      localStorage.removeItem("reason3");
    }

    if (document.getElementById("textareaCheck").checked) {
      localStorage.setItem('other_reason', 'checked');
    } else {
      $('.js-resign-message').text('');

      localStorage.removeItem("other_reason");
    }
  });


  /*
   * Check textarea content length before submit
   */
  $("#leaveSubmit").on("click", function() {
    if ($("#textareaCheck").prop("checked") == true && $(".leave-comment__input textarea").val().trim().length < 1 ){
      $('.js-resign-message').text("その他の理由が入力されていません");

      return false;
    }

    window.location.href = '/resigns/confirm';
  });


  /*
   * Check checkbox other reason
   */
  $("#textareaCheck").on("click", function() {
    if ($("#textareaCheck").prop("checked") == true ) {
      $(".leave-comment__input textarea").prop("disabled", false).focus();
    } else {
      $(".leave-comment__input textarea").prop("disabled", true);
    }
  });


  // textarea 文字数　コントロール
  $(".leave-comment__input textarea").on("keyup keypress change", function(e) {
    const str = $(this).val();

    let sum = Array.from(str.split(/[\ufe00-\ufe0f]/).join("")).length;

    if (sum > 180) {
      $(".leave-comment__sum p").css("color", "red");

      $("#leaveSubmit").prop("disabled", true);
    } else {
      $(".leave-comment__sum p").css("color", "");
      $("#leaveSubmit").prop("disabled", false);

      var textarea_reason = $(this).val().trim();
      localStorage.setItem('textarea_reason', textarea_reason);
    }

    $(".leave-comment__sum p").text(sum.toFixed());
  });

  $(document).on("keydown", ".leave-comment__input textarea", function(e) {
    const str = $(".leave-comment__input textarea").val();
    let sum = Array.from(str.split(/['\ud83c[\udf00-\udfff]','\ud83d[\udc00-\ude4f]','\ud83d[\ude80-\udeff]', ' ']/).join("|")).length;

    var keyCode = e.keyCode;

    if (keyCode == 8 || keyCode == 46 || keyCode == 37 || keyCode == 39) {
      return true;
    }

    if (sum >= 180) {
      $("#leaveSubmit").prop("disabled", true);
    }
  });

  //checkbox 判定
  $(".leave-reason-list .checkbox").on("click", function() {
    if ($(".cb-cancel:checked").length > 0 ) {
      $(".leave-submit").prop("disabled", false);
    } else {
      $(".leave-submit").prop("disabled", true);
    }
  });

  // check textarea
  $('textarea#description').focusout(function() {
    $('.js-resign-message').text('');

    if ($(this).val().trim().length < 1) {
      $('.js-resign-message').text("その他の理由が入力されていません");
    }
  });

  // leave_confirm page
  $(".leave-footer__check .checkbox").on("change", function(e) {
    if (document.getElementById("check-agree").checked) {
      $("#withdraw").prop("disabled", false);
    } else {
      $("#withdraw").prop("disabled", true);
    }
  });

  if ($("#leaveSubmit").length) {
    if (localStorage.getItem("reason1")) {
      $("#reason1").prop('checked', true);
    }

    if (localStorage.getItem("reason2")) {
      $("#reason2").prop('checked', true);
    }

    if (localStorage.getItem("reason3")) {
      $("#reason3").prop('checked', true);
    }

    if (localStorage.getItem("other_reason")) {
      $("#textareaCheck").prop('checked', true);
      $(".leave-comment__input textarea").prop("disabled", false).focus();
    }

    if (localStorage.getItem("textarea_reason")) {
      $(".leave-comment__input textarea").val(localStorage.getItem("textarea_reason"));
      $(".leave-comment__sum p.js-sum-of-content").text(localStorage.getItem("textarea_reason").trim().length);
    }

    // check data when back
    if (localStorage.getItem('reason1') || localStorage.getItem('reason2') || localStorage.getItem('reason3') || localStorage.getItem('other_reason')) {
      $("#leaveSubmit").prop("disabled", false);
    }
  }
});
