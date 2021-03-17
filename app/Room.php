<?php

namespace App;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\RoomType;
use App\Order;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Room extends Model
{
    protected $fillable = [
        'owner_id',
        'type',
        'is_active',
        'order_id',
    ];

    protected $guarded = [];

    public function getUnreadCountAttribute()
    {
        if (Auth::check()) {
            return $this->unread(Auth::user()->id)->count();
        }

        return 0;
    }

    public function getIsActiveAttribute($value)
    {
        return $value ? 1 : 0;
    }

    public function getIsSystemAttribute()
    {
        return RoomType::SYSTEM == $this->type;
    }

    public function getIsDirectAttribute()
    {
        return RoomType::DIRECT == $this->type;
    }

    public function getIsGroupAttribute()
    {
        return RoomType::GROUP == $this->type;
    }

    public function checkBlocked($id)
    {
        //containt kiểm tra có tồn tại id trong blockers hay ko.
        return $this->owner->blockers->contains($id) || $this->owner->blocks->contains($id) ? 1 : 0;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDirect($query)
    {
        return $query->where('type', RoomType::DIRECT);
    }

    public function unread($userId)
    {
        return $this->messages()
            ->whereHas('recipients', function ($q) use ($userId) {
                $q->where('user_id', $userId)
                    ->where('is_show', true)
                    ->whereNull('read_at');
            });
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->whereHas('recipients', function ($query) {
            $query->where('is_show', true);
        })->latest();
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class)->withTrashed();
    }

    public function owner()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    public function getRoomOrderAttribute()
    {
        $order = null;

        switch ($this->type) {
            case RoomType::GROUP:
                $order = $this->order;
                break;
            case RoomType::DIRECT:
                $statuses = [
                    OrderStatus::PROCESSING,
                    OrderStatus::ACTIVE,
                    OrderStatus::OPEN,
                    OrderStatus::OPEN_FOR_GUEST,
                ];

                $order = Order::where('room_id', $this->id)
                    ->where(function ($query) {
                        $query->where('type', '!=', OrderType::CALL)
                            ->orWhere(function ($query) {
                                $query->orWhere('type', OrderType::CALL)
                                    ->where('status', '!=', OrderStatus::OPEN);
                            });
                    })
                    ->whereIn('status', $statuses)
                    ->orderByRaw('FIELD(status, ' . implode(',', $statuses) . ' )')
                    ->orderBy('date')
                    ->orderBy('start_time')
                    ->first();

                if (!$order) {
                    $statuses = [
                        OrderStatus::SKIP_NOMINATION,
                        OrderStatus::GUEST_DENIED,
                        OrderStatus::CAST_CANCELED,
                        OrderStatus::DONE,
                    ];

                    $order = Order::where('room_id', $this->id)
                        ->where(function ($query) {
                            $query->where('type', '!=', OrderType::CALL)
                                ->orWhere(function ($query) {
                                    $query->orWhere('type', OrderType::CALL)
                                        ->where('status', '!=', OrderStatus::OPEN);
                                });
                        })
                        ->whereIn('status', $statuses)
                        ->orderByDesc('updated_at')
                        ->first();
                }

                break;
            default:
                break;
        }

        return $order;
    }
}
