<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class Status extends Enum
{
    const INACTIVE = 0;
    const ACTIVE = 1;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        if ($value === self::INACTIVE) {
            return '無効';
        } elseif ($value === self::ACTIVE) {
            return '有効';
        }

        return parent::getDescription($value);
    }
}
