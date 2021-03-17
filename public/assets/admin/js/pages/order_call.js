let casts = [];
let currentPopup = null;
let type = null;
let listCastMatching = getListCastMatching();
let listCastNominees = getListCastNominees();
let listCastCandidates = getListCastCandidates();
let classId = $('#choosen-cast-class').val();
let clastIdPrevious = $('#choosen-cast-class').val();
let totalCastPrevious = $('#total-cast').val();
let currentOrderType = orderType;
let currentTempPoint = 0;
let currentOrderStatus = orderStatus;
let deletedCast = [];
let addedNominee = [];

function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

function getListCastMatching() {
    var arrCastMatching = [];
    $('.cast-matching-id').each(function (index, val) {
        arrCastMatching.push($(val).html());
    });
    return arrCastMatching;
}

function getListCastNominees() {
    var arrCastNominees = [];
    $('.cast-nominee-id').each(function (index, val) {
        arrCastNominees.push($(val).html());
    });

    return arrCastNominees;
}

function getListCastCandidates() {
    var arrCastCandidates = [];
    $('.cast-candidate-id').each(function (index, val) {
        arrCastCandidates.push($(val).html());
    });

    return arrCastCandidates;
}

function checkCastSelected(selectorElement, userId) {
    selectedNomination.forEach(item => {
        if (userId == item.id) {
            setTimeout(() => {
                $(selectorElement + userId).addClass('hidden');
            }, 200);
        }
    });

    selectedCandidate.forEach(item => {
        if (userId == item.id) {
            setTimeout(() => {
                $(selectorElement + userId).addClass('hidden');
            }, 200);
        }
    });

    selectedMatching.forEach(item => {
        if (userId == item.id) {
            setTimeout(() => {
                $(selectorElement + userId).addClass('hidden');
            }, 200);
        }
    });
}

function renderListCast(classId, listCastMatching, listCastNominees, listCastCandidates, search = '') {
    $.ajax({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: "GET",
        url: '/admin/orders/casts/' + classId,
        data: {
            'listCastMatching': listCastMatching,
            'listCastNominees': listCastNominees,
            'listCastCandidates': listCastCandidates,
            'search': search
        },
        success: function (response) {
            casts = response.casts;
            $('#choose-cast-matching tbody').html(response.view);
            $('#choose-cast-candidate tbody').html(response.view);
            $('#choose-cast-nominee tbody').html(response.view);
        },
    });
}

function orderPoint(cast = null, isNominee = null) {
    let orderDuration = Number($('#order-duration').val()) * 60;
    const currentCastClass = castClasses.find(i => i.id == $('#choosen-cast-class').val());
    let cost = 0;
    if (orderType != 3) {
        cost = currentCastClass.cost;
    } else {
        if (cast) {
            cost = cast.pivot.cost;
        } else {
            cost = currentCastClass.cost;
        }
    }

    return (cost / 2) * Math.floor(orderDuration / 15);
}

function orderFee() {
    const orderDuration = Number($('#order-duration').val()) * 60;
    const multiplier = Math.floor(orderDuration / 15);
    return 500 * multiplier;
}

function allowance() {
    const orderDate = $('#order-date').val();
    const duration = $('#order-duration').val();
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

function updateTotalPoint(newBaseTempPoint) {
    const castsMatching = getListCastMatching();
    const castsNominee = getListCastNominees();
    const castsCandidate = getListCastCandidates();
    let totalCandidate = $('#total-cast').val();
    let tempPoint = 0;
    if (castsMatching.length || castsNominee.length) {
        let totalNominee = 0;
        castsMatching.forEach(val => {
            let castMatched = baseCastsMatched.find(i => i.id == val);
            if (castMatched) {
                if (castMatched.pivot.type == 1) {
                    totalNominee++;
                    totalCandidate--;
                }
            }
        });
        castsNominee.forEach(val => {
            totalNominee++;
            totalCandidate--;
        });
        for (let i = 0; i < totalNominee; i++) {
            tempPoint += orderPoint() + allowance() + orderFee();
        }
        for (let i = 0; i < totalCandidate; i++) {
            tempPoint += orderPoint() + allowance();
        }
    } else {
        for (let i = 0; i < totalCandidate; i++) {
            tempPoint += orderPoint() + allowance();
        }
    }

    currentTempPoint = tempPoint;
    // castsNominee.forEach(val => {
    //     const cast = selectedNomination.find(i => i.id == val);
    //     tempPoint += orderPoint(cast, true) + orderFee() + allowance();
    // });
    // castsCandidate.forEach(val => {
    //     const cast = selectedCandidate.find(i => i.id == val);
    //     tempPoint += orderPoint(cast) + allowance();
    // });
    // castsMatching.forEach(val => {
    //     let castMatched = baseCastsMatched.find(i => i.id == val);
    //     if (castMatched) {
    //         if (castMatched.pivot.type == 1) {
    //             tempPoint += orderPoint(castMatched, true) + allowance() + orderFee();
    //         } else {
    //             tempPoint += orderPoint(castMatched) + allowance();
    //         }
    //     } else {
    //         const cast = selectedMatching.find(i => i.id == val);
    //         tempPoint += orderPoint(cast) + allowance();
    //     }
    // });

    $('#total-point').text((tempPoint + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + 'P');

    return tempPoint;
}

function orderChanged() {
    const currentCasts = [...getListCastNominees(), ...getListCastMatching(), ...getListCastCandidates()];
    let isChanged = false;
    if (numOfCast != $('#total-cast').val()) {
        isChanged = true;
    }
    if (castClasses != $('#choosen-cast-class').val()) {
        isChanged = true;
    }
    if (baseCastClass != $('#choosen-cast-class').val()) {
        isChanged = true;
    }

    const tempBaseCastMatched = [];
    baseCastsMatched.forEach(i => tempBaseCastMatched.push(i.id));
    if (currentCasts.toString() != tempBaseCastMatched.toString()) {
        isChanged = true;
    }

    if (orderStartTime != moment($('#order-date').val()).format('YYYY-MM-DD HH:mm:ss')) {
        isChanged = true;
    }

    if (isChanged) {
        currentOrderType = 2;
        let nominees = [];
        let candidates = [];
        if (getListCastNominees().length) {
            currentOrderType = 4;
        }

        if (currentOrderType != 4) {
            if (getListCastCandidates().length) {
                getListCastMatching().forEach(val => {
                    const cast = baseCastsMatched.find(cast => cast.id == val);
                    if (cast) {
                        if (cast.pivot.type == 1) {
                            nominees.push(cast);
                        } else {
                            candidates.push(cast);
                        }
                    }
                });

                if (nominees.length) {
                    currentOrderType = 4;
                }
            } else {
                getListCastMatching().forEach(val => {
                    const cast = baseCastsMatched.find(cast => cast.id == val);
                    if (cast) {
                        if (cast.pivot.type == 1) {
                            nominees.push(cast);
                        } else {
                            candidates.push(cast);
                        }
                    }
                });

                if (nominees.length && candidates.length) {
                    currentOrderType = 4;
                }
            }
        }
        $('#order-type').text(orderTypeDesc[currentOrderType]);
        if ((getListCastMatching().length + getListCastCandidates().length) < $('#total-cast').val()) {
            $('#submit-popup-content').html(`
            <h2> ${ $('#total-cast').val() - (getListCastMatching().length + getListCastCandidates().length)}名をコールとして募集します</h2>
            <h2> "OK"をタップすると、キャストに通知が送られます</h2>
            `);
        } else if (selectedNomination.length) {
            let title = 'ユーザーID ';
            selectedNomination.forEach(item => {
                title += item.id + ',';
            });
            title = title.slice(0, -1);
            title += 'を指名キャストとして選択しています<';
            $('#submit-popup-content').html(`
            <h2> ${title}</h2>
            <h2> "OK"をタップすると、キャストに通知が送られます</h2>
            `);
        } else {
            $('#submit-popup-content').html(`
            <h2>変更を実行しますか？</h2>
            <h2>"OK"をタップすると、対象のゲスト/キャストに</h2>
            <h2>通知が送られます。</h2>
            `);
        }

        if (orderStatus != 3) {
            let currentNomineeList = getListCastNominees();
            let currentCandidateList = getListCastCandidates();
            let currentMatchingList = getListCastMatching();
            currentOrderStatus = 1;
            if (currentNomineeList.length) {
                let nominee = 0;
                let totalAcceptedCast = 0;
                currentNomineeList.forEach(val => {
                    let acceptedNominee = baseCastsNominee.find(cast => {
                        if (cast.id == val && cast.pivot.status == 1) {
                            return cast;
                        }
                    });

                    if (acceptedNominee) {
                        nominee++;
                    }
                });
                totalAcceptedCast = nominee + currentCandidateList.length + currentMatchingList.length;

                if (totalAcceptedCast == $('#total-cast').val()) {
                    currentOrderStatus = 2;
                }
            }

            if ($('#total-cast').val() == getListCastCandidates().length || $('#total-cast').val() == getListCastMatching().length) {
                $('#order-status span').text(`${orderStatusDesc[2]}`);
                currentOrderStatus = 2;
            }

            if (currentCandidateList.length && currentNomineeList.length == 0) {
                if (currentCandidateList.length == $('#total-cast').val()) {
                    currentOrderStatus = 2;
                }
            }

            if (currentMatchingList.length + currentCandidateList.length == $('#total-cast').val()) {
                currentOrderStatus = 2;
            }
            if (currentOrderStatus == 2) {
                $('#order-status span').text(`${orderStatusDesc[2]}`);
            } else {
                $('#order-status span').text(`${orderStatusDesc[1]}`);
            }
        }
        $('#btn-submit-popup').prop('disabled', false);
    } else {
        $('#btn-submit-popup').prop('disabled', true);
    }
}

function handleOpenPopupSelectCastEvent() {
    $('body').on('click', '#popup-cast-nominee', function (event) {
        type = 1;
        const listCastsMatching = getListCastMatching();
        let nominees = [];
        let candidates = [];
        baseCastsNominee.forEach(cast => nominees.push(cast.id));
        baseCastsCandidate.forEach(cast => candidates.push(cast.id));
        baseCastsMatched.forEach(i => {
            if (listCastsMatching.includes(i.id) === false) listCastsMatching.push(i.id);
        });
        renderListCast(classId, listCastsMatching, getListCastNominees().concat(nominees), getListCastCandidates().concat(candidates));
        $('#nomination-table > tbody  > tr').each(function (index, val) {
            const dataUserId = $(val).attr('data-user-id');
            checkCastSelected('#nomination-table tr#nomination-', dataUserId);
        });
    });

    $('body').on('click', '#popup-cast-candidate', function (event) {
        type = 2;
        const listCastsMatching = getListCastMatching();
        let nominees = [];
        let candidates = [];
        baseCastsNominee.forEach(cast => nominees.push(cast.id));
        baseCastsCandidate.forEach(cast => candidates.push(cast.id));
        baseCastsMatched.forEach(i => {
            if (listCastsMatching.includes(i.id) === false) listCastsMatching.push(i.id);
        });
        renderListCast(classId, listCastsMatching, getListCastNominees().concat(nominees), getListCastCandidates().concat(candidates));
        $('#candidation-table > tbody  > tr').each(function (index, val) {
            const dataUserId = $(val).attr('data-user-id');
            checkCastSelected('#candidation-table tr#candidate-', dataUserId);
        });
    });

    $('body').on('click', '#popup-cast-matching', function (event) {
        type = 3;
        const listCastsMatching = getListCastMatching();
        let nominees = [];
        let candidates = [];
        baseCastsNominee.forEach(cast => nominees.push(cast.id));
        baseCastsCandidate.forEach(cast => candidates.push(cast.id));
        baseCastsMatched.forEach(i => {
            if (listCastsMatching.includes(i.id) === false) listCastsMatching.push(i.id);
        });
        renderListCast(classId, listCastsMatching, getListCastNominees().concat(nominees), getListCastCandidates().concat(candidates));
        $('#matching-table > tbody  > tr').each(function (index, val) {
            const dataUserId = $(val).attr('data-user-id');
            checkCastSelected('#matching-table tr#matching-', dataUserId);
        });
    });
}

function handleAddCastEvent() {
    $('body').on('click', '#add-cast-nominee', function () {
        cast_ids = [];

        $('.verify-checkboxs:checked').each(function () {
            cast_ids.push(this.value);
        });
        const totalCast = $("#total-cast option:selected").val();
        const currentTotalCast = getListCastCandidates().length + getListCastNominees().length + getListCastMatching().length + cast_ids.length;
        if (totalCast < currentTotalCast) {
            alert('設定している"キャストを呼ぶ人数"より、選択されているキャストの人数が超えています。編集してください。\n');
            return false;
        }

        $('#cast_ids').val(cast_ids.join(','));

        $('#choose-cast-nominee').modal('hide');
        $.each(cast_ids, function (index, val) {
            const cast = casts.find(i => i.id == val);

            if (cast) {
                selectedNomination.push(cast);
                numOfCast++;

                const element = `<tr>
                      <td class="cast-nominee-id">${cast.id}</td>
                      <td>${cast.nickname}</td>
                      <td><button type="button" class="btn btn-info remove-btn" data-user-id="${cast.id}" data-type="1" 
                      >このキャストを削除する
                      </button></td>
                      </tr>`;
                $('#nomination-selected-table').append(element);
                updateTotalPoint();
            }
        });

        orderChanged();
    });

    $('body').on('click', '#add-cast-candidate', function () {
        cast_ids = [];

        $('.verify-checkboxs:checked').each(function () {
            cast_ids.push(this.value);
        });
        const totalCast = $("#total-cast option:selected").val();
        const currentTotalCast = getListCastCandidates().length + getListCastNominees().length + getListCastMatching().length + cast_ids.length;
        if (totalCast < currentTotalCast) {
            alert('設定している"キャストを呼ぶ人数"より、選択されているキャストの人数が超えています。編集してください。\n');
            return false;
        }

        $('#cast_ids').val(cast_ids.join(','));

        $('#choose-cast-candidate').modal('hide');
        $.each(cast_ids, function (index, val) {
            const cast = casts.find(i => i.id == val);

            if (cast) {
                selectedCandidate.push(cast);
                numOfCast++;

                const element = `<tr>
                      <td class="cast-candidate-id">${cast.id}</td>
                      <td>${cast.nickname}</td>
                      <td><button type="button" class="btn btn-info remove-btn" data-type="2" data-user-id="${cast.id}">このキャストを削除する
                      </button></td>
                      </tr>`;

                $('#candidate-selected-table').append(element);
                updateTotalPoint();
            }
        });

        orderChanged();
    });

    $('body').on('click', '#add-cast-matching', function () {
        cast_ids = [];
        $('.verify-checkboxs:checked').each(function () {
            cast_ids.push(this.value);
        });

        const totalCast = $("#total-cast option:selected").val();
        const currentTotalCast = getListCastCandidates().length + getListCastNominees().length + getListCastMatching().length + cast_ids.length;
        if (totalCast < currentTotalCast) {
            alert('設定している"キャストを呼ぶ人数"より、選択されているキャストの人数が超えています。編集してください。\n');
            return false;
        }

        $('#cast_ids').val(cast_ids.join(','));
        $('#choose-cast-matching').modal('hide');
        $.each(cast_ids, function (index, val) {
            const cast = casts.find(i => i.id == val);

            if (cast) {
                selectedMatching.push(cast);
                numOfCast++;

                const element = `<tr>
                      <td class="cast-matching-id">${cast.id}</td>
                      <td>${cast.nickname}</td>
                      <td><button type="button" class="btn btn-info remove-btn" data-type="3" 
                      data-user-id="${cast.id}">このキャストを削除する
                      </button></td>
                      </tr>`;

                $('#matching-selected-table').append(element);
                updateTotalPoint();
            }
        });

        orderChanged();
    });
}

function handleChoosenCastClassEvent() {
    $('#choosen-cast-class').change(function (event) {
        classId = $(this).children("option:selected").val();
        let isSameClass = true;
        // if (selectedMatching.length || selectedNomination.length || selectedCandidate.length) {
        //     if (selectedMatching.findIndex(i => i.class_id == classId) == -1) {
        //         isSameClass = false;
        //     }
        //     if (selectedNomination.findIndex(i => i.class_id == classId) == -1) {
        //         isSameClass = false;
        //     }
        //     if (selectedCandidate.findIndex(i => i.class_id == classId) == -1) {
        //         isSameClass = false;
        //     }
        // }

        if (getListCastMatching().length || getListCastNominees().length || getListCastCandidates().length) {
            isSameClass = false;
        }
        if (!isSameClass) {
            alert('設定している"キャストクラス"と選択されているキャストのキャストクラスが異なります。編集してください。');
            $(this).val(clastIdPrevious);
            return false;
        }
        clastIdPrevious = classId;
        updateTotalPoint();
        orderChanged();
        renderListCast(classId, getListCastMatching(), getListCastNominees(), getListCastCandidates());
    });
}

function handleDeleteCastEvent() {
    $('body').on('click', '.remove-btn', function (event) {
        const ele = $(this);
        const type = ele.attr('data-type');
        const userId = ele.attr('data-user-id');
        numOfCast -= 1;
        const matchedCast = baseCastsMatched.find(cast => cast.id == userId);
        if (matchedCast) {
            deletedCast.push(userId);
        }
        const nomineeCast = baseCastsNominee.find(cast => {
            if (cast.id == userId && cast.pivot.status == 0) {
                return cast;
            }
        });
        if (nomineeCast) {
            deletedCast.push(userId);
        }

        if (type == 1) {
            const index = selectedNomination.findIndex(i => i.id == userId);
            selectedNomination.splice(index, 1);
            ele.parent().parent().remove();
            updateTotalPoint();
        }

        if (type == 2) {
            const index = selectedCandidate.findIndex(i => i.id == userId);
            selectedCandidate.splice(index, 1);
            ele.parent().parent().remove();
            updateTotalPoint();
            const candidateIndex = selectedMatching.findIndex(i => i.id == userId);
            if (candidateIndex != -1) {
                const index = selectedMatching.findIndex(i => i.id == userId);
                selectedMatching.splice(index, 1);
                ele.parent().parent().remove();
                updateTotalPoint();
            }
        }

        if (type == 3) {
            const index = selectedMatching.findIndex(i => i.id == userId);
            selectedMatching.splice(index, 1);
            ele.parent().parent().remove();
            updateTotalPoint();
        }

        orderChanged();
    });
}

function handleSearchCastEvent() {
    $('.input-search').keyup(debounce(function () {
        const search = $(this).val();
        const listCastsMatching = getListCastMatching();
        baseCastsMatched.forEach(i => {
            if (listCastsMatching.includes(i.id) === false) listCastsMatching.push(i.id);
        });
        renderListCast($('#choosen-cast-class').val(), listCastsMatching, getListCastNominees(), getListCastCandidates(), search);
    }, 500));
}

function handleChangeOrderDurationEvent() {
    $('#order-duration').on('change', function () {
        updateTotalPoint();
        orderChanged();
    });
}

function handleChangeTotalCastEvent() {
    $('body').on('change', '#total-cast', function () {
        const totalCast = $("#total-cast option:selected").val();
        const currentTotalCast = getListCastCandidates().length + getListCastNominees().length + getListCastMatching().length;
        if (totalCast < currentTotalCast) {
            alert('設定している"キャストを呼ぶ人数"より、選択されているキャストの人数が超えています。編集してください。\n');
            $(this).val(totalCastPrevious);
            return false;
        } else {
            totalCastPrevious = $(this).val();
            orderChanged();
        }

        updateTotalPoint();
    });
}

function validateOrderTime() {
    const now = moment();
    const oldOrderStartDate = moment(orderStartTime);
    const curentOrderStartDate = moment($('#order-date').val());
    const createdAt = moment(orderCreatedAt);
    const timeApply = oldOrderStartDate.diff(createdAt, 'minutes');
    const validateTimeText = '予約開始時間でキャストの応募が締め切りっています。キャスト応募するのに予約開始時間を変更してください。';
    const validateTotalCastText = 'キャストの人数が足りません。"別のキャストを追加する"からキャストを追加して下さい';
    const oldTotalCast = totalCast;
    let valid = true;
    const paymentRequestStatus = {
        open: 1,
        requested: 2,
        updated: 3
    };
    if ((orderStatus == 2 || orderStatus == 3) && ($('#total-cast').val() > (getListCastMatching().length + getListCastCandidates().length))) {
        $('#submit-popup-content').html(`
            <p>${validateTotalCastText}</p>
            `);
        $('#btn-submit').hide();
        $('#cancel-action-btn').hide();
        $('#validate-confirm-btn').show();
        valid = false;
    }

    // if (oldTotalCast > $('#total-cast').val()) {
    //     if (curentOrderStartDate.diff(now, 'minutes') < 10) {
    //         if (oldTotalCast != $('#total-cast').val() || $('#total-cast').val() > (getListCastMatching().length + getListCastCandidates().length)) {
    //             $('#submit-popup-content').html(`
    //         <p>${validateTimeText}</p>
    //         `);
    //             $('#btn-submit').hide();
    //             $('#cancel-action-btn').hide();
    //             $('#validate-confirm-btn').show();
    //             valid = false;
    //         }
    //     }
    //
    //     if (timeApply >= 30 && timeApply < 60) {
    //         if (curentOrderStartDate.diff(now, 'minutes') < 15) {
    //             if (oldTotalCast != $('#total-cast').val() || $('#total-cast').val() > (getListCastMatching().length + getListCastCandidates().length)) {
    //                 $('#submit-popup-content').html(`
    //                 <p>${validateTimeText}</p>
    //                 `);
    //                 $('#btn-submit').hide();
    //                 $('#cancel-action-btn').hide();
    //                 $('#validate-confirm-btn').show();
    //                 valid = false;
    //             }
    //         }
    //     }
    //
    //     if (timeApply >= 60) {
    //         if (curentOrderStartDate.diff(now, 'minutes') < 30) {
    //             if (oldTotalCast != $('#total-cast').val() || $('#total-cast').val() > (getListCastMatching().length + getListCastCandidates().length)) {
    //                 $('#submit-popup-content').html(`
    //                 <p>${validateTimeText}</p>
    //                 `);
    //                 $('#btn-submit').hide();
    //                 $('#cancel-action-btn').hide();
    //                 $('#validate-confirm-btn').show();
    //                 valid = false;
    //             }
    //         }
    //     }
    // }


    if (valid) {
        $('#btn-submit').show();
        $('#cancel-action-btn').show();
        $('#validate-confirm-btn').hide();
    }
}

jQuery(document).ready(function ($) {
    renderListCast(classId, getListCastMatching(), getListCastNominees(), getListCastCandidates());
    handleOpenPopupSelectCastEvent();
    handleAddCastEvent();
    handleChoosenCastClassEvent();
    handleDeleteCastEvent();
    handleSearchCastEvent();
    handleChangeOrderDurationEvent();
    handleChangeTotalCastEvent();
    validateOrderTime();
    $("#datetimepicker").on("dp.change", function (e) {
        $('#btn-submit-popup').prop('disabled', false);
    });
    $('#btn-submit-popup').on('click', function () {
        orderChanged();
        validateOrderTime();
    });
    $('#btn-submit').on('click', function () {
        let addedNomineCast = [];
        let addedCandidateCast = [];
        let listNomineeCast = getListCastNominees();
        let listCandidateCast = getListCastCandidates().concat(getListCastMatching());
        listNomineeCast.forEach(val => {
            if (baseCastsNominee.findIndex(cast => val == cast.id) == -1) {
                addedNomineCast.push(val);
            }
        });
        listCandidateCast.forEach(val => {
            if (baseCastsMatched.findIndex(cast => val == cast.id) == -1) {
                addedCandidateCast.push(val);
            }
        });
        addedNomineCast = [...new Set(addedNomineCast)];
        addedCandidateCast = [...new Set(addedCandidateCast)];
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            type: "PUT",
            url: '/admin/orders/' + orderId,
            data: {
                'addedNomineeCast': addedNomineCast,
                'addedCandidateCast': addedCandidateCast,
                'deletedCast': deletedCast,
                'orderDuration': $('#order-duration').val(),
                'orderDate': $('#order-date').val(),
                'class_id': $('#choosen-cast-class').val(),
                'totalCast': $('#total-cast').val(),
                'type': currentOrderType,
                'temp_point': currentTempPoint,
                'status': currentOrderStatus,
                'old_status': orderStatus
            },
            success: function (response) {
                if (response.success) {
                    $('#submit-popup').hide();
                    $('#btn-alert-popup').trigger('click');
                    $('#alert-popup-content').html('<p>変更しました</p>');
                    setTimeout(() => {
                        window.location.href = redirectBackUrl;
                    }, 1000);
                } else {
                    $('#submit-popup').hide();
                    $('#btn-alert-popup').trigger('click');
                    $('#alert-popup-content').html('<p>' + response.info + '</p>');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            },
        });
    });

    $('#orderdatetimepicker').datetimepicker({
        minDate: 'now',
    }).on('dp.change', function (event) {
        updateTotalPoint();
        orderChanged();
    });
});
