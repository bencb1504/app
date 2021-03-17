<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class CouponType extends Enum
{
    const POINT = 1;
    const TIME = 2;
    const PERCENT = 3;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string{}
}
