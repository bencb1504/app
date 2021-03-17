<?php

use App\Enums\TagType;
use Illuminate\Database\Seeder;

class TagsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('tags')->truncate();

        $data = [
            [
                'type' => 0,
                'name' => [
                    '聞き上手',
                    '話し上手',
                    'カラオケ上手',
                    '盛り上げ上手',
                    'ノリが良い',
                    'お酒が飲める',
                    '清楚系',
                    'ギャル系',
                    '癒し系',
                    '可愛い系',
                    '綺麗系',
                    '童顔',
                    '小柄',
                    '普通な身長',
                    '背高め',
                    'スレンダー',
                    '普通な体型',
                    'グラマー',
                    '英語OK',
                    '学生',
                    '20代前半',
                    '20代後半',
                    '30代',
                ],
            ],
            [
                'type' => 0,
                'name' => [
                    'プライベート',
                    '接待',
                    'わいわい',
                    'しっぽり',
                    'さくっと',
                    '終電まで',
                    '朝まで',
                    'カラオケ',
                    'クラブ',
                    'ランチ',
                ],
            ],
            [
                'type' => TagType::DESIRE,
                'name' => [
                    '聞き上手',
                    '話し上手',
                    'カラオケ上手',
                    'お酒が飲める',
                    '学生',
                    '社会人',
                ],
            ],
            [
                'type' => TagType::SITUATION,
                'name' => [
                    'プライベート',
                    '接待',
                    'わいわい',
                    'しっぽり',
                    'さくっと',
                    '終電まで',
                    '朝まで',
                    'カラオケ',
                    'クラブ',
                    'ランチ',
                    'バー',
                    '映画',
                    'ショッピング',
                ],
            ],
        ];

        $importData = [];

        foreach ($data as $typeSet) {
            $type = $typeSet['type'];

            foreach ($typeSet['name'] as $name) {
                $importData[] = compact('name', 'type');
            }
        }

        DB::table('tags')->insert($importData);
    }
}