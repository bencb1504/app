<?php

use App\CastClass;
use Illuminate\Database\Seeder;

class CastClassesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('cast_classes')->truncate();

        $castClasses = [
            ['name' => 'ブロンズ', 'cost' => 2500],
            ['name' => 'プラチナ', 'cost' => 5000],
            ['name' => 'ダイヤモンド', 'cost' => 12500],
        ];

        foreach ($castClasses as $class) {
            $newClass = new CastClass;
            $newClass->name = $class['name'];
            $newClass->cost = $class['cost'];
            $newClass->save();
        }
    }
}
