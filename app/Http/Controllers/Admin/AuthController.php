<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function index()
    {
        if (Auth::check()) {
            return redirect()->route('admin.users.index');
        }

        return view('admin.login');
    }

    public function login(Request $request)
    {
        $credentials = request()->only('email', 'password');
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            if ($user->is_admin) {
                return redirect()->route('admin.users.index');
            } else {
                $request->session()->flash('msg', trans('auth.noaccess'));

                return redirect()->route('admin.login');
            }
        } else {
            $request->session()->flash('msg', trans('messages.login_error'));

            return redirect()->route('admin.login');
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->flash('msg', trans('messages.logout_success'));

        return redirect()->route('admin.login');
    }
}
