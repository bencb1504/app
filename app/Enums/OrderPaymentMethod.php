<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class OrderPaymentMethod extends Enum
{
    const CREDIT_CARD = 1;
    const DIRECT_PAYMENT = 2;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        switch ($value) {
            case self::CREDIT_CARD:
                return 'クレジットカード';
                break;
            case self::DIRECT_PAYMENT:
                return '銀行振込';
                break;
            default:
                return self::getKey($value);
        }
    }
}
