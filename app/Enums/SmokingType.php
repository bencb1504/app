<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class SmokingType extends Enum
{
    const YES = 1;
    const OPTIONAL = 2;
    const NO = 3;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        if ($value === self::YES) {
            return '吸う';
        } elseif ($value === self::OPTIONAL) {
            return '相手が嫌なら吸わない';
        } elseif ($value === self::NO) {
            return '吸わない';
        }

        return parent::getDescription($value);
    }
}
