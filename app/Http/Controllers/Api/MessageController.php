<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoomType;
use App\Enums\SystemMessageType;
use App\Events\MessageCreated;
use App\Http\Resources\MessageResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\RoomResource;
use App\Jobs\MakeImagesChatThumbnail;
use App\Message;
use App\Services\LogService;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Webpatser\Uuid\Uuid;

class MessageController extends ApiController
{
    public function index(Request $request, $id)
    {
        $rules = [
            'current_id' => 'numeric|min:1',
            'per_page' => 'numeric|min:1',
            'action' => 'required_with:current_id|in:1,2',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();

        $room = $user->rooms()->active()->find($id);

        if (empty($room)) {
            return $this->respondErrorMessage(trans('messages.room_not_found'), 404);
        }

        $ownerId = $room->owner_id;
        $partner = $room->users->where('id', '<>', $ownerId)->first()->id;
        $messages = $room->messages()->with('user')->latest();

        if ($room->is_direct && $room->checkBlocked($partner)) {
            $messages = $messages->whereDoesntHave('recipients', function ($q) use ($user) {
                $q->where([
                    ['user_id', '=', $user->id],
                    ['is_show', '=', false],
                ]);
            });
        }

        if ($request->action) {
            $action = $request->action;
            $currentId = $request->current_id;
            if (1 == $action) {
                $messages = $messages->where('id', '<', $currentId);
            } else {
                $messages = $messages->where('id', '>', $currentId);
            }
        }

        $messages = $messages->paginate($request->per_page);

        DB::table('message_recipient')
            ->where([
                'user_id' => $user->id,
                'room_id' => $room->id,
            ])
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messagesCollection = collect($messages->items());

        $messagesData = $messagesCollection->mapToGroups(function ($item, $key) {
            return [
                $item->created_at->format('Y-m-d') => MessageResource::make($item),
            ];
        });

        $messages->setCollection(collect($messagesData->values()->all()));
        $messages = $messages->toArray();
        $messages['order'] = $room->room_order ? OrderResource::make($room->room_order->load(['casts', 'user', 'nominees'])) : null;
        $messages['room'] = RoomResource::make($room->load('users'));

        if ('html' == $request->response_type) {
            return view('web.content-message', compact('messages'));
        }

        return $this->respondWithData($messages);
    }

    public function delete($id)
    {
        $user = $this->guard()->user();

        $message = $user->messages()->find($id);

        if (!$message) {
            return $this->respondErrorMessage(trans('messages.message_exits'), 409);
        }

        $message->delete($id);

        return $this->respondWithNoData(trans('messages.delete_message_success'));
    }

    public function store(Request $request, $id)
    {
        $rules = [
            'message' => 'required_if:type,2',
            'image' => 'required_if:type,3|file|image|mimes:jpeg,png,jpg,gif,svg',
            'type' => 'required',
            'is_manual' => '',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();

        $room = $user->rooms()->active()->find($id);

        if (!$room) {
            return $this->respondErrorMessage(trans('messages.room_not_found'), 404);
        }

        $message = new Message;
        $message->room_id = $id;
        $message->user_id = $this->guard()->id();
        $message->type = $request->type;

        if (1 == $this->guard()->user()->id) {
            $message->system_type = SystemMessageType::NORMAL;
        }

        if ($request->message) {
            $message->message = $request->message;
        }

        if ($request->is_manual) {
            $message->is_manual = true;
        }

        if (request()->has('image')) {
            $image = request()->file('image');
            $imageName = Uuid::generate()->string . '.' . strtolower($image->getClientOriginalExtension());
            $image = \Image::make($image)->encode('jpg', 75);
            $fileUploaded = Storage::put($imageName, $image->__toString(), 'public');

            if ($fileUploaded) {
                $message->image = $imageName;
            }
        }

        try {
            $userIds = $room->users()->where('users.id', '<>', $user->id)->pluck('users.id')->toArray();

            $message->save();

            if (request()->has('image')) {
                MakeImagesChatThumbnail::dispatch($message->id);
            }
            if (RoomType::DIRECT == $room->type && $user->getBlocked($userIds[0])) {
                $message->recipients()->attach($userIds, ['room_id' => $id, 'is_show' => false]);
            } else {
                $message->recipients()->attach($userIds, ['room_id' => $id]);

                broadcast(new MessageCreated($message->id))->toOthers();
            }

            $message = $message->load('user');
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }

        return $this->respondWithData(MessageResource::make($message));
    }
}
