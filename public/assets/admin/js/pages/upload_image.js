$(document).ready(function(){
  var avatarId = null;
  var url = null;

  userId = $('#user_id').val();

  $('body').on('change', '#upload-avatar', function (e) {
    var files = this.files;
    var urlUpload = $('#url-upload').val();

    if (files.length === 0) {
      return;
    }

    var data = new FormData();
    data.append('_token', $('meta[name="csrf-token"]').attr('content'));
    data.append('userId', userId);
    data.append('image', files[0]);

    $.ajax({
      url: urlUpload,
      method: 'POST',
      data: data,
      contentType: false,
      processData: false,
      beforeSend: function(xhr, type) {
        if (!type.crossDomain) {
          xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
        }
      },
      success: function(result) {
        $(".list-avatar").html(result.view);
      },
      error: function(xhr) {
        $('.error-message').empty();
        error = xhr.responseJSON.error.image;
        $('.error-message').addClass('float');
        $('.error-message').append('<strong style="color: red;">' + error[0] + '</strong>');
      }
    });

    e.preventDefault();
  });

  $("body").on('click', '.avatar-cover', function () {
    avatarId = $(this).data('id');
    url = '/admin/' + userId + '/avatars/' + avatarId;

    $('#popup-img #set-avatar-default').attr('action', url);
    $('#popup-img #delete-avatar').attr('action', url);

    $('#popup-img').modal('show');
  });

  $('body').on('change', '#update-avatar', function (e) {
    var files = this.files;

    if (files.length === 0) {
      return;
    }

    var data = new FormData();
    data.append('_token', $('meta[name="csrf-token"]').attr('content'));
    data.append('userId', userId);
    data.append('image', files[0]);

    $.ajax({
      url: url,
      method: 'POST',
      data: data,
      contentType: false,
      processData: false,
      beforeSend: function(xhr, type) {
        if (!type.crossDomain) {
          xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
        }
      },
      success: function(result) {
        $('#flash').hide();
        $('#popup-img').modal('hide');
        $('.message-alert').html('<div class="alert alert-success fade in" id="flash"><a href="#" class="close" data-dismiss="alert">&times;</a>' + result.message + '</div>');
        $(".list-avatar").html(result.view);
      },
      error: function(xhr) {
        $('.popup-error-message').empty();
        error = xhr.responseJSON.error.image;
        $('.popup-error-message').html('<strong style="color: red;">' + error[0] + '</strong>');
      }
    });

    e.preventDefault();
  });
});
