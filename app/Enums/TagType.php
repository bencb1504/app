<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class TagType extends Enum
{
    const DESIRE = 1;
    const SITUATION = 2;

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
