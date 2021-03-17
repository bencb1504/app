<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class NotificationScheduleType extends Enum
{
    const ALL = 1;
    const GUEST = 2;
    const CAST = 3;

    public static function getDescription($value): string
    {
        if (self::ALL == $value) {
            return '全ユーザー';
        } elseif (self::GUEST == $value) {
            return 'ゲスト';
        } elseif (self::CAST == $value) {
            return 'キャスト';
        }

        return parent::getDescription($value);
    }
}
