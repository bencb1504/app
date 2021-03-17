<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PrefectureResource;
use App\Prefecture;
use App\Repositories\PrefectureRepository;
use Illuminate\Http\Request;

class PrefectureController extends ApiController
{
    protected $repository;

    public function __construct()
    {
        $this->repository = app(PrefectureRepository::class);
    }

    public function index(Request $request)
    {
        $filter = $request->filter;

        if (!isset($filter) || 'supported' != $filter) {
            $prefectures = $this->repository->findWhere([
                ['id', '<=', 47],
            ]);

            return $this->respondWithData(PrefectureResource::collection($prefectures));
        } else {
            $prefectures = Prefecture::whereIn('id', Prefecture::SUPPORTED_IDS)
                ->orderByRaw("FIELD(id, " . implode(',', Prefecture::SUPPORTED_IDS) . " )")
                ->get();

            return $this->respondWithData(PrefectureResource::collection($prefectures));
        }
    }

    public function getHometowns(Request $request)
    {
        $prefectures = $this->repository->all();
        $prefectures->prepend($prefectures->pull(48));

        return $this->respondWithData(PrefectureResource::collection($prefectures));
    }
}
