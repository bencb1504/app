<?php

use App\Municipality;
use Illuminate\Database\Seeder;

class MunicipalitiesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('municipalities')->truncate();

        $filePath = storage_path() . '/data/municipalities.csv';

        if (($handle = fopen($filePath, 'r')) !== false) {
            while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                $prefecture = new Municipality;
                $prefecture->code = $data[0];
                $prefecture->name = $data[1];
                $prefecture->name_kana = $data[2];
                $prefecture->prefecture_id = $data[3];
                $prefecture->save();
            }
            fclose($handle);
        }
    }
}
