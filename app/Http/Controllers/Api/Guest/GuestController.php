<?php

namespace App\Http\Controllers\Api\Guest;

use App\Cast;
use App\Enums\CastOrderStatus;
use App\Enums\CastTransferStatus;
use App\Enums\OrderPaymentMethod;
use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Enums\UserType;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\CastResource;
use App\Jobs\MakeAvatarThumbnail;
use App\Notifications\MessageRequestTransferLineNotify;
use App\Notifications\MessageRequestTransferRocketNotify;
use App\Services\LogService;
use App\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Webpatser\Uuid\Uuid;

class GuestController extends ApiController
{
    public function castHistories(Request $request)
    {
        $rules = [
            'per_page' => 'numeric|min:1',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();

        $casts = Cast::join('cast_order as co', function ($query) {
            $query->on('co.user_id', '=', 'users.id')
                ->where('co.status', '=', CastOrderStatus::DONE);
        })->join('orders as o', function ($query) {
            $query->on('o.id', '=', 'co.order_id')
                ->where('o.status', OrderStatus::DONE);
        })->whereHas('orders', function ($query) use ($user) {
            $query->where('orders.user_id', $user->id)
                ->where('orders.status', OrderStatus::DONE);
        });

        if ($request->nickname) {
            $nickname = $request->nickname;
            $casts = $casts->where('nickname', 'like', "%$nickname%");
        }

        $casts = $casts->groupBy('users.id')
            ->orderByDesc('co.updated_at')
            ->orderByDesc('o.updated_at')
            ->select('users.*')
            ->get();

        $casts = $casts->each->setAppends(['latest_order'])
            ->sortByDesc('latest_order.pivot.updated_at')
            ->values();

        $casts = $this->paginate($casts, $request->per_page ?: 15, $request->page);

        $casts = $casts->map(function ($item) {
            $item->latest_order_flag = true;

            return $item;
        });

        return $this->respondWithData(CastResource::collection($casts));
    }

    public function paginate($items, $perPage = 15, $page = null, $options = [])
    {
        $page = $page ?: (Paginator::resolveCurrentPage() ?: 1);
        $items = $items instanceof Collection ? $items : Collection::make($items);

        return new LengthAwarePaginator($items->forPage($page, $perPage), $items->count(), $perPage, $page, $options);
    }

    public function requestTransfer(Request $request)
    {
        $rules = [
            'fullname' => 'required',
            'date_of_birth' => 'date|before:today|required',
            'job_id' => 'numeric|exists:jobs,id|required',
            'line_qr' => 'image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            'images' => 'array|required|min:2|max:2',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            'prefecture_id' => 'required|numeric|exists:prefectures,id',
            'fullname_kana' => 'required|string|regex:/^[ぁ-ん ]/u',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();

        try {
            \DB::beginTransaction();
            $user->fullname = $request->fullname;
            $user->date_of_birth = Carbon::parse($request->date_of_birth);
            $user->job_id = $request->job_id;
            $user->prefecture_id = $request->prefecture_id;
            $user->fullname_kana = $request->fullname_kana;

            $lineImage = $request->file('line_qr');
            if ($lineImage) {
                $lineImageName = Uuid::generate()->string . '.' . strtolower($lineImage->getClientOriginalExtension());
                Storage::put($lineImageName, file_get_contents($lineImage), 'public');
                $user->line_qr = $lineImageName;
            }

            $images = $request->file('images');
            foreach ($images as $image) {
                $imageName = Uuid::generate()->string . '.' . strtolower($image->getClientOriginalExtension());
                Storage::put($imageName, file_get_contents($image), 'public');
                $input = [
                    'is_default' => false,
                    'path' => $imageName,
                    'thumbnail' => '',
                ];
                $avatar = $user->avatars()->create($input);
                MakeAvatarThumbnail::dispatch($avatar->id);
            }
            $user->type = UserType::CAST;
            $user->cast_transfer_status = CastTransferStatus::PENDING;
            $user->request_transfer_date = Carbon::now();

            $user->save();

            $user->notify(new MessageRequestTransferRocketNotify());
            $user->notify(new MessageRequestTransferLineNotify());

            \DB::commit();
        } catch (\Exception $e) {
            \DB::rollBack();
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }

        return $this->respondWithNoData(trans('messages.request_transfer_cast_succeed'));
    }

    public function getPointUsed()
    {
        $user = $this->guard()->user();

        $orders = $user->orders()->where('payment_method', OrderPaymentMethod::DIRECT_PAYMENT)->where(function ($query) {
            $query->whereIn('status', [OrderStatus::OPEN, OrderStatus::ACTIVE, OrderStatus::PROCESSING])
                ->orWhere(function ($q) {
                    $q->where(function ($sq) {
                        $sq->where('status', OrderStatus::DONE)
                            ->where(function ($sqr) {
                                $sqr->whereNull('payment_status')
                                    ->orWhere('payment_status', '<>', OrderPaymentStatus::PAYMENT_FINISHED);
                            });
                    })
                        ->orWhere(function ($sq) {
                            $sq->where('status', OrderStatus::CANCELED)
                                ->where(function ($sqr) {
                                    $sqr->whereNull('payment_status')
                                        ->orWhere('payment_status', '<>', OrderPaymentStatus::CANCEL_FEE_PAYMENT_FINISHED);
                                });
                        });
                });
        });

        $pointUsed = 0;

        foreach ($orders->cursor() as $order) {
            if (in_array($order->status, [OrderStatus::OPEN, OrderStatus::ACTIVE, OrderStatus::PROCESSING])) {
                $pointUsed += $order->temp_point;
            }

            if (OrderStatus::CANCELED == $order->status) {
                if ($order->cancel_fee_percent) {
                    $pointUsed += ($order->temp_point * $order->cancel_fee_percent) / 100;
                }
            }

            if (OrderStatus::DONE == $order->status) {
                if (!isset($order->total_point)) {
                    $pointUsed += $order->temp_point;
                } else {
                    $pointUsed += $order->total_point - $order->discount_point;
                }
            }
        }

        return $this->respondWithData($pointUsed);
    }
}
