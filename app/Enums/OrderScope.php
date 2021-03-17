<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class OrderScope extends Enum
{
    const OPEN_TODAY = 1;
    const OPEN_TOMORROW_ONWARDS = 2;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        return parent::getDescription($value);
    }
}
