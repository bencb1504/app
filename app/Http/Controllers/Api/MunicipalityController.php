<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\MunicipalityResource;
use App\Prefecture;
use App\Repositories\MunicipalityRepository;
use App\Repositories\PrefectureRepository;
use Illuminate\Http\Request;

class MunicipalityController extends ApiController
{
    protected $repository;
    protected $prefecture;

    public function __construct()
    {
        $this->repository = app(MunicipalityRepository::class);
        $this->prefecture = app(PrefectureRepository::class);
    }

    public function index(Request $request)
    {
        $rules = [
            'prefecture_id' => 'numeric',
        ];

        $validator = validator(request()->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $prefectureId = request()->prefecture_id;

        if (isset($prefectureId)) {
            $prefecture = $this->prefecture->find($prefectureId);

            if (!$prefecture) {
                return $this->respondErrorMessage(trans('messages.prefecture_not_found'), 404);
            }

            $municipalities = $prefecture->municipalities;
        } else {
            $municipalities = $this->repository->all();
        }

        return $this->respondWithData(MunicipalityResource::collection($municipalities));
    }
}
