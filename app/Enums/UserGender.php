<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class UserGender extends Enum
{
    const HIDDEN = 0;
    const MALE = 1;
    const FEMALE = 2;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        if (self::HIDDEN === $value) {
            return '非公開';
        } elseif (self::MALE === $value) {
            return '男性';
        } elseif (self::FEMALE === $value) {
            return '女性';
        }

        return parent::getDescription($value);
    }
}
