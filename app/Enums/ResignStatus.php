<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class ResignStatus extends Enum
{
    const NOT_RESIGN = 0;
    const PENDING = 1;
    const APPROVED = 2;

    public static function getDescription($value): string
    {
        switch ($value) {
            case self::PENDING:
                return '退会申請';
                break;
            case self::APPROVED:
                return '退会済み';
                break;

            default:break;
        }

        return parent::getDescription($value);
    }
}
