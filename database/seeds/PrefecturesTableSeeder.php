<?php

use App\Prefecture;
use Illuminate\Database\Seeder;

class PrefecturesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('prefectures')->truncate();

        $filePath = storage_path() . '/data/prefectures.csv';

        if (($handle = fopen($filePath, 'r')) !== false) {
            while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                $prefecture = new Prefecture;
                $prefecture->id = $data[0];
                $prefecture->name = $data[1];
                $prefecture->name_kana = $data[2];
                $prefecture->save();
            }
            fclose($handle);
        }
    }
}
