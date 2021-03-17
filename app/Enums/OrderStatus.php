<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class OrderStatus extends Enum
{
    const OPEN = 1;
    const ACTIVE = 2;
    const PROCESSING = 3;
    const DONE = 4;
    const CANCELED = 5;
    const DENIED = 6;
    const TIMEOUT = 7;
    const SKIP_NOMINATION = 8;
    const OPEN_FOR_GUEST = 9;
    const GUEST_DENIED = 10;
    const CAST_CANCELED = 11;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        if (self::OPEN === $value || self::OPEN_FOR_GUEST === $value) {
            return '提案中';
        } elseif (self::ACTIVE === $value) {
            return '予約確定';
        } elseif (self::PROCESSING === $value) {
            return '合流中';
        } elseif (self::DONE === $value) {
            return '解散中';
        } elseif (self::TIMEOUT === $value || self::CANCELED === $value || self::DENIED === $value || self::GUEST_DENIED === $value) {
            return 'マッチング不成立';
        } elseif (self::SKIP_NOMINATION === $value || self::CAST_CANCELED === $value) {
            return '提案取り下げ';
        }

        return parent::getDescription($value);
    }
}
