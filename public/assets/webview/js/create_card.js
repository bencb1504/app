$(document).ready(function(){
  $('#btn-create').on('click', function (e) {
    var numberCard = $("#number-card").val().replace(/\s/g, '');
    var month = $("#month").val();
    var year = $("#year").val();
    var cardCvv = $("#card-cvv").val();

      $.ajax({
        headers: {
          'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: "POST",
        dataType: "json",
        url: '/webview/card/create',
        data: {
          number_card: numberCard,
          month: month,
          year: year,
          card_cvv: cardCvv,
        },
        success: function( msg ) {
          if(!msg.success) {
            var error = msg.error;
            $(".notify span").text(error);
          } else {
            window.location = msg.url;
          }
        },
      });
  });
});
