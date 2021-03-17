<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ResignStatus;
use App\Enums\RoomType;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Room;
use App\User;
use DB;
use http\Url;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;

class ChatRoomController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;
        $token = JWTAuth::fromUser($user);

        $unReads = DB::table('message_recipient')
            ->where('user_id', 1)
            ->where('is_show', true)
            ->whereNull('read_at')
            ->select('room_id', DB::raw('count(*) as total'))
            ->groupBy('room_id')->get();

        $roomGuests = DB::table('rooms')->where('is_active', true)
            ->where('rooms.type', RoomType::SYSTEM)
            ->join('users', function ($j) {
                $j->on('rooms.owner_id', '=', 'users.id')
                    ->where('users.type', UserType::GUEST);
            })
            ->leftJoin('avatars', function ($j) {
                $j->on('avatars.user_id', '=', 'users.id')
                    ->where('is_default', true);
            })
            ->where(function($query) {
                $query->whereNull('users.deleted_at')
                    ->orWhere(function($sq) {
                        $sq->where('users.deleted_at', '<>', null)
                            ->where('users.resign_status', ResignStatus::APPROVED);
                    });
            })
            ->select('rooms.*', 'users.type As user_type', 'users.gender', 'users.nickname', 'avatars.thumbnail')
            ->orderBy('users.updated_at', 'DESC')
            ->paginate(100);

        $roomCasts = DB::table('rooms')->where('is_active', true)
            ->where('rooms.type', RoomType::SYSTEM)
            ->join('users', function ($j) {
                $j->on('rooms.owner_id', '=', 'users.id')
                    ->where('users.type', UserType::CAST);
            })
            ->leftJoin('avatars', function ($j) {
                $j->on('avatars.user_id', '=', 'users.id')
                    ->where('is_default', true);
            })
            ->where(function($query) {
                $query->whereNull('users.deleted_at')
                    ->orWhere(function($sq) {
                        $sq->where('users.deleted_at', '<>', null)
                            ->where('users.resign_status', ResignStatus::APPROVED);
                    });
            })
            ->select('rooms.*', 'users.type As user_type', 'users.gender', 'users.nickname', 'avatars.thumbnail')
            ->orderBy('users.updated_at', 'DESC')
            ->paginate(100);

        $rooms = array_merge($roomGuests->items(), $roomCasts->items());
        $rooms = json_encode($rooms, true);
        $baseUrl = \URL::to('/');

        if (env('APP_ENV') == 'local') {
            $storagePath = \Storage::url(null);
        } else {
            $storagePath = substr(\Storage::url('/'),0, -1);
        }

        return view('admin.chatroom.index', compact('token', 'userId', 'rooms', 'unReads', 'storagePath', 'baseUrl'));
    }
}
