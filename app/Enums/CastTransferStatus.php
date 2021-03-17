<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class CastTransferStatus extends Enum
{
    const PENDING = 1;
    const DENIED = 2;
    const APPROVED = 3;
    const OFFICIAL = 4;
    const VERIFIED_STEP_ONE = 5;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        switch ($value) {
            case self::PENDING:
                return '新規申請';
                break;
            case self::DENIED:
                return '見送り';
                break;
            case self::VERIFIED_STEP_ONE:
                return '一次審査通過';
                break;
            default:break;
        }

        return parent::getDescription($value);
    }
}
