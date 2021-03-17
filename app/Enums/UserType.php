<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class UserType extends Enum
{
    const GUEST = 1;
    const CAST = 2;
    const ADMIN = 3;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        if ($value === self::GUEST) {
            return 'ゲスト';
        } elseif ($value === self::CAST) {
            return 'キャスト';
        }

        return parent::getDescription($value);
    }
}
