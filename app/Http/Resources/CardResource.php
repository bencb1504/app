<?php

namespace App\Http\Resources;

use App\Traits\ResourceResponse;
use Illuminate\Http\Resources\Json\Resource;

class CardResource extends Resource
{
    use ResourceResponse;

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return $this->filterNull([
            'id' => $this->id,
            'card_id' => $this->card_id,
            'address_city' => $this->address_city,
            'address_country' => $this->address_country,
            'address_line1' => $this->address_line1,
            'address_line1_check' => $this->address_line1_check,
            'address_line2' => $this->address_line2,
            'address_state' => $this->address_state,
            'address_zip' => $this->address_zip,
            'address_zip_check' => $this->address_zip_check,
            'brand' => $this->brand,
            'country' => $this->country,
            'customer' => $this->customer,
            'cvc_check' => $this->cvc_check,
            'dynamic_last4' => $this->dynamic_last4,
            'exp_month' => $this->exp_month,
            'exp_year' => $this->exp_year,
            'fingerprint' => $this->fingerprint,
            'funding' => $this->funding,
            'last4' => $this->last4,
            'name' => $this->name,
            'tokenization_method' => $this->tokenization_method,
            'is_default' => $this->is_default,
            'is_expired' => $this->is_expired,
        ]);
    }
}
