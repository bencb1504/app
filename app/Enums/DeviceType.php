<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class DeviceType extends Enum
{
    const IOS = 1;
    const ANDROID = 2;
    const WEB = 3;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */

    public static function getDescription($value): string
    {
        if (self::IOS === $value) {
            return 'iOS';
        } elseif (self::ANDROID === $value) {
            return 'Android';
        } elseif (self::WEB == $value) {
            return 'Web';
        }

        return parent::getDescription($value);
    }
}
