<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class PointType extends Enum
{
    const BUY = 1;
    const PAY = 2;
    const AUTO_CHARGE = 3;
    const ADJUSTED = 4;
    const RECEIVE = 5;
    const TRANSFER = 6;
    const EVICT = 7;
    const TEMP = 8;
    const INVITE_CODE = 9;
    const DIRECT_TRANSFER = 10;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        switch ($value) {
            case self::BUY:
                return 'ポイント購入';
                break;
            case self::PAY:
                return 'ポイント決済';
                break;
            case self::AUTO_CHARGE:
                return 'オートチャージ';
                break;
            case self::ADJUSTED:
                return '調整';
                break;
            case self::RECEIVE:
                return 'ポイント受取';
                break;
            case self::TRANSFER:
                return '振込';
                break;
            case self::EVICT:
                return 'ポイント失効';
                break;
            case self::INVITE_CODE:
                return 'ポイント付与';
                break;
            case self::DIRECT_TRANSFER:
                return 'ポイント付与';
                break;

            default:break;
        }

        return parent::getDescription($value);
    }
}
