$(document).ready(function () {
    $('div.main div.messaging div.chat_tab li.guests').click(function (e) {
        e.preventDefault();
        $('div.main div.messaging #cast').css("display", "none");
        $('div.main div.messaging #guest').css("display", "block")
    })
    $('div.main div.messaging div.chat_tab li.casts').click(function (e) {
        e.preventDefault();
        $('div.main div.messaging #guest').css("display", "none");
        $('div.main div.messaging #cast').css("display", "block")
    })
});