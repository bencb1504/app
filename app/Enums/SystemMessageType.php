<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class SystemMessageType extends Enum
{
    const NORMAL = 1;
    const NOTIFY = 2;

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
