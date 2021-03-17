<?php

if (!function_exists('generateStorageImage')) {
    function generateStorageImage($faker)
    {
        if (env('FILESYSTEM_DRIVER') != 's3') {
            $image = $faker->image(storage_path('app/public'), 400, 400, null, false);
        } else {
            $imageUrl = $faker->imageUrl(400, 400);
            $imageName = Webpatser\Uuid\Uuid::generate()->string . '.jpg';
            Storage::put($imageName, file_get_contents($imageUrl), 'public');

            $image = $imageName;
        }

        return $image;
    }
}

if (!function_exists('getUserHeight')) {
    function getUserHeight($height)
    {
        if (0 === $height) {
            return '非公開';
        }

        return $height;
    }
}

if (!function_exists('latestOnlineStatus')) {
    function latestOnlineStatus($previousTime)
    {
        if (null === $previousTime) {
            return '';
        }

        Carbon\Carbon::setLocale('ja');
        $now = Carbon\Carbon::now();
        $previousTime = Carbon\Carbon::parse($previousTime);
        $divTime = $now->diffForHumans($previousTime);

        return $divTime;
    }
}

if (!function_exists('getImages')) {
    function getImages($path)
    {
        return Storage::url($path);
    }
}

if (!function_exists('getPrefectureName')) {
    function getPrefectureName($id)
    {
        return App\Prefecture::find($id)->name;
    }
}

if (!function_exists('getDay')) {
    function getDay($month = null)
    {
        $date = \Carbon\Carbon::now()->addMinutes(30);
        $dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

        if (!isset($month)) {
            $month = $date->month;
        }

        $currentMonth = $date->month;

        if ($currentMonth > $month) {
            $year = $date->year + 1;
        } else {
            $year = $date->year;
        }

        $number = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        $days = [];
        foreach (range(01, $number) as $val) {
            $days[$val] = $val . '日' . '(' . $dayOfWeek[Carbon\Carbon::parse($year . '-' . $month . '-' . $val)->dayOfWeek] . ')';
        }

        return $days;
    }
}

if (!function_exists('dayOfWeek')) {
    function dayOfWeek()
    {
        return ['日', '月', '火', '水', '木', '金', '土'];
    }
}

if (!function_exists('removeHtmlTags')) {
    function removeHtmlTags($content)
    {
        $content = str_replace("<br />", PHP_EOL, $content);
        $content = str_replace("&nbsp;", " ", $content);

        return strip_tags($content);
    }
}

if (!function_exists('linkExtractor')) {
    function linkExtractor($html)
    {
        $linkArray = [];
        if (preg_match_all('/<img\s+.*?src=[\"\']?([^\"\' >]*)[\"\']?[^>]*>/i', $html, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                array_push($linkArray, $match[1]);
            }
        }
        return $linkArray;
    }
}

if (!function_exists('listDate')) {
    function listDate($data = null)
    {
        $currentDate = \Carbon\Carbon::now();
        $currentMonth = $currentDate->format('m');
        $currentDay = $currentDate->format('d');

        if (!isset($data['month'])) {
            $data['month'] = $currentDate->month;
        }

        if (!isset($data['year'])) {
            $data['year'] = $currentDate->year;
        }

        $days = [];

        $number = cal_days_in_month(CAL_GREGORIAN, $data['month'], $data['year']);

        foreach (range(01, $number) as $val) {
            if ($data['month'] == $currentMonth && $currentDay <= $val) {
                $days[$val] = $val;
            } else {
                if ($data['month'] != $currentMonth) {
                    $days[$val] = $val;
                }
            }
        }

        return $days;
    }
}

if (!function_exists('put_permanent_env')) {
    function putPermanentEnv($key, $value)
    {
        $path = app()->environmentFilePath();

        $escaped = preg_quote('=' . env($key), '/');

        file_put_contents($path, preg_replace(
            "/^{$key}{$escaped}/m",
            "{$key}={$value}",
            file_get_contents($path)
        ));
    }
}

if (!function_exists('transferLinkMessage')) {
    function transferLinkMessage($value)
    {
        $pattern = '/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\w]*))?)/';
        if (preg_match($pattern, $value, $url)) {
            return preg_replace($pattern, '<a href="$1" target="_blank">$1</a>', $value);
        } else {
            return $value;
        }
    }
}

if (!function_exists('getUniqueArray')) {
    function getUniqueArray($arr, $key) {
        $uniqueArray = array();

        foreach($arr as $item) {
            $niddle = $item[$key];
            if(array_key_exists($niddle, $uniqueArray)) continue;
            $uniqueArray[$niddle] = $item;
        }

        return $uniqueArray;
    }
}

if (!function_exists('generateInviteCode')) {
    function generateInviteCode() {
        $permitted_chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        $code = str_shuffle($permitted_chars);

        return substr($code, 0, 6);;
    }
}

if (!function_exists('addHtmlTags')) {
    function addHtmlTags($content)
    {
        return str_replace("\n", "<br>", $result = str_replace(' ', '&nbsp;', $content));
    }
}
