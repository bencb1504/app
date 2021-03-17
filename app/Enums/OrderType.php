<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class OrderType extends Enum
{
    const NOMINATED_CALL = 1;
    const CALL = 2;
    const NOMINATION = 3;
    const HYBRID = 4;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        if (self::NOMINATED_CALL === $value) {
            return 'コール内指名';
        } elseif (self::CALL === $value) {
            return 'コール';
        } elseif (self::NOMINATION === $value) {
            return '指名予約';
        } elseif (self::HYBRID === $value) {
            return 'コール・コール内指名';
        }

        return parent::getDescription($value);
    }
}
