<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class AppVersionType extends Enum
{
    const IOS = 1;
    const ANDROID = 2;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        switch ($value) {
            case self::IOS:
                return 'ios';
                break;
            case self::ANDROID:
                return 'android';
                break;
            default:break;
        }

        return parent::getDescription($value);
    }
}
