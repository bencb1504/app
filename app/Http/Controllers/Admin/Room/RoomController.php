<?php

namespace App\Http\Controllers\Admin\Room;

use App\Enums\RoomType;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Room;
use Carbon\Carbon;

class RoomController extends Controller
{
    public function getMessageByRoom(Room $room, CheckDateRequest $request)
    {
        $messages = $room->messages()->with('user');

        if ($request->has('from_date') && !empty($request->from_date)) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $messages->where(function ($query) use ($fromDate) {
                $query->where('created_at', '>=', $fromDate);
            });
        }

        if ($request->has('to_date') && !empty($request->to_date)) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $messages->where(function ($query) use ($toDate) {
                $query->where('created_at', '<=', $toDate);
            });
        }

        if ($request->search) {
            $keyword = $request->search;

            $messages->whereHas('user', function ($query) use ($keyword) {
                $query->where('id', "$keyword")
                    ->orWhere('fullname', 'like', "%$keyword%");
            });
        }

        $messages = $messages->orderBy('created_at', 'DESC')->paginate($request->limit ?: 10);

        return view('admin.rooms.message_by_room', compact('messages', 'room'));
    }

    public function changeActive(Room $room)
    {
        $room->is_active = !$room->is_active;

        $room->save();

        return redirect()->route('admin.rooms.messages_by_room', ['room' => $room->id]);
    }

    public function index(CheckDateRequest $request)
    {
        $keyword = $request->search;

        $rooms = Room::where('type', '<>', RoomType::SYSTEM)->with('users');

        if ($request->from_date) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $rooms->where(function ($query) use ($fromDate) {
                $query->where('created_at', '>=', $fromDate);
            });
        }

        if ($request->to_date) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $rooms->where(function ($query) use ($toDate) {
                $query->where('created_at', '<=', $toDate);
            });
        }

        if ($request->search) {
            $rooms->whereHas('users', function ($query) use ($keyword) {
                $query->where('users.id', "$keyword")
                    ->orWhere('nickname', 'like', "%$keyword%");
            });
        }
        $rooms = $rooms->orderBy('updated_at', 'DESC')->paginate($request->limit ?: 10);

        return view('admin.rooms.index', compact('rooms'));
    }

    public function getMember(Room $room)
    {
        $ownerId = $room->owner_id;
        $members = $room->users;

        return view('admin.rooms.room_group', compact('members', 'ownerId'));
    }
}
