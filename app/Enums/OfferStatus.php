<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class OfferStatus extends Enum
{
    const INACTIVE = 1;
    const ACTIVE = 2;
    const DONE = 3;
    const TIMEOUT = 4;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        switch ($value) {
            case self::INACTIVE:
                return '仮保存';
                break;
            case self::ACTIVE:
                return 'オファー中';
                break;
            case self::DONE:
                return '予約確定';
                break;
            case self::TIMEOUT:
                return 'マッチング不成立';
                break;

            default:break;
        }

        return parent::getDescription($value);
    }
}
