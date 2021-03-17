<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class BankAccountType extends Enum
{
    const NORMAL = 1;
    const CHECKING = 2;
    const SAVING = 3;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        switch ($value) {
            case self::NORMAL:
                return '普通';
                break;
            case self::CHECKING:
                return '当座';
                break;
            default:break;
        }

        return parent::getDescription($value);
    }
}
