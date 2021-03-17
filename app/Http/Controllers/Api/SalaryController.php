<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Salary;
use App\Http\Resources\SalaryResource;
use App\Repositories\SalaryRepository;

class SalaryController extends ApiController
{
    protected $repository;

    public function __construct()
    {
        $this->repository = app(SalaryRepository::class);
    }

    public function index()
    {

        $salaries = $this->repository->all();

        return $this->respondWithData(SalaryResource::collection($salaries));
    }
}
