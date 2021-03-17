<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AvatarResource;
use App\Jobs\MakeAvatarThumbnail;
use App\User;
use App\Rules\CheckAvatarLessThanTen;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Webpatser\Uuid\Uuid;

class AvatarController extends Controller
{
    public function upload(Request $request, User $user)
    {
        $amountAvatar = $user->avatars->count();
        if ($amountAvatar >= 10) {
            return response()->json([
                'status' => false,
                'error' => [
                    'image' => ['プロフィール写真は、最大10枚まで登録することができます'],
                ],
            ], 400);
        }

        $rules = [
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:5120'],
        ];

        $validator = validator(request()->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'error' => $validator->errors()->messages(),
            ], 400);
        }

        $input['is_default'] = false;
        $input['thumbnail'] = '';

        if (request()->has('image')) {
            $image = request()->file('image');
            $imageName = Uuid::generate()->string . '.' . strtolower($image->getClientOriginalExtension());
            $fileUploaded = Storage::put($imageName, file_get_contents($image), 'public');

            if ($fileUploaded) {
                $input['path'] = $imageName;
            }
        }

        try {
            $avatar = $user->avatars()->create($input);

            MakeAvatarThumbnail::dispatch($avatar->id);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            return response()->json([
                'status' => false,
                'error' => trans('messages.server_error'),
            ], 500);
        }

        return response()->json([
            'status' => true,
            'data'=> AvatarResource::make($avatar),
            'view' => view('admin.users.content_image', ['avatars' => $user->avatars()->get()])->render(),
        ]);
    }

    public function avatars(Request $request, User $user)
    {
        return view('admin.users.content_image', compact('user'));
    }

    public function setAvatarDefault(User $user, $id)
    {
        $avatar = $user->avatars->find($id);

        if (!$avatar) {
            return redirect()->route('admin.users.show', compact('user'))
                ->with('error', trans('messages.avatar_not_found'));
        }

        try {
            $avatar->is_default = true;
            $avatar->save();
            $user->avatars()->where('id', '!=', $id)->update(['is_default' => false]);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            return redirect()->route('admin.users.show', compact('user'))
                ->with('error', trans('messages.server_error'));
        }

        return redirect()->route('admin.users.show', compact('user'))
            ->with('message', trans('messages.set_avatar_default_success'));
    }

    public function delete(User $user, $id)
    {
        $amountAvatar = $user->avatars->count();

        if ($amountAvatar <= 1) {
            return redirect()->route('admin.users.show', compact('user'))
                ->with('error', trans('messages.avatar_at_least'));
        }

        $avatar = $user->avatars->find($id);

        if (!$avatar) {
            return redirect()->route('admin.users.show', compact('user'))
                ->with('error', trans('messages.avatar_not_found'));
        }

        try {
            $avatar->delete();
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            return redirect()->route('admin.users.show', compact('user'))
                ->with('error', trans('messages.server_error'));
        }

        return redirect()->route('admin.users.show', compact('user'))
            ->with('message', trans('messages.delete_avatar_success'));
    }

    public function update(Request $request, User $user, $id)
    {
        $avatar = $user->avatars->find($id);
        if (!$avatar) {
            return response()->json([
                'status' => false,
                'error' => trans('messages.avatar_not_found'),
            ], 404);
        }

        $rules = [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
        ];

        $validator = validator(request()->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'error' => $validator->errors()->messages(),
            ], 400);
        }

        if (request()->has('image')) {
            $nameImageOld = $user->avatars->find($id);
            if ($nameImageOld) {
                Storage::delete($nameImageOld->getOriginal()['path']);
            };

            $image = request()->file('image');
            $imageName = Uuid::generate()->string . '.' . strtolower($image->getClientOriginalExtension());
            $fileUploaded = Storage::put($imageName, file_get_contents($image), 'public');

            if ($fileUploaded) {
                $input['path'] = $imageName;
            }
        }

        try {
            $avatarUpdate = $avatar->update($input);

            if ($avatarUpdate) {
                $avatar = $user->avatars->find($id);

                MakeAvatarThumbnail::dispatch($avatar->id);
                $avatar->thumbnail = null;
            }
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            return response()->json([
                'status' => false,
                'error' => trans('messages.server_error'),
            ], 500);
        }

        return response()->json([
            'status' => true,
            'message' => trans('messages.update_avatar_success'),
            'data'=> AvatarResource::make($avatar),
            'view' => view('admin.users.content_image', ['avatars' => $user->avatars()->get()])->render(),
        ]);
    }
}
