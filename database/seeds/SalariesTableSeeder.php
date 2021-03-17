<?php

use Illuminate\Database\Seeder;

class SalariesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('salaries')->truncate();

        $salaries = [
            '非公開',
            '200万未満',
            '200万～400万',
            '400万～600万',
            '600万~800万',
            '800万~1000万',
            '1000万~1500万',
            '1500万~2000万',
            '2000万~3000万',
            '3000万~4000万',
            '4000万~5000万',
            '5000万以上'
        ];

        $salaries = array_map(function ($name) {
            return compact('name');
        }, $salaries);

        DB::table('salaries')->insert($salaries);
    }
}