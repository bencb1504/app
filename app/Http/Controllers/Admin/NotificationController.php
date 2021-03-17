<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function makeAsRead(Request $request)
    {
        $notification = Notification::find($request->notificationId)->markAsRead();

        return response()->json(['status' => true]);
    }
}
