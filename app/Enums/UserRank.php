<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class UserRank extends Enum
{
    const AA = 1;
    const A = 2;
    const B = 3;
    const C = 4;
    const D = 5;
    const E = 6;

    public static function getDescription($value): string
    {
        switch ($value) {
            case self::AA:
                return 'AAランク';
                break;
            case self::A:
                return 'Aランク';
                break;
            case self::B:
                return 'Bランク';
                break;
            case self::C:
                return 'Cランク';
                break;
            case self::D:
                return 'Dランク';
                break;
            case self::E:
                return 'Eランク';
                break;
            default:
                return self::getKey($value);
        }

        return parent::getDescription($value);
    }
}
