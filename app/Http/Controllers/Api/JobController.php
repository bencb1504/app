<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\JobResource;
use App\Job;
use App\Repositories\JobRepository;
use Illuminate\Http\Request;

class JobController extends ApiController
{
    protected $repository;

    public function __construct()
    {
        $this->repository = app(JobRepository::class);
    }

    public function index(Request $request)
    {
        $jobs = $this->repository->all();

        return $this->respondWithData(JobResource::collection($jobs));
    }
}
