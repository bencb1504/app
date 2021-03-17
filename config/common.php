<?php

return [
    'api_url' => env('API_URL', env('APP_URL')),

    'payment_service' => env('PAYMENT_SERVICE'), //stripe, square, telecom_credit

    'default_cost_rate' => [
        1 => 0.7,
        2 => 0.8,
        3 => 0.8
    ],

    'editable_cost_rate' => [
        0.7, 
        0.8,
        0.65, 
        0.75,
    ],

    'point_rate' => 1.1,

    'autocharge_point' => 3000,

    'phone_number_rule' => env('PHONE_NUMBER_RULE', 'JP'),

    'order_options' => [
        'call_time' => [
//            [
//                'id' => 1,
//                'name' => '20分後',
//                'value' => '20',
//                'is_active' => 0,
//            ],
            [
                'id' => 2,
                'name' => '30分後',
                'value' => '30',
                'is_active' => 1,
            ],
            [
                'id' => 3,
                'name' => '60分後',
                'value' => '60',
                'is_active' => 1,
            ],
            [
                'id' => 4,
                'name' => '90分後',
                'value' => '90',
                'is_active' => 1,
            ],
        ],
        'max_casts' => 4,
        'cast_classes' => [
            [
                'id' => 1,
                'name' => 'ブロンズ',
                'cost' => 2500,
                'is_active' => 1,
                'url_image' => 'assets/web/images/ge2-1-a/grade-icon_003.png',
            ],
            [
                'id' => 2,
                'name' => 'プラチナ',
                'cost' => 5000,
                'is_active' => 1,
                'url_image' => 'assets/web/images/ge2-1-a/grade-icon_002.png',
            ],
            [
                'id' => 3,
                'name' => 'ダイヤモンド',
                'cost' => 12500,
                'is_active' => 1,
                'url_image' => 'assets/web/images/ge2-1-a/grade-icon_001.png',
            ],
        ],
        'credit_card_required' => 1,
    ],

    'cost_default' => 5000,

    'invite_code_point' => 10000,
];
