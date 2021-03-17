<?php

namespace App\Http\Controllers\Admin;

use App\AppVersion;
use App\Http\Controllers\Controller;
use App\Services\LogService;
use Illuminate\Http\Request;

class AppVersionController extends Controller
{
    public function index(Request $request)
    {
        $appVersions = AppVersion::all();

        return view('admin.app_versions.index', compact('appVersions'));
    }

    public function update(AppVersion $appVersion, Request $request)
    {
        $rules = [
            'version' => 'required',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()->all()], 400);
        }

        $input = [
            'version' => $request->version,
        ];

        try {
            $appVersion->update($input);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            $request->session()->flash('msg', trans('messages.server_error'));
        }

        return response()->json(['success' => true]);
    }
}
