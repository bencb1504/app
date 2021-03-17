<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class PaymentRequestStatus extends Enum
{
    const OPEN = 1;
    const REQUESTED = 2;
    const UPDATED = 3;
    const CLOSED = 4;
    const CONFIRM = 5;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        return parent::getDescription($value);
    }
}
