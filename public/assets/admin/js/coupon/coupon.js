$(document).ready(function(){
    $('input[type=radio]').click(function (){
        var typeCoupon = $('input[name=type]:checked').val();

        if (typeCoupon == 1) {
            $('.wrap-object-coupon.coupon-point input').attr('readonly', false);
            $('.wrap-object-coupon.coupon-time input').attr('readonly', true);
            $('.wrap-object-coupon.coupon-percent input').attr('readonly', true);
            $('.wrap-object-coupon.coupon-time input').addClass('invalid-element-coupon-input');
            $('.wrap-object-coupon.coupon-percent input').addClass('invalid-element-coupon-input');
            $('.wrap-object-coupon.coupon-point input').removeClass('invalid-element-coupon-input');
            $('.wrap-object-coupon.coupon-point span').removeClass('invalid-element-coupon');
            $('.wrap-object-coupon.coupon-time span').addClass('invalid-element-coupon');
            $('.wrap-object-coupon.coupon-percent span').addClass('invalid-element-coupon');

        }

        if (typeCoupon == 2) {
            $('.wrap-object-coupon.coupon-time input').attr('readonly', false);
            $('.wrap-object-coupon.coupon-point input').attr('readonly', true);
            $('.wrap-object-coupon.coupon-percent input').attr('readonly', true);
            $('.wrap-object-coupon.coupon-time span').removeClass('invalid-element-coupon');
            $('.wrap-object-coupon.coupon-point span').addClass('invalid-element-coupon');
            $('.wrap-object-coupon.coupon-percent span').addClass('invalid-element-coupon');
            $('.wrap-object-coupon.coupon-time input').removeClass('invalid-element-coupon-input');
            $('.wrap-object-coupon.coupon-point input').addClass('invalid-element-coupon-input');
            $('.wrap-object-coupon.coupon-percent input').addClass('invalid-element-coupon-input');
        }

        if (typeCoupon == 3) {
            $('.wrap-object-coupon.coupon-percent input').attr('readonly', false);
            $('.wrap-object-coupon.coupon-point input').attr('readonly', true);
            $('.wrap-object-coupon.coupon-time input').attr('readonly', true);
            $('.wrap-object-coupon.coupon-percent span').removeClass('invalid-element-coupon');
            $('.wrap-object-coupon.coupon-point span').addClass('invalid-element-coupon');
            $('.wrap-object-coupon.coupon-time span').addClass('invalid-element-coupon');
            $('.wrap-object-coupon.coupon-percent input').removeClass('invalid-element-coupon-input');
            $('.wrap-object-coupon.coupon-point input').addClass('invalid-element-coupon-input');
            $('.wrap-object-coupon.coupon-time input').addClass('invalid-element-coupon-input');
        }
    });

    $('#checkbox-after-created-date-filter').click(function () {
        if ($('#checkbox-after-created-date-filter:checked').length > 0) {
            $('.wrap-object-coupon.after-created-date input').attr('readonly', false);
            $('.wrap-object-coupon.after-created-date input').removeClass('invalid-element-coupon-input');
            $('.wrap-object-coupon.after-created-date span').removeClass('invalid-element-coupon');
            $('.wrap-td-coupon .title-filter_after_created_date').removeClass('invalid-element-coupon');
        } else {
            $('.wrap-object-coupon.after-created-date input').attr('readonly', true);
            $('.wrap-object-coupon.after-created-date input').addClass('invalid-element-coupon-input');
            $('.wrap-object-coupon.after-created-date span').addClass('invalid-element-coupon');
            $('.wrap-td-coupon .title-filter_after_created_date').addClass('invalid-element-coupon');
        }
    });

    $('#checkbox-time-order-filter').click(function () {
        if ($('#checkbox-time-order-filter:checked').length > 0) {
            $('.wrap-object-coupon.time-order-filter select').attr('disabled', false);
            $('.wrap-object-coupon.time-order-filter span').removeClass('invalid-element-coupon');
            $('.wrap-object-coupon.time-order-filter select').removeClass('.invalid-element-coupon-input');
        } else {
            $('.wrap-object-coupon.time-order-filter select').attr('disabled', true);
            $('.wrap-object-coupon.time-order-filter span').addClass('invalid-element-coupon');
            $('.wrap-object-coupon.time-order-filter select').addClass('.invalid-element-coupon-input');
        }
    });
});
