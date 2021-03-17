<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class WorkingType extends Enum
{
    const LEAVING_WORK = 0;
    const ON_WORK = 1;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        if ($value === self::LEAVING_WORK) {
            return '退勤中';
        } elseif ($value === self::ON_WORK) {
            return '出勤中';
        }

        return parent::getDescription($value);
    }
}
