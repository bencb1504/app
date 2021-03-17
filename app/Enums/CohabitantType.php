<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class CohabitantType extends Enum
{
    const ALONE = 1;
    const FAMILY = 2;
    const SHARE_HOUSE = 3;
    const OTHER = 4;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        switch ($value) {
            case self::ALONE:
                return '一人暮らし';
                break;
            case self::FAMILY:
                return '実家暮らし';
                break;
            case self::SHARE_HOUSE:
                return 'シェアハウス';
                break;
            case self::OTHER:
                return 'その他';
                break;
            default:
                return self::getKey($value);
        }
    }
}
