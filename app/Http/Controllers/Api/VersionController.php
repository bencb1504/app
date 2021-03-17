<?php

namespace App\Http\Controllers\Api;

use App\AppVersion;

class VersionController extends ApiController
{
    public function index()
    {
        $versions = AppVersion::all();

        $data = [
            'android' => $versions[1]->version,
            'ios' => $versions[0]->version,
        ];

        return $this->respondWithData($data);
    }
}
