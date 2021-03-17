let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.styles([
    'public/assets/admin/css/login/login.css',
    'public/assets/admin/css/user/admin.css',
    'public/assets/admin/css/chatroom/chatroom.css',
], 'public/bundle/css/all.css').version();

mix.styles([
'public/assets/web/css/style.css',
'public/assets/web/css/custom.css',
'public/assets/web/css/timeline.css',
'public/assets/web/css/leave.css',
'public/assets/web/css/cast_offer.css',
], 'public/assets/web/css/web.css').version();

mix.styles('public/assets/webview/css/style.css', 'public/assets/webview/css/style.min.css').version();

mix.styles('public/assets/web/css/ge_1.css', 'public/assets/web/css/ge_1.min.css').version();
mix.styles('public/assets/web/css/ge_2_3.css', 'public/assets/web/css/ge_2_3.min.css').version();
mix.styles('public/assets/web/css/ge_2_4.css', 'public/assets/web/css/ge_2_4.min.css').version();
mix.styles('public/assets/web/css/gf_1.css', 'public/assets/web/css/gf_1.min.css').version();
mix.styles('public/assets/web/css/gf_3.css', 'public/assets/web/css/gf_3.min.css').version();
mix.styles('public/assets/web/css/gf_4.css', 'public/assets/web/css/gf_4.min.css').version();
mix.styles('public/assets/web/css/ge_4.css', 'public/assets/web/css/ge_4.min.css').version();
mix.styles('public/assets/web/css/cast.css', 'public/assets/web/css/cast.min.css').version();
mix.styles('public/assets/web/css/card_square.css', 'public/assets/web/css/card_square.min.css').version();

mix.js("resources/assets/js/app.js", "public/js").version();
mix.js("resources/assets/js/web.js", "public/js").version();

mix.js('public/assets/web/js/common.js', 'public/assets/web/js/common.min.js').version();
mix.js('public/assets/web/js/gf-2.js', 'public/assets/web/js/gf-2.min.js').version();
mix.js('public/assets/web/js/gf-3.js', 'public/assets/web/js/gf-3.min.js').version();
mix.js('public/assets/web/js/ge-2-1-a.js', 'public/assets/web/js/ge-2-1-a.min.js').version();
mix.js('public/assets/web/js/lazy/loading_image.js', 'public/assets/web/js/lazy/loading_image.min.js').version();
mix.js('public/assets/web/js/leave.js', 'public/assets/web/js/leave.min.js').version();

mix.js('public/assets/webview/js/script.js', 'public/assets/webview/js/script.min.js').version();
mix.js('public/assets/webview/js/create_card.js', 'public/assets/webview/js/create_card.min.js').version();

