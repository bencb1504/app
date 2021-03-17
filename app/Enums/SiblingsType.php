<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class SiblingsType extends Enum
{
    const ELDEST = 1;
    const SECOND = 2;
    const OTHER = 3;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        if ($value === self::ELDEST) {
            return '長男';
        } elseif ($value === self::SECOND) {
            return '次男';
        } elseif ($value === self::OTHER) {
            return 'その他';
        }

        return parent::getDescription($value);
    }
}
