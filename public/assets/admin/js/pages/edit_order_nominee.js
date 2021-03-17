function orderPoint() {
    const cost = nomineeCost;
    const orderDuration = $('#edit-duration-nominee').val();
    return (cost / 2) * Math.floor(orderDuration * 60 / 15);
}

function allowance() {
    const orderDate = currentOrderStartDate;
    const duration = $('#edit-duration-nominee').val();
    const orderStartDate = moment(orderDate);
    const orderEndDate = moment(orderDate).clone().add(duration, 'hours');
    const orderStartTime = moment().set({
        hour: orderStartDate.get('hour'),
        minute: orderStartDate.get('minute'),
        second: 0
    });
    const orderEndTime = moment().set({hour: orderEndDate.get('hour'), minute: orderEndDate.get('minute'), second: 0});

    const conditionStartTime = moment().set({hour: 0, minute: 1, second: 0});
    const conditionEndTime = moment().set({hour: 4, minute: 0, second: 0});

    let bool = false;
    if (orderStartTime.isBetween(conditionStartTime, conditionEndTime) || orderEndTime.isBetween(conditionStartTime, conditionEndTime) || orderEndTime.isSame(conditionEndTime)) {
        bool = true;
    }

    if (orderStartDate.days() != orderEndDate.days() && orderEndDate.hours() != 0) {
        bool = true;
    }
    return bool ? 4000 : 0;
}

function updateTempPoint() {
    const tempPoint = orderPoint() + allowance();
    $('#temp-point').text((tempPoint + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + 'P');
}

function renderDay() {
    $('#edit-year option').attr("disabled", false);
    $('#edit-month option').attr("disabled", false);
    $('#edit-day option').attr("disabled", false);
    $('#edit-hour option').attr("disabled", false);
    $('#edit-minute option').attr("disabled", false);

    const currentYear = $('#edit-year').val();
    const currentMonth = $('#edit-month').val();
    let currentDay = $('#edit-day').val();
    let currentHour = $('#edit-hour').val();
    let currentMinute = $('#edit-minute').val();
    const selectedMonth = moment(currentYear + '/' + currentMonth);
    const selectedMonthTotalDay = selectedMonth.daysInMonth();

    $('#edit-day').empty();
    if (currentDay > selectedMonthTotalDay) {
        currentDay = '01';
    }

    for (let i= 1; i <= selectedMonthTotalDay; i++) {
        $('#edit-day').append($('<option>', {
            value: (i < 10) ? '0' + i : i,
            text: ((i < 10) ? '0' + i : i) + '日' ,
            selected: (i == currentDay) ? true : false
        }));
    }

    currentOrderStartDate = currentYear + '/' + currentMonth + '/' + currentDay + ' ' + currentHour + ':' + currentMinute;


    const currentDate = moment();
    let currentSelectedDate = moment(currentOrderStartDate);

    if (currentSelectedDate.clone().startOf('day').diff(currentDate.clone().startOf('day'), 'days') < 0
        || currentSelectedDate.clone().startOf('minute').diff(currentDate.clone().startOf('minute'), 'minutes') < 0) {
        let orderStartDate = moment();
        currentSelectedDate = orderStartDate;
        $('#edit-year').val(orderStartDate.format('YYYY'));
        $('#edit-month').val(orderStartDate.format('M'));
        $('#edit-day').val(orderStartDate.format('DD'));
        $('#edit-hour').val(orderStartDate.format('HH'));
        $('#edit-minute').val(orderStartDate.format('mm'));

        if (orderStartDate.clone().startOf('year').diff(currentDate.clone().startOf('year'), 'years') == 0) {
            $("#edit-month > option").each(function() {
                if (parseInt(this.value) < parseInt(currentDate.format('M'))) {
                    $(this).attr('disabled','disabled');
                } else {
                    $(this).removeAttr('disabled');
                }
            });
            if (orderStartDate.clone().startOf('month').diff(currentDate.clone().startOf('month'), 'months') == 0) {
                $("#edit-month > option").each(function() {
                    if (parseInt(this.value) < parseInt(currentDate.format('M'))) {
                        $(this).attr('disabled','disabled');
                    } else {
                        $(this).removeAttr('disabled');
                    }
                });

                $("#edit-day > option").each(function() {
                    if (parseInt(this.value) < parseInt(currentDate.format('DD'))) {
                        $(this).attr('disabled','disabled');
                    } else {
                        $(this).removeAttr('disabled');
                    }
                });

                $("#edit-hour > option").each(function() {
                    if (parseInt(this.value) < parseInt(currentDate.format('HH'))) {
                        $(this).attr('disabled','disabled');
                    } else {
                        $(this).removeAttr('disabled');
                    }
                });

                if (orderStartDate.clone().startOf('hour').diff(currentDate.clone().startOf('hour'), 'hours') == 0) {
                    $("#edit-minute > option").each(function() {
                        if (parseInt(this.value) < parseInt(currentDate.format('mm'))) {
                            $(this).attr('disabled','disabled');
                        } else {
                            $(this).removeAttr('disabled');
                        }
                    });
                }
            }
        }
    }

    if (currentSelectedDate.clone().startOf('day').diff(currentDate.clone().startOf('day'), 'days') >= 0) {
        if (currentSelectedDate.clone().startOf('year').diff(currentDate.clone().startOf('year'), 'years') == 0) {
            $("#edit-month > option").each(function() {
                if (parseInt(this.value) < parseInt(currentDate.format('M'))) {
                    $(this).attr('disabled','disabled');
                } else {
                    $(this).removeAttr('disabled');
                }
            });
        }
        if (currentSelectedDate.clone().startOf('month').diff(currentDate.clone().startOf('month'), 'months') == 0) {
            $("#edit-month > option").each(function() {
                if (parseInt(this.value) < parseInt(currentDate.format('M'))) {
                    $(this).attr('disabled','disabled');
                } else {
                    $(this).removeAttr('disabled');
                }
            });

            $("#edit-day > option").each(function() {
                if (parseInt(this.value) < parseInt(currentDate.format('DD'))) {
                    $(this).attr('disabled','disabled');
                } else {
                    $(this).removeAttr('disabled');
                }
            });

            if (currentSelectedDate.clone().startOf('day').diff(currentDate.clone().startOf('day'), 'days') == 0) {
                $("#edit-hour > option").each(function() {
                    if (parseInt(this.value) < parseInt(currentDate.format('HH'))) {
                        $(this).attr('disabled','disabled');
                    } else {
                        $(this).removeAttr('disabled');
                    }
                });

                if (currentSelectedDate.clone().startOf('hour').diff(currentDate.clone().startOf('hour'), 'hours') == 0) {
                    $("#edit-minute > option").each(function() {
                        if (parseInt(this.value) < parseInt(currentDate.format('mm'))) {
                            $(this).attr('disabled','disabled');
                        } else {
                            $(this).removeAttr('disabled');
                        }
                    });
                }
            }
        }
    }

    $('#order-start-date').val(currentSelectedDate.format('YYYY-MM-DD HH:mm'));
    updateTempPoint();
}

$('#edit-month').on('change', function () {
    renderDay();
});

$('#edit-year').on('change', function(){
    renderDay();
});

$('#edit-day').on('change', function(){
    renderDay();
});

$('#edit-hour').on('change', function(){
    renderDay();
});

$('#edit-minute').on('change', function(){
    renderDay();
});

$('#edit-duration-nominee').on('change', function() {
    updateTempPoint();
});

$('#btn-edit-order-nominee').on('hidden.bs.modal', function () {
    if (clickComfirm == 0) {
        const baseDate = moment(baseOrderStartDate);
        $('#edit-year').val(baseDate.format('YYYY'));
        $('#edit-month').val(baseDate.format('M'));
        $('#edit-day').val(baseDate.format('DD'));
        $('#edit-hour').val(baseDate.format('HH'));
        $('#edit-minute').val(baseDate.format('mm'));
        $('#temp-point').text(baseTempPoint + 'P');
        $('#edit-duration-nominee').val(baseDuration);

        renderDay();
    }
});

$('#btn-submit-edit-order-nominee').on('hidden.bs.modal', function () {
   window.location.reload();
});
