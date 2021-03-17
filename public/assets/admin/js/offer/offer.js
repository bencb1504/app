const DEVICETYPE = {
  'IOS': 1,
  'ANDROID': 2,
  'WEB': 3
};

function updateLocalStorageValue(key, data) {
  var oldData = JSON.parse(localStorage.getItem(key));
  var newData;

  if (oldData) {
    newData = Object.assign({}, oldData, data);
  } else {
    newData = data;
  }

  localStorage.setItem(key, JSON.stringify(newData));
}

function renderListGuests(device_type, search = null, arrGuests = null)
{
  $.ajax({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    },
    type: "GET",
    url: '/admin/orders/list_guests',
    data: {
        'device_type': device_type,
        'search': search
    },
    success: function (response) {
      $('#list-guests tbody').html(response.view);

      if (arrGuests) {
          $.each($('.checked-guest'),function(index,val){
            if (arrGuests.indexOf(val.value) >-1) {
              $(this).prop('checked', true);
            }
          })
      }
    },
  });
}

function handleOpenPopupSelectGuest() {
  $('body').on('click', '.show-list-guests', function (event) {

      $('.input-search-guest').val('');
    
      let deviceType = DEVICETYPE.ANDROID;

      let arrGuests = null;

      if($('.choose-guests').val()) {
        arrGuests = $('.choose-guests').val().split(',');
      }

      renderListGuests(deviceType, null, arrGuests);
  })
}


function handleSearchGuest() {
  $('body').on('keyup', '.input-search-guest', function (event) {
    const search = $(this).val();
    let deviceType = DEVICETYPE.ANDROID;

    let arrGuests = null;

    if($('.choose-guests').val()) {
      arrGuests = $('.choose-guests').val().split(',');
    }
    renderListGuests(deviceType, search, arrGuests);
  })
}

function chooseGuests()
{
  $('body').on('change', '.checked-guest', function (event) {
    let checkedId = $(this).val();
    let arrIds = $('.choose-guests').val();

    if(arrIds) {
      arrIds = arrIds.split(',');
    } else {
      arrIds = [];    
    }
   
    if(arrIds.indexOf(checkedId) > -1) {
      arrIds.splice(arrIds.indexOf(checkedId), 1);
    } else {
      arrIds.push(checkedId);
    }

    if (arrIds.length) {
      $('.btn-choose-guests').attr('data-target', "#choose-guests");
    } else {
      $('.btn-choose-guests').attr('data-target', "#err-choose-guests");
    }
    
    arrIds.toString();

    $('.choose-guests').val(arrIds);
  })
}

function sendLineToGuest()
{
  $('body').on('click', '#send-line-to-guest', function (event) {
    $('#form-send-line').submit();
  })
}

$(document).ready(function(){
  $('#sbm-offer').on("click", function(event){
    var classId = $('#class-id-offer').val();

    if(localStorage.getItem("offer")){
      var offer = JSON.parse(localStorage.getItem("offer"));
      if(offer.arrIds) {
        if (offer.class_id != classId) {
          var params = {
            arrIds: [],
            class_id : classId,
            current_point : 0,
          }

          updateLocalStorageValue('offer', params);
        }
      }
    }
  })

  $('#start_time_offer').on('change', function (e) {
    var startTimeFrom = $(this).val();

    var startTimeTo = getStartTimeTo(startTimeFrom);
    var html ='';
    for (var i = 0; i < startTimeTo.length; i++) {
       html += `<option value="${startTimeTo[i]}">${startTimeTo[i]}</option>`;
    }

    $('#end_time_offer').html(html);

    var time = $("#end_time_offer option:selected").val();

    var params = {
        end_time: time,
      };

    updateLocalStorageValue('offer', params);

  });

  function getStartTimeTo(data)
  {
    var startTimeFrom = data.split(":");
    var startHourFrom = startTimeFrom[0];
    var startMinuteFrom = startTimeFrom[1];

    var startHourTo = parseInt(startHourFrom);
    startHourTo +=1;
    var startMinuteTo   = startMinuteFrom;
    var arrTimeTo = [];

    for (var i = startHourTo; i <= 26; i++) {
      var value = i < 10 ? `0${parseInt(i)}` : i;
      arrTimeTo.push(value + ':00',value + ':30')
    }

    if (startMinuteTo == 30 ) {
      arrTimeTo.splice(0,1);
    }

    arrTimeTo.splice(arrTimeTo.length-1,1);

    return arrTimeTo;
  }

  if ($(".cast-ids-edit").length) {
    if(!localStorage.getItem("offer")){
      var arrIds = $(".cast-ids-edit").val();
      arrIds =arrIds.split(',');
      var point = $(".temp_point-edit").val();
      var classId = $(".class_id-edit").val();

      var date = $(".date-offer-edit").val();
      var startTimeFrom = $(".start_time_from-edit").val();
      var startTimeTo = $(".start_time_to-edit").val();
      var duration = $(".duration-edit").val();
      var comment = $(".comment-edit").val();
      var expiredDate = $('.expired-date-edit').val();
      var expiredTime = $('.expired-time-edit').val();
      var prefectureId = $('.prefecture_id-edit').val();

      var params = {
        arrIds: arrIds,
        current_point: point,
        class_id: classId,
        duration_offer: duration,
        comment: comment,
        end_time: startTimeTo,
        start_time: startTimeFrom,
        date: date,
        expired_date: expiredDate,
        expired_time: expiredTime,
        prefecture_id: prefectureId
      };

      updateLocalStorageValue('offer', params);
    }

  }

  //select-cast
  $(".iCheck-helper").on("click", function(event){
    var checkedId = $(this).siblings("input:checkbox[name='casts_offer[]']:checked").val();
    var searchId = $(this).siblings("input:checkbox[name='casts_offer[]']").val();
    var classId = $(this).siblings("input:checkbox[name='casts_offer[]']").data("id");

    if(localStorage.getItem("offer")){
      var offer = JSON.parse(localStorage.getItem("offer"));
      if(offer.arrIds) {
        //isset arrIds
        var arrIds = offer.arrIds;

        if(6 > arrIds.length && arrIds.length >= 0) {
          if(checkedId) {
            if (offer.class_id == classId) {
              $(this).css('opacity', 0);
              arrIds.push(checkedId);
            } else {
              $(this).css('opacity', 1);
            }
          } else {
            $(this).css('opacity', 1);

            if(arrIds.indexOf(searchId) > -1) {
              arrIds.splice(arrIds.indexOf(searchId), 1);
            }
          }
        } else {
          if(arrIds.indexOf(searchId) > -1) {
            arrIds.splice(arrIds.indexOf(searchId), 1);
          }

          $(this).siblings("input:checkbox[name='casts_offer[]']").prop('checked', false);
          $(this).css('opacity', 1)
        }

        var params = {
              arrIds: arrIds,
            };

        if(arrIds.length) {
          var nomineeIds = arrIds.toString();
          var date =  $('.date-offer option:selected').val();
          var duration = $("#duration_offer option:selected").val();
          var time = $('#start_time_offer option:selected').val();
          $('.class-id-offer').val(classId);
          $.ajax({
            headers: {
              'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            type: "POST",
            dataType: "html",
            url: '/admin/offers/price',
            data: {
              date : date,
              start_time : time,
              type :2,
              duration :duration,
              total_cast :arrIds.length,
              nominee_ids : nomineeIds,
              class_id : classId,
              offer : 1
            },
            success: function( val ) {
              var point = {
                current_point: val,
              };
              updateLocalStorageValue('offer', point);

              $('#current-point-offer').val(val);

              val = parseInt(val).toLocaleString(undefined,{ minimumFractionDigits: 0 });
              $('.show-current-point-offer').text('予定合計ポイント : ' + val + 'P~' );
            },
          });
        } else {
          $('.show-current-point-offer').text('予定合計ポイント : 0P~' );
          $('#current-point-offer').val(0);
          var point = {
            current_point: 0,
          };
          updateLocalStorageValue('offer', point);
        }


      } else {
        //not isset arrIds
        var arrIds = [];
        if(checkedId) {
          arrIds.push(checkedId);
        }

        $('.class-id-offer').val(classId);
        var nomineeIds = arrIds.toString();
        var date =  $('.date-offer option:selected').val();
        var duration = $("#duration_offer option:selected").val();
        var time = $('#start_time_offer option:selected').val();

        $.ajax({
          headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
          },
          type: "POST",
          dataType: "html",
          url: '/admin/offers/price',
          data: {
            date : date,
            start_time : time,
            type :2,
            duration :duration,
            total_cast :arrIds.length,
            nominee_ids : nomineeIds,
            class_id : classId,
            offer : 1
          },
          success: function( val ) {
            $('#current-point-offer').val(val);
            var point = {
              current_point: val,
            };
            updateLocalStorageValue('offer', point);
            val = parseInt(val).toLocaleString(undefined,{ minimumFractionDigits: 0 });
            $('.show-current-point-offer').text('予定合計ポイント : ' + val + 'P~' );
          },
        });


        var params = {
            arrIds: arrIds,
            class_id: classId
          };
      }
    } else {
      //not isset arrIds
      var arrIds = [];
      if(checkedId) {
        arrIds.push(checkedId);
      }
      $('.class-id-offer').val(classId);
      var nomineeIds = arrIds.toString();
      var date =  $('.date-offer option:selected').val();
      var duration = $("#duration_offer option:selected").val();
      var time = $('#start_time_offer option:selected').val();

      $.ajax({
        headers: {
          'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: "POST",
        dataType: "html",
        url: '/admin/offers/price',
        data: {
          date : date,
          start_time : time,
          type :2,
          duration :duration,
          total_cast :arrIds.length,
          nominee_ids : nomineeIds,
          class_id : classId,
          offer : 1
        },
        success: function( val ) {
          $('#current-point-offer').val(val);
          var point = {
            current_point: val,
          };
          updateLocalStorageValue('offer', point);

          val = parseInt(val).toLocaleString(undefined,{ minimumFractionDigits: 0 });

          $('.show-current-point-offer').text('予定合計ポイント : ' + val + 'P~' );
        },
      });

      var params = {
            arrIds: arrIds,
            class_id: classId
          };
    }

    $(".cast-ids-offer").val(arrIds.toString());

    updateLocalStorageValue('offer', params);

    var totalCast = JSON.parse(localStorage.getItem("offer"));
    totalCast = totalCast.arrIds;

    $('.total-cast-offer').text('現在選択しているキャスト: ' + totalCast.length + '名');
  })

  //comment
  $("#comment-offer").on('change', function(e) {
    var params = {
      comment: $(this).val(),
    };
    updateLocalStorageValue('offer', params);
  });

  //duration
  $("#duration_offer").on("change",function(){
    var duration = $("#duration_offer option:selected").val();
    if(localStorage.getItem("offer")){
      var offer = JSON.parse(localStorage.getItem("offer"));
      if(offer.arrIds.length) {
        var nomineeIds = offer.arrIds.toString();
        var date =  $('.date-offer option:selected').val();

        var time = $('#start_time_offer option:selected').val();

        if(offer.class_id) {
          var classId = offer.class_id
        } else {
          var classId =1;
        }

        $.ajax({
          headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
          },
          type: "POST",
          dataType: "html",
          url: '/admin/offers/price',
          data: {
            date : date,
            start_time : time,
            type :2,
            duration :duration,
            total_cast :offer.arrIds.length,
            nominee_ids : nomineeIds,
            class_id : classId,
            offer : 1
          },
          success: function( val ) {
            $('#current-point-offer').val(val);
            var point = {
              current_point: val,
            };
            updateLocalStorageValue('offer', point);

            val = parseInt(val).toLocaleString(undefined,{ minimumFractionDigits: 0 });
            $('.show-current-point-offer').text('予定合計ポイント : ' + val + 'P~' );
          },
        });

      }
    }

    var params = {
        duration_offer: duration,
      };

    updateLocalStorageValue('offer', params);
  });

  //date

  $("#select-date-offer").on("change",function(){
    var date = $("#select-date-offer option:selected").val();

     var params = {
        date: date,
      };

    updateLocalStorageValue('offer', params);
  })

  //expired_date_offer

  $("#expired_date_offer").on("change",function(){
    var date = $("#expired_date_offer option:selected").val();

     var params = {
        expired_date: date,
      };

    updateLocalStorageValue('offer', params);
  })

  //expired_time_offer
  $("#expired_time_offer").on("change",function(){
    var time = $("#expired_time_offer option:selected").val();

    var params = {
        expired_time: time,
      };

    updateLocalStorageValue('offer', params);
  });

  //start_time
  $("#start_time_offer").on("change",function(){
    var time = $("#start_time_offer option:selected").val();
    if(localStorage.getItem("offer")){
      var offer = JSON.parse(localStorage.getItem("offer"));
      if(offer.arrIds) {
        if(offer.arrIds.length) {
          var duration = $("#duration_offer option:selected").val();
          var nomineeIds = offer.arrIds.toString();
          var date =  $('.date-offer option:selected').val();

          if(offer.class_id) {
            var classId = offer.class_id
          } else {
            var classId =1;
          }

          $.ajax({
            headers: {
              'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            type: "POST",
            dataType: "html",
            url: '/admin/offers/price',
            data: {
              date : date,
              start_time : time,
              type :2,
              duration :duration,
              total_cast :offer.arrIds.length,
              nominee_ids : nomineeIds,
              class_id : classId,
              offer : 1
            },
            success: function( val ) {
              $('#current-point-offer').val(val);
              var point = {
                current_point: val,
              };
              updateLocalStorageValue('offer', point);

              val = parseInt(val).toLocaleString(undefined,{ minimumFractionDigits: 0 });
              $('.show-current-point-offer').text('予定合計ポイント : ' + val + 'P~' );
            },
          });
        }
      }
    }

    var params = {
        start_time: time,
      };

    updateLocalStorageValue('offer', params);
  });

  //end_time
  $("#end_time_offer").on("change",function(){
    var time = $("#end_time_offer option:selected").val();

    var params = {
        end_time: time,
      };

    updateLocalStorageValue('offer', params);
  });

  //select prefecture
  $("#area_offer").on("change",function(){
    var prefectureId = $("#area_offer option:selected").val();

    var params = {
        prefecture_id: prefectureId,
      };

    updateLocalStorageValue('offer', params);
  });
  

  if(localStorage.getItem("offer")){
    var offer = JSON.parse(localStorage.getItem("offer"));
    if(offer.class_id) {
      $('.class-id-offer').val(offer.class_id);
       $('.class_id-offer').val(offer.class_id);
    }
    //select-cast
    if(offer.arrIds){

      const cbCastOffer = $("input:checkbox[name='casts_offer[]']");
      var arrIds = offer.arrIds;
      $('.total-cast-offer').text('現在選択しているキャスト: ' + arrIds.length + '名');

      if(offer.arrIds.length){
        $(".cast-ids-offer").val(offer.arrIds.toString());
        $.each(cbCastOffer,function(index,val){
          if (arrIds.indexOf(val.value) >-1) {
            $(this).prop('checked', true);
            $(this).parent().addClass('checked');
          }
        })
        pointOffer = parseInt(offer.current_point).toLocaleString(undefined,{ minimumFractionDigits: 0 });
        $('.show-current-point-offer').text('予定合計ポイント : ' + pointOffer + 'P~' );
        $('#current-point-offer').val(offer.current_point);
        $('.class-id-offer').val(offer.class_id);
      }
    }

    //comment
    if(offer.comment){
      $("#comment-offer").text(offer.comment);
    }

    //duration
    if(offer.duration_offer){
      const inputDuration = $('select[name=duration_offer] option');
      $.each(inputDuration,function(index,val){
        if(val.value == offer.duration_offer) {
          $(this).prop('selected',true);
        }
      })
    }

    //start_time
    if(offer.start_time){
      const inputStartTime = $('select[name=start_time_offer] option');
      $.each(inputStartTime,function(index,val){
        if(val.value == offer.start_time) {
          $(this).prop('selected',true);
        }
      })

      var startTimeFrom = offer.start_time;

      var startTimeTo = getStartTimeTo(startTimeFrom);
      var html ='';
      for (var i = 0; i < startTimeTo.length; i++) {
         html += `<option value="${startTimeTo[i]}">${startTimeTo[i]}</option>`;
      }

      $('#end_time_offer').html(html);

    }

    //end_time
    if(offer.end_time){
      const inputEndTime = $('select[name=end_time_offer] option');
      $.each(inputEndTime,function(index,val){
        if(val.value == offer.end_time) {
          $(this).prop('selected',true);
        }
      })
    }

    //date
    if(offer.date){
      const inputEndTime = $('select[name=date_offer] option');
      $.each(inputEndTime,function(index,val){
        if(val.value == offer.date) {
          $(this).prop('selected',true);
        }
      })
    }

    //expired_date
    if(offer.expired_date){
      const inputEndTime = $('select[name=expired_date_offer] option');
      $.each(inputEndTime,function(index,val){
        if(val.value == offer.expired_date) {
          $(this).prop('selected',true);
        }
      })
    }

    //expired_time
    if(offer.expired_time){
      const inputEndTime = $('select[name=expired_time_offer] option');
      $.each(inputEndTime,function(index,val){
        if(val.value == offer.expired_time) {
          $(this).prop('selected',true);
        }
      })
    }

    //prefecture
    if(offer.prefecture_id){
      $("#area_offer").val(offer.prefecture_id);
    }
  }

  if ($('.show-list-guests').length) {
    if (!localStorage.getItem('offer')){
      window.location = '/admin/offers';
    }
  }

  handleOpenPopupSelectGuest();
  handleSearchGuest();
  chooseGuests();
  sendLineToGuest();
});
