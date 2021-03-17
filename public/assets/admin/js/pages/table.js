$(document).ready(function(){
  $('#staff_info').DataTable({
      searching: false,
      paging: false,
      info:false,
      language: {
        "emptyTable": "データが見つかりません。",
      },
      columns: [
        {name: 'one', orderable: false},
        {name: 'two', orderable: true},
        {name: 'three', orderable: false},
        {name: 'four', orderable: false},
        {name: 'five', orderable: false},
        {name: 'six', orderable: true},
        {name: 'seven', orderable: true},
        {name: 'eight', orderable: false},
      ]
  });

  $('#user_info').DataTable({
    searching: false,
    paging: false,
    info:false,
    language: {
      "emptyTable": "データが見つかりません。",
    },
    columns: [
      {name: 'one', orderable: false},
      {name: 'two', orderable: true},
      {name: 'three', orderable: false},
      {name: 'four', orderable: false},
      {name: 'five', orderable: false},
      {name: 'six', orderable: true},
      {name: 'seven', orderable: true},
      {name: 'eight', orderable: false},
    ]
  });

  $('#ratings_users').DataTable({
    searching: false,
    paging: false,
    info:false,
    language: {
      "emptyTable": "データが見つかりません。",
    },
    columns: [
      {name: 'one', orderable: false},
      {name: 'two', orderable: true},
      {name: 'three', orderable: false},
      {name: 'four', orderable: true},
      {name: 'five', orderable: true},
      {name: 'six', orderable: false},
      {name: 'seven', orderable: false},
    ]
  });

  $('#rates_users').DataTable({
    searching: false,
    paging: false,
    info:false,
    columns: [
      {name: 'one', orderable: false},
      {name: 'two', orderable: true},
      {name: 'three', orderable: false},
      {name: 'four', orderable: true},
      {name: 'five', orderable: true},
      {name: 'six', orderable: false},
      {name: 'seven', orderable: false},
    ]
  });

  $('#ratings_staffs').DataTable({
    searching: false,
    paging: false,
    info:false,
    language: {
      "emptyTable": "データが見つかりません。",
    },
    columns: [
      {name: 'one', orderable: false},
      {name: 'two', orderable: true},
      {name: 'three', orderable: false},
      {name: 'four', orderable: true},
      {name: 'five', orderable: true},
      {name: 'six', orderable: false},
      {name: 'seven', orderable: false},
    ]
  });


  $('#rates_staffs').DataTable({
    searching: false,
    paging: false,
    info:false,
    language: {
      "emptyTable": "データが見つかりません。",
    },
    columns: [
      {name: 'one', orderable: false},
      {name: 'two', orderable: true},
      {name: 'three', orderable: false},
      {name: 'four', orderable: true},
      {name: 'five', orderable: true},
      {name: 'six', orderable: false},
      {name: 'seven', orderable: false},
    ]
  });

  $('#order').DataTable({
    searching: false,
    paging: false,
    info:false,
    language: {
      "emptyTable": "データが見つかりません。",
    },
    columns: [
      {name: 'one', orderable: false},
      {name: 'two', orderable: true},
      {name: 'three', orderable: true},
      {name: 'four', orderable: true},
      {name: 'five', orderable: true},
      {name: 'six', orderable: true},
      {name: 'seven', orderable: true},
      {name: 'eight', orderable: false},
    ]
  });

  $('#orders_all').DataTable({
    searching: false,
    paging: false,
    info:false,
    columns: [
      {name: 'one', orderable: false},
      {name: 'two', orderable: true},
      {name: 'three', orderable: false},
      {name: 'four', orderable: false},
      {name: 'five', orderable: true},
      {name: 'six', orderable: true},
      {name: 'seven', orderable: true},
      {name: 'eight', orderable: true},
      {name: 'night', orderable: true},
      {name: 'ten', orderable: true},
    ]
  });

  $('#canceled_orders').DataTable({
    searching: false,
    paging: false,
    info:false,
    columns: [
      {name: 'one', orderable: false},
      {name: 'two', orderable: true},
      {name: 'three', orderable: false},
      {name: 'four', orderable: false},
      {name: 'five', orderable: true},
      {name: 'six', orderable: true},
      {name: 'seven', orderable: true},
    ]
  });

  $('#ordering_orders').DataTable({
    searching: false,
    paging: false,
    info:false,
    columns: [
      {name: 'one', orderable: false},
      {name: 'two', orderable: true},
      {name: 'three', orderable: false},
      {name: 'four', orderable: false},
      {name: 'five', orderable: true},
      {name: 'six', orderable: true},
      {name: 'seven', orderable: true},
      {name: 'eight', orderable: true},
      {name: 'night', orderable: true},
      {name: 'ten', orderable: true},
    ]
  });

    $('#list_image').DataTable({
    searching: false,
    paging: false,
    info:false,
    language: {
      "emptyTable": "データが見つかりません。",
    },
    columns: [
      {name: 'one', orderable: false},
      {name: 'two', orderable: true},
      {name: 'three', orderable: true},
      {name: 'four', orderable: false},
      {name: 'five', orderable: true},
      {name: 'six', orderable: false},
      {name: 'seven', orderable: true},
      {name: 'eight', orderable: false},
    ]
  });

  $('#notificationSchedule_info').DataTable({
    searching: false,
    paging: false,
    info:false,
    language: {
      "emptyTable": "データが見つかりません。",
    },
    columns: [
      {name: 'one', orderable: false},
      {name: 'two', orderable: true},
      {name: 'three', orderable: true},
      {name: 'four', orderable: true},
      {name: 'five', orderable: true},
      {name: 'six', orderable: false},
      {name: 'seven', orderable: false},
    ]
  });

  $('#select-limit').on('change', function (e) {
    var value = $(e.target).val();

    $('#limit-page').submit();

    e.preventDefault();
  });

  $('.iCheck-helper').on('click', function(e) {
    const parent = $(this).parent();
    const tdEle = parent.parent();
    if (parent.hasClass('checked')) {
      if (tdEle.hasClass('approve')) {
        tdEle.parent().find('td.deny .icheckbox_square-blue').hide();
      }
      if (tdEle.hasClass('deny')) {
          tdEle.parent().find('td.approve .icheckbox_square-blue').hide();
      }
    } else {
        if (tdEle.hasClass('approve')) {
            tdEle.parent().find('td.deny .icheckbox_square-blue').show();
        }
        if (tdEle.hasClass('deny')) {
            tdEle.parent().find('td.approve .icheckbox_square-blue').show();
        }
    }
  });

  $('#bt_verifications').on('click', function (e) {
    const checkboxes = $('input[name="cb_verification[]"]:checked');
    const deniedCheckbox = $('input[name="deny_verification[]"]:checked');


    if (checkboxes.length || deniedCheckbox.length) {
      const arrID = [];

      $.each(checkboxes, function (index, value) {
        arrID.push(this.value);
      });

      const deniedVeriffication = [];
      if (deniedCheckbox.length) {
          $.each(deniedCheckbox, function (index, value) {
              deniedVeriffication.push(this.value);
          });
      }

      $.ajax({
        headers: {
          'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: "POST",
        dataType: "html",
        url: '/admin/staffs/verifications/verify',
        data: {id: arrID, denied_ids: deniedVeriffication},
        success: function( msg ) {
          if (msg != '0') {
            $("#verificationSuccess").modal();
          } else {
            $("#verificationError").modal();
          }
        },
      });
    } else {
      $("#verificationError").modal();
    }
    e.preventDefault();
  });

  $('.del_NG').on('click', function (e) {
    var id = $(this).data('id');
    var name = $(this).data('name');

    $('#name_NG').html(name);

    var action = $('#modalDeleteForm').data('action');
    $('#modalDeleteForm').attr('action', action.replace(':id', id));

    $('#illegal_words_del').modal();
  });

  $('.edit_NG').on('click', function (e) {
    var id = $(this).data('id');
    var name = $(this).data('name');

    $('#edit_illegal').attr('value',name);

     var action = $('#modalEditForm').data('action');
    $('#modalEditForm').attr('action', action.replace(':id', id));

    $('#illegal_words_edit').modal();
  });

  $('.notify').on('click', function (e) {
    var display = $('.notifications').css('display');

    if ('none' == display) {
      $('.notifications').css('display','block');

      return false;
    } else {
      $('.notifications').css('display','none');

      return false;
    }
  });

  $('#btnModalCoupon').on('click', function (e) {
    $( "#formCreateCoupon" ).submit();
  });

  $('#updateCoupon').on('click', function (e) {
    $( "#formEditCoupon" ).submit();
  });

  $('.submit-transfer').on('click', function (e) {
    const checkboxes = $('input[name="transfer_ids[]"]:checked');
    if (checkboxes.length) {
      $('#form-transfer').submit();
    }
  });

  $('input[type=radio][name=type]').change(function() {
    if (this.value == '1') {
      $(".for_user").attr("selected","selected;");
      $(".for_user").css("display","block");
      $(".for_staff").css("display","none");
    }else if (this.value == '2') {
       $(".for_staff").attr("selected","selected;");
      $(".for_user").css("display","none");
      $(".for_staff").css("display","block");
    }
  });

  function readURL(input, id) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
          $(id).attr('src', e.target.result).height(300).width(400);;
      }

      reader.readAsDataURL(input.files[0]);
    }
  }

  $("#front_side").change(function(){
      readURL(this, "#front_side-img");
  });

  $("#back_side").change(function(){
      readURL(this, "#back_side-img");
  });

});

$(function () {

  $('#draftNotificationSchedule').on('hide.bs.modal', function () {
    $('#formNotificationSchedule').attr('action', '');
  });

  $('#btnSaveDraft').on('click', function (e) {
    var route = $('#route').val();
    var $form = $('#formNotificationSchedule');

    // Set action to create draft
    $form.attr('action', route);

    $form.submit();
  });
});

function makeRead (notificationId) {
  var notificationId = notificationId;

  $.ajax({
  headers: {
    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
  },
  type: "POST",
  dataType: "html",
  url: '/admin/notifications/make_read',
  data: {notificationId: notificationId},
    success: function(msg) {
      window.location.reload();
    },
  });
}
