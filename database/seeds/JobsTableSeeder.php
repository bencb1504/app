<?php

use Illuminate\Database\Seeder;

class JobsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('jobs')->truncate();

        $data = [
            '非公開',
            '会社員',
            '経営者・役員',
            '医師',
            '弁護士',
            '公認会計士',
            '学生',
            'フリーター',
            '公務員',
            '大手商社',
            '外資金融',
            '大手企業',
            '大手外資',
            'クリエイター',
            'IT関連',
            '客室乗務員',
            '芸能・モデル',
            '接客業',
            'イベントコンパニオン',
            '受付',
            '秘書',
            '保育士',
            '金融',
            'コンサル',
            '保険',
            '不動産',
            '広告',
            'マスコミ',
            '福祉･介護',
        ];

        $data = array_map(function ($name) {
            return compact('name');
        }, $data);

        DB::table('jobs')->insert($data);
    }
}
