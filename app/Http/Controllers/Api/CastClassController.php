<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CastClassResource;
use App\Repositories\CastClassRepository;

class CastClassController extends ApiController
{
    protected $repository;

    public function __construct()
    {
        $this->repository = app(CastClassRepository::class);
    }

    public function index()
    {

        $castClass = $this->repository->all();

        return $this->respondWithData(CastClassResource::collection($castClass));
    }
}
