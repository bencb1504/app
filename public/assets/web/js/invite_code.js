$(document).ready(function(){
    var inviteCode = $('#invite-code').text();

    $('.btn-invite-via-line').on('click', function () {
        let message = '【お得な招待コードが届きました！】\n' +
            '登録から1週間以内にご利用いただくと2時間以上のご利用で1時間無料キャンペーン中！\n' +
            'また、会員登録時に招待コードを入力すると、2回目以降にCheersで使える10,000Pをプレゼント！\n' +
            'ダブルでお得！✨\n' +
            '\n' +
            '下記の招待コードをコピーして、会員登録時に、忘れずに招待コードを入力してください。\n' +
            '\n' +
            'ご登録はこちら\n' +
            '👉'+ window.location.origin + '\n' +
            '\n' +
            '招待コード\n' +
            inviteCode;
        let encodeMessage = encodeURI(message);
        window.location.href = 'https://line.me/R/msg/text/?'+encodeMessage;
    })
});