<?php

namespace App\Http\Controllers\Admin\NotificationSchedule;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Input;
use Storage;
use Webpatser\Uuid\Uuid;

class UploadImageController extends Controller
{
    public function upload(Request $request)
    {
        $rules = [
            'upload' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:1024'],
        ];

        $validator = validator(request()->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['success' => false], 400);
        }

        try {
            $image = request()->file('upload');
            $imageName = Uuid::generate()->string . '.' . strtolower($image->getClientOriginalExtension());
            $fileUploaded = Storage::put($imageName, file_get_contents($image), 'public');
            $funcNum = $request->CKEditorFuncNum;
            $url = Storage::url($imageName);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 500);
        }
        echo "<script>window.parent.CKEDITOR.tools.callFunction({$funcNum},'{$url}','')</script>";
    }
}
