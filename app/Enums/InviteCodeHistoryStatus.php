<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class InviteCodeHistoryStatus extends Enum
{
    const PENDING = 1;
    const RECEIVED = 2;

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
                return '未完了';
                break;
            case self::RECEIVED:
                return '完了';
                break;
                
            default:break;
        }

        return parent::getDescription($value);
    }
}
