<?php

use Illuminate\Database\Seeder;

class BodyTypesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('body_types')->truncate();

        $data = [
            '非公開',
            'スリム',
            'やや細め',
            '普通',
            'グラマー',
            '筋肉質',
            'ややぽっちゃり',
            '太め',
        ];

        $data = array_map(function ($name) {
            return compact('name');
        }, $data);

        DB::table('body_types')->insert($data);
    }
}
