<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class RoomType extends Enum
{
    const SYSTEM = 1;
    const DIRECT = 2;
    const GROUP = 3;

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
