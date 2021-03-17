$(document).ready(function(){
  $('#change-point-form').submit(function(e){
    const point = $('#point').val();
    const correctionType = $('#correction-type').val();
    var id = $('#link-change-point').attr('data-user-id');

    $.ajax({
      url: $(this).attr('action'),
      method: 'PUT',
      data: {
        _token: $('meta[name="csrf-token"]').attr('content'),
        point: point,
        correction_type: correctionType,
      },
      success: function(result, xhr){
        if (result.success) {
          window.location.reload();
        }
      },
      error: function(xhr) {
        $('#point-alert').empty();
        const errors = xhr.responseJSON.errors;

        for(const error of  errors) {
          $('#point-alert').append(`<strong>${error}</strong>`);
        }
      }
    });

    e.preventDefault();
  });
});
