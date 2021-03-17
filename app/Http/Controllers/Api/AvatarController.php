<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AvatarResource;
use App\Jobs\MakeAvatarThumbnail;
use App\Rules\CheckAvatarLessThanTen;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Webpatser\Uuid\Uuid;

class AvatarController extends ApiController
{
    public function upload(Request $request)
    {
        $user = $this->guard()->user();

        $rules = [
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:5120', new CheckAvatarLessThanTen],
        ];

        $validator = validator(request()->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
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
            return $this->respondServerError();
        }

        return $this->respondWithData(AvatarResource::make($avatar));
    }

    public function setAvatarDefault($id)
    {
        $user = $this->guard()->user();

        $avatar = $user->avatars->find($id);

        if (!$avatar) {
            return $this->respondErrorMessage(trans('messages.avatar_not_found'), 404);
        }

        try {
            $avatar->is_default = true;
            $avatar->save();
            $user->avatars()->where('id', '!=', $id)->update(['is_default' => false]);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            return $this->respondServerError();
        }
        return $this->respondWithNoData(trans('messages.set_avatar_default_success'));
    }

    public function delete($id)
    {
        $user = $this->guard()->user();

        $amountAvatar = $user->avatars->count();

        if ($amountAvatar <= 1) {
            return $this->respondErrorMessage(trans('messages.avatar_at_least'), 400);
        }

        $avatar = $user->avatars->find($id);

        if (!$avatar) {
            return $this->respondErrorMessage(trans('messages.avatar_not_found'), 404);
        }

        try {
            $avatar->delete();
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            return $this->respondServerError();
        }

        return $this->respondWithNoData(trans('messages.delete_avatar_success'));
    }

    public function update(Request $request, $id)
    {
        $user = $this->guard()->user();

        $avatar = $user->avatars->find($id);
        if (!$avatar) {
            return $this->respondErrorMessage(trans('messages.avatar_not_found'), 404);
        }

        $rules = [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
        ];

        $validator = validator(request()->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
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
            return $this->respondServerError();
        }

        return $this->respondWithData(AvatarResource::make($avatar));
    }
}
