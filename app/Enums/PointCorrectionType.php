<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class PointCorrectionType extends Enum
{
    const ACQUISITION = 1;
    const CONSUMPTION = 2;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        if ($value === self::ACQUISITION) {
            return '取得ポイント';
        } elseif ($value === self::CONSUMPTION) {
            return '消費ポイント';
        }

        return parent::getDescription($value);
    }
}
