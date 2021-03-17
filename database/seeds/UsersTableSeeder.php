<?php
use Illuminate\Database\Seeder;
use Webpatser\Uuid\Uuid;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->truncate();

        $faker = Faker\Factory::create();

        // create an admin
        $admin = [
            'email' => 'admin@cheers.dev',
            'password' => bcrypt('123123123'),
            'nickname' => 'Cheers 運営局',
            'type' => 3,
        ];

        DB::table('users')->insert($admin);
        $fileContents = \Storage::disk('local')->get("system_images/icon.png");
        $fileName = Uuid::generate()->string . '.png';
        \Storage::put($fileName, $fileContents, 'public');

        \App\Avatar::create([
            'path' => $fileName,
            'thumbnail' => $fileName,
            'is_default' => true,
            'user_id' => 1
        ]);
        /* factory(App\User::class, 50)->create();

        // generate avatars for users
        $users = App\User::all();
        $images = [];
        for ($i = 0; $i < 10; $i++) {
            $images[] = generateStorageImage($faker);
        }

        foreach ($users as $user) {
            $numberOfImages = rand(1, 10);

            for ($j = 0; $j < $numberOfImages; $j++) {
                $user->avatars()->create([
                    'path' => $faker->randomElement($images),
                ]);
            }
        } */
    }
}
