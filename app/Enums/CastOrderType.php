<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class CastOrderType extends Enum
{
    const NOMINEE = 1;
    const CANDIDATE = 2;

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
