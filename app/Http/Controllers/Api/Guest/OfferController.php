<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\OfferResource;
use App\Offer;

class OfferController extends ApiController
{
    public function show($id)
    {
        $offer = Offer::find($id);

        if (!$offer) {
            return $this->respondErrorMessage(trans('messages.offer_not_found'), 404);
        }

        return $this->respondWithData(new OfferResource($offer));
    }
}
