<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class OrderPaymentStatus extends Enum
{
    const WAITING = 1;
    const REQUESTING = 2;
    const EDIT_REQUESTING = 3;
    const PAYMENT_FINISHED = 4;
    const CANCEL_FEE_PAYMENT_FINISHED = 5;
    const PAYMENT_FAILED = 6;

    /**
     * Get the description for an enum value
     *
     * @param $value
     * @return string
     */
    public static function getDescription($value): string
    {
        switch ($value) {
            case self::WAITING:
                return '売上申請待ち';
                break;
            case self::REQUESTING:
                return '売上申請中';
                break;
            case self::EDIT_REQUESTING:
                return '売上申請修正依頼中';
                break;
            case self::PAYMENT_FINISHED:
                return 'ポイント決済完了';
                break;
            case self::CANCEL_FEE_PAYMENT_FINISHED:
                return 'ポイント決済完了(キャンセル料)';
                break;
            case self::PAYMENT_FAILED:
                return '決済エラー';
                break;
            default:
                return self::getKey($value);
        }
    }
}
