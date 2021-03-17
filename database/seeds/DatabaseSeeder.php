<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();

        $this->call(PrefecturesTableSeeder::class);
        $this->call(MunicipalitiesTableSeeder::class);
        $this->call(BodyTypesTableSeeder::class);
        $this->call(JobsTableSeeder::class);
        $this->call(CastClassesTableSeeder::class);
        $this->call(UsersTableSeeder::class);
        $this->call(SalariesTableSeeder::class);
        $this->call(TagsTableSeeder::class);
    }
}
