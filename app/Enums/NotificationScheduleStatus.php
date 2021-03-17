<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class NotificationScheduleStatus extends Enum
{
    const PUBLISH = 2;
    const UNPUBLISH = 3;

    public static function getDescription($value): string
    {
        if (self::PUBLISH == $value) {
            return '公開';
        } elseif (self::UNPUBLISH == $value) {
            return '非公開';
        }

        return parent::getDescription($value);
    }
}
