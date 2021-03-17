<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class CastOrderStatus extends Enum
{
    const OPEN = 0;
    const ACCEPTED = 1;
    const DENIED = 2;
    const CANCELED = 3;
    const TIMEOUT = 4;
    const PROCESSING = 5;
    const DONE = 6;
    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        if (self::ACCEPTED === $value) {
            return '承諾済み';
        } elseif (self::CANCELED === $value) {
            return 'キャンセル';
        }

        return parent::getDescription($value);
    }
}
