<?php

use App\Job;
use Faker\Generator as Faker;

$faker = \Faker\Factory::create();

$factory->define(App\User::class, function (Faker $faker) {
    $jobs = Job::all();
    $lastActiveAt = ['2018-05-9 00:00:00', '2018-06-10 00:00:00', '2018-07-12 00:00:00'];

    return [
        'email' => $faker->unique()->email,
        'password' => bcrypt('123123123'),
        'fullname' => $faker->name,
        'nickname' => $faker->word,
        'date_of_birth' => $faker->dateTimeThisCentury('-20 years'),
        'gender' => rand(1, 2),
        'height' => rand(130, 200),
        'salary_id' => rand(1, 12),
        'body_type_id' => rand(1, 8),
        'prefecture_id' => 13,
        'hometown_id' => rand(1, 49),
        'job_id' => $faker->randomElement($jobs->pluck('id')->toArray()),
        'drink_volume_type' => rand(1, 3),
        'smoking_type' => rand(1, 3),
        'siblings_type' => rand(1, 3),
        'cohabitant_type' => rand(1, 4),
        'intro' => $faker->sentence,
        'cost' => $faker->randomElement([1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 15000, 20000]),
        'point' => rand(10000, 100000),
        'type' => rand(1, 2),
        'status' => rand(0, 1),
        'working_today' => rand(0, 1),
        'class_id' => rand(1, 3),
        'last_active_at' => $faker->randomElement($lastActiveAt),
        'created_at' => \Carbon\Carbon::now(),
        'updated_at' => \Carbon\Carbon::now(),
    ];
});
