$(function(){
  $('.selectbox select').change(function() {
    if ($(this).val() !== '0') {
      $(this).css('color','#000');
    } else {
      $(this).css('color','#ccc');
    }

  });

  $('.range-slider').jRange({
    from: 0,
    to: 15000,
    step: 500,
    scale: [0,15000],
    setValue: '0, 15000',
    format: '%sP',
    width: '90%',
    showLabels: true,
    showScale: false,
    isRange : false,
    Default : false
  });
});
