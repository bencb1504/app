<?php

namespace App\Http\Controllers\Admin\User;

use App\Cast;
use App\Enums\CastOrderStatus;
use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\ResignStatus;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Notifications\FrozenUser;
use App\Prefecture;
use App\Repositories\CastClassRepository;
use App\User;
use App\Services\LogService;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use App\Traits\DeleteUser;

class UserController extends Controller
{
    use DeleteUser;
    protected $castClass;

    public function __construct()
    {
        $this->castClass = app(CastClassRepository::class);
    }

    public function index(CheckDateRequest $request)
    {
        $orderBy = $request->only('id', 'status', 'last_active_at');
        $keyword = $request->search;

        $users = User::withTrashed()->where(function($query) {
            $query->where('resign_status', ResignStatus::APPROVED)
                ->orWhere(function($sq) {
                    $sq->where('type', '<>', UserType::ADMIN)->where('deleted_at', null);
                });
        });

        if ($request->has('from_date') && !empty($request->from_date)) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $users->where(function ($query) use ($fromDate) {
                $query->where('created_at', '>=', $fromDate);
            });
        }

        if ($request->has('to_date') && !empty($request->to_date)) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $users->where(function ($query) use ($toDate) {
                $query->where('created_at', '<=', $toDate);
            });
        }

        if ($request->has('search')) {
            $users->where(function ($query) use ($keyword) {
                $query->where('id', "$keyword")
                    ->orWhere('nickname', 'like', "%$keyword%");
            });
        }

        if (!empty($orderBy)) {
            foreach ($orderBy as $key => $value) {
                $users->orderBy($key, $value);
            }
        } else {
            $users->orderBy('last_active_at', 'DESC');
        }

        $users = $users->paginate($request->limit ?: 10);

        return view('admin.users.index', compact('users'));
    }

    public function show($user)
    {
        $user = User::withTrashed()->find($user);

        $prefectures = Prefecture::supported()->get();

        $castClasses = $this->castClass->all();

        $editableCostRates = config('common.editable_cost_rate');

        return view('admin.users.show', compact('user', 'castClasses', 'prefectures', 'editableCostRates'));
    }

    public function changeActive(User $user)
    {
        $user->status = !$user->status;

        $user->save();

        if ($user->status == 0) {
            $user->notify(new FrozenUser());
        }

        return redirect()->route('admin.users.show', ['user' => $user->id]);
    }

    public function changeCastClass(User $user, Request $request)
    {
        $newClass = $this->castClass->find($request->cast_class);

        $user->class_id = $newClass->id;
        $user->cost = $newClass->cost;
        $user->cost_rate = $request->input_cost_rate;

        $user->save();

        return redirect()->route('admin.users.show', ['user' => $user->id]);
    }

    public function changePrefecture(User $user, Request $request)
    {
        $newPrefecture = Prefecture::find($request->prefecture);

        if ($newPrefecture) {
            $user->prefecture_id = $newPrefecture->id;
            $user->save();
        }

        return redirect()->route('admin.users.show', ['user' => $user->id]);
    }

    public function changeCost(User $user, Request $request)
    {
        $user->cost = $request->cast_cost;
        $user->save();

        return redirect()->route('admin.users.show', ['user' => $user->id]);
    }

    public function registerGuest(User $user)
    {
        $user->type = UserType::GUEST;
        $user->cast_transfer_status = null;
        $user->is_guest_active = true;
        $user->save();

        return redirect(route('admin.users.show', ['user' => $user->id]));
    }

    public function changeRank(User $user, Request $request)
    {
        $user->rank = $request->cast_rank;
        $user->save();

        return redirect()->route('admin.users.show', ['user' => $user->id]);
    }

    public function delete($id)
    {
        $user = User::findOrFail($id);

        if ($user->type == UserType::CAST) {

            $user = Cast::findOrFail($id);

            $isUnpaidOrder = $user->orders()->whereIn('orders.status', [
                OrderStatus::ACTIVE,
                OrderStatus::PROCESSING,
            ])
                ->orWhere(function ($q) use ($user) {
                    $q->where('cast_order.user_id', $user->id)
                        ->where('orders.type', OrderType::NOMINATION)
                        ->whereIn('orders.status', [
                            OrderStatus::ACTIVE,
                            OrderStatus::PROCESSING,
                        ]);
                })
                ->where(function ($q) use ($user) {
                    $q->where('cast_order.user_id', $user->id)
                        ->where([
                            ['orders.type', '<>', OrderType::NOMINATION],
                            ['orders.status', '=', OrderStatus::OPEN],
                            ['cast_order.status', '=', CastOrderStatus::ACCEPTED],
                        ]);
                })
                ->orWhere(function ($query) use ($user) {
                    $query->where('cast_order.user_id', $user->id)->where('orders.status', OrderStatus::DONE)
                        ->where(function ($subQuery) {
                            $subQuery->whereNull('orders.payment_status')
                                ->orWhere(function($s) {
                                    $s->where('orders.payment_status', '!=', OrderPaymentStatus::PAYMENT_FINISHED)
                                        ->orWhere('orders.payment_status', OrderPaymentStatus::PAYMENT_FAILED);
                                });
                        });
                })
                ->orWhere(function ($query) use ($user) {
                    $query->where('cast_order.user_id', $user->id)->where('orders.status', OrderStatus::CANCELED)
                        ->where(function ($subQuery) {
                            $subQuery->where(function($sQ) {
                                $sQ->where('orders.payment_status', null)
                                    ->orWhere('orders.payment_status', '<>', OrderPaymentStatus::CANCEL_FEE_PAYMENT_FINISHED);
                            })->where('orders.cancel_fee_percent', '>', 0);
                        });

                })
                ->exists();
        } else {
            $isUnpaidOrder = $user->orders()->whereIn('status', [
                OrderStatus::OPEN,
                OrderStatus::ACTIVE,
                OrderStatus::PROCESSING,
            ])
                ->orWhere(function ($query) use ($user) {
                    $query->where('user_id', $user->id)->where('status', OrderStatus::DONE)
                        ->where(function ($subQuery) {
                            $subQuery->whereNull('payment_status')
                                ->orWhere(function($s) {
                                    $s->where('payment_status', '!=', OrderPaymentStatus::PAYMENT_FINISHED)
                                        ->orWhere('payment_status', OrderPaymentStatus::PAYMENT_FAILED);
                                });
                        });
                })
                ->orWhere(function ($query) use ($user) {
                    $query->where('user_id', $user->id)->where('status', OrderStatus::CANCELED)
                        ->where(function ($subQuery) {
                            $subQuery->where(function($sQ) {
                                $sQ->where('payment_status', null)
                                    ->orWhere('payment_status', '<>', OrderPaymentStatus::CANCEL_FEE_PAYMENT_FINISHED);
                            })->where('cancel_fee_percent', '>', 0);
                        });

                })
                ->exists();
        }

        if ($isUnpaidOrder) {
            return redirect()->route('admin.users.show', compact('id'))->with('error', trans('messages.can_not_be_resign'));
        }

        try {
            DB::beginTransaction();
            $this->deleteUser($user);
            DB::commit();

            return redirect()->route('admin.users.index');

        } catch (\Exception $e) {
            DB::rollBack();
            LogService::writeErrorLog($e);
        }
    }

    public function campaignParticipated(User $user)
    {
        $user->campaign_participated = true;
        $user->save();

        return redirect(route('admin.users.show', ['user' => $user->id]));
    }

    public function changePaymentMethod(User $user)
    {
        $user->is_multi_payment_method = !$user->is_multi_payment_method;

        $user->save();

        return redirect(route('admin.users.show', ['user' => $user->id]));
    }
}
