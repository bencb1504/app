<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class ReportStatus extends Enum
{
    const OPEN = 0;
    const DONE = 1;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        if (self::OPEN === $value) {
            return '未完了';
        } elseif (self::DONE === $value) {
            return '完了';
        }

        return parent::getDescription($value);
    }
}
