$(document).ready(function() {
  $('body').on('click', '#popup-app-version', function () {
    $('.help-block').each(function() {
      $(this).html('');
    });

    var data = JSON.parse($(this).attr('data-app-version'));
    var url = $(this).attr('data-url');
    var type = $(this).attr('data-type');

    $('#update-app-version').attr('action', url);
    $('.modal-app-version').attr('id', 'app-version-' + data.id);
    $('#type').html(type);
    $('#version').val(data.version);
  });

  $('#update-app-version').submit(function(e) {
    var version = $('#version').val();

    $.ajax({
      url: $(this).attr('action'),
      method: 'PUT',
      data: {
        _token: $('meta[name="csrf-token"]').attr('content'),
        version: version,
      },
      success: function(result, xhr){
        if (result.success) {
          window.location.reload();
        }
      },
      error: function(xhr) {
        $('.help-block').each(function() {
          $(this).html('');
        });
        const errors = xhr.responseJSON.errors;

        $('#version-error').html(errors[0]);
      }
    });

    e.preventDefault();
  });
});