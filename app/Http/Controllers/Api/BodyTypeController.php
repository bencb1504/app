<?php

namespace App\Http\Controllers\Api;

use App\BodyType;
use App\Http\Resources\BodyTypeResource;
use App\Repositories\BodyTypeRepository;
use Illuminate\Http\Request;

class BodyTypeController extends ApiController
{
    protected $repository;

    public function __construct()
    {
        $this->repository = app(BodyTypeRepository::class);
    }

    public function index(Request $request)
    {
        $bodyTypes = $this->repository->all();

        return $this->respondWithData(BodyTypeResource::collection($bodyTypes));
    }
}
