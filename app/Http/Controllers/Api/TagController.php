<?php

namespace App\Http\Controllers\Api;

use App\Enums\TagType;
use App\Http\Resources\TagResource;
use App\Repositories\TagRepository;
use Illuminate\Http\Request;

class TagController extends ApiController
{
    protected $repository;

    public function __construct()
    {
        $this->repository = app(TagRepository::class);
    }

    public function index(Request $request)
    {
        $type = $request->type;

        if (TagType::DESIRE == $type || TagType::SITUATION == $type) {
            $tags = $this->repository->findByField('type', $type);
        } else {
            $tags = $this->repository->findWhereIn('type', [TagType::DESIRE, TagType::SITUATION]);
        }

        return $this->respondWithData(TagResource::collection($tags));
    }
}
