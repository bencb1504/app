<?php

namespace App;

use App\Enums\PaymentStatus;
use App\Enums\PointType;
use App\Enums\UserType;
use App\Repositories\CastClassRepository;
use App\Repositories\JobRepository;
use App\Services\LogService;
use App\Verification;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable, SoftDeletes;

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $guarded = ['password_confirmation'];

    protected $fillable = [];

    protected $with = ['avatars'];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function scopeActive($query)
    {
        return $query->where('users.status', true);
    }

    public function getFrontIdImageAttribute($value)
    {
        if (empty($value)) {
            return '';
        }

        if (strpos($value, 'https') !== false) {
            return $value;
        }

        return Storage::url($value);
    }

    public function getAgeAttribute($value)
    {
        if ($this->date_of_birth) {
            return Carbon::parse($this->date_of_birth)->age;
        }
    }

    public function getIsWorkingTodayAttribute()
    {
        $today = Carbon::today();
        $shiftToday = $this->shifts()->where('date', $today)->first();
        if ($shiftToday) {
            if ($shiftToday->pivot->day_shift || $shiftToday->pivot->night_shift) {
                return $this->working_today = 1;
            }

            return $this->working_today = 0;
        } else {
            return 0;
        }
    }

    public function getIsNewUserAttribute($value)
    {
        $sevenDaysAgo = Carbon::now()->subDays(7);

        if (UserType::GUEST == $this->type) {
            if ($this->created_at > $sevenDaysAgo) {
                return true;
            }
        }

        if (UserType::CAST == $this->type) {
            if ($this->accept_request_transfer_date  > $sevenDaysAgo) {
                return true;
            }
        }

        return false;
    }

    public function getPointAttribute($value)
    {
        if (!$value) {
            return 0;
        }

        return $value;
    }

    public function getCostAttribute($value)
    {
        if ($this->class_id && $this->class_id == 1) {
            if ($value != null) {
                return $value;
            } else {
                return 5000;
            }
        } else {
            if (!$value) {
                return 0;
            }
        }

        return $value;
    }

    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d H:i');
    }

    public function getUpdatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d H:i');
    }

    public function getIsAdminAttribute()
    {
        return UserType::ADMIN == $this->type;
    }

    public function getIsCastAttribute()
    {
        return UserType::CAST == $this->type;
    }

    public function getIsGuestAttribute()
    {
        return UserType::GUEST == $this->type;
    }

    public function getIsFavoritedAttribute()
    {
        if (!Auth::check()) {
            return 0;
        }

        $user = Auth::user();

        return $this->favoriters->contains($user->id) ? 1 : 0;
    }

    public function getIsBlockedAttribute()
    {
        if (!Auth::check()) {
            return 0;
        }

        $user = Auth::user();

        return $this->blockers->contains($user->id) ? 1 : 0;
    }

    public function getBlocked($id)
    {
        return $this->blockers->contains($id) || $this->blocks->contains($id) ? 1 : 0;
    }

    public function getLastActiveAttribute()
    {
        return latestOnlineStatus($this->last_active_at);
    }

    public function getIsOnlineAttribute($value)
    {
        $isOnline = Cache::get('is_online_' . $this->id);

        if (!$isOnline) {
            return 0;
        }

        if (now()->diffInMinutes($this->last_active_at) >= 2) {
            return 0;
        }

        return 1;
    }

    public function getRoomIdAttribute()
    {
        if (!Auth::check()) {
            return '';
        }

        $user = Auth::user();

        $room = $this->rooms()->direct()->whereHas('users', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->first();

        if (!$room) {
            return '';
        }

        return $room->id;
    }

    public function getLineQrAttribute($value)
    {
        if (empty($value)) {
            return '';
        }

        if (strpos($value, 'https') !== false) {
            return $value;
        }

        return Storage::url($value);
    }

    public function getIsCardRegisteredAttribute()
    {
        $paymentService = config('common.payment_service');

        $isCardRegistered = false;

        switch ($paymentService) {
            case 'stripe':
                $isCardRegistered = $this->stripe_id && $this->card ? true : false;
                break;

            case 'telecom_credit':
                $isCardRegistered = $this->tc_send_id ? true : false;
                break;

            case 'square':
                $isCardRegistered = $this->square_id && $this->card ? true : false;
                break;

            default:
                $isCardRegistered = false;
                break;
        }

        return $isCardRegistered;
    }

    public function getPaymentIdAttribute()
    {
        $paymentService = config('common.payment_service');
        $paymentId = null;

        switch ($paymentService) {
            case 'stripe':
                $paymentId = $this->stripe_id ?: null;
                break;

            case 'telecom_credit':
                $paymentId = $this->tc_send_id ?: null;
                break;

            case 'square':
                $paymentId = $this->square_id ?: null;
                break;

            default:
                $paymentId = null;
                break;
        }

        return $paymentId;
    }

    public function setPaymentIdAttribute($value)
    {
        $paymentService = config('common.payment_service');

        switch ($paymentService) {
            case 'stripe':
                $this->attributes['stripe_id'] = $value;
                break;

            case 'telecom_credit':
                $this->attributes['tc_send_id'] = $value;
                break;

            case 'square':
                $this->attributes['square_id'] = $value;
                break;

            default:
                break;
        }
    }

    public function getCostRateAttribute()
    {
        if ($this->attributes['class_id']) {
            if (!$this->attributes['cost_rate']) {
                if (in_array($this->attributes['prefecture_id'], [13, 14, 11])) {
                    if ($this->attributes['class_id'] == 1) {
                        return 0.7;
                    }
                }

                return config('common.default_cost_rate')[$this->attributes['class_id']];
            } else {
                return $this->attributes['cost_rate'];
            }
        }
    }

    public function isFavoritedUser($userId)
    {
        return $this->favorites()->pluck('users.id')->contains($userId);
    }

    public function isBlockedUser($userId)
    {
        return $this->blocks()->pluck('users.id')->contains($userId);
    }

    public function buyPoint($amount, $auto = false)
    {
        try {
            $point = new Point;
            $point->point = $amount;
            $point->user_id = $this->id;
            $point->status = false;

            if ($auto) {
                $point->is_autocharge = true;
                $point->type = PointType::AUTO_CHARGE;
            }

            $point->save();

            $payment = $this->createPayment($point);

            // charge money
            $charged = $payment->charge();

            if (!$charged) {
                return false;
            }

            $point->status = true;
            $point->balance = $amount;
            $point->save();

            $this->point = $this->point + $amount;
            $this->save();

            return $point;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function autoCharge($amount)
    {
        return $this->buyPoint($amount, $auto = true);
    }

    protected function createPayment(Point $point)
    {
        $pointRate = config('common.point_rate');
        $payment = new Payment;
        $payment->user_id = $this->id;
        $payment->amount = $point->point * $pointRate;
        $payment->point_id = $point->id;
        $payment->card_id = $this->payment_id;
        $payment->status = PaymentStatus::OPEN;
        $payment->save();

        return $payment;
    }

    public function suspendPayment()
    {
        $this->payment_suspended = true;
        $this->save();
    }

    public function generateVerifyCode($phone, $isResend = false)
    {
        do {
            $code = rand(1000, 9999);
        } while ((strpos($code, '0') !== false) || (strpos($code, '7') !== false));

        $data = [
            'code' => $code,
            'phone' => $phone,
            'is_resend' => $isResend,
        ];

        if ($this->verification) {
            $this->verification()->delete();
        }

        return $this->verification()->create($data);
    }

    public function routeNotificationForTwilio()
    {
        $verification = $this->verification()->first();

        return phone($verification->phone, config('common.phone_number_rule'), 'E164');
    }

    public function notifications()
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }

    public function favorites()
    {
        return $this->belongsToMany(User::class, 'favorites', 'user_id', 'favorited_id')
            ->withPivot('id', 'user_id', 'favorited_id', 'created_at', 'updated_at');
    }

    public function favoriters()
    {
        return $this->belongsToMany(User::class, 'favorites', 'favorited_id', 'user_id')
            ->withPivot('id', 'user_id', 'favorited_id', 'created_at', 'updated_at');
    }

    // ratings by other users
    public function ratings()
    {
        return $this->hasMany(Rating::class, 'rated_id');
    }

    // rated by this user
    public function rates()
    {
        return $this->hasMany(Rating::class);
    }

    public function avatars()
    {
        return $this->hasMany(Avatar::class)
            ->orderBy('is_default', 'desc');
    }

    public function prefecture()
    {
        return $this->belongsTo(Prefecture::class);
    }

    public function hometown()
    {
        return $this->belongsTo(Prefecture::class, 'hometown_id');
    }

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function salary()
    {
        return $this->belongsTo(Salary::class);
    }

    public function bodyType()
    {
        return $this->belongsTo(BodyType::class);
    }

    public function blocks()
    {
        return $this->belongsToMany(User::class, 'blocks', 'user_id', 'blocked_id')
            ->withPivot('id', 'user_id', 'blocked_id', 'created_at', 'updated_at');
    }

    public function blockers()
    {
        return $this->belongsToMany(User::class, 'blocks', 'blocked_id', 'user_id')
            ->withPivot('id', 'user_id', 'blocked_id', 'created_at', 'updated_at');
    }

    public function rooms()
    {
        return $this->belongsToMany(Room::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function reports()
    {
        return $this
            ->belongsToMany(User::class, 'reports', 'user_id', 'reported_id')
            ->withPivot('id', 'user_id', 'reported_id', 'content', 'created_at', 'updated_at');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function card()
    {
        return $this->hasOne(Card::class)->latest();
    }

    public function cards()
    {
        return $this->hasMany(Card::class);
    }

    public function points()
    {
        return $this->hasMany(Point::class)->where('points.status', true);
    }

    public function transfers()
    {
        return $this->hasMany(Transfer::class);
    }

    public function bankAccount()
    {
        return $this->hasOne(BankAccount::class);
    }

    public function verification()
    {
        return $this->hasOne(Verification::class)->latest();
    }

    public function positivePoints($points)
    {
        $totalPoints = $points->sum(function ($point) {
            $sum = 0;
            if ($point->point > 0) {
                $sum += $point['point'];
            }

            return $sum;
        });

        return $totalPoints;
    }

    public function negativePoints($points)
    {
        $totalPoints = $points->sum(function ($point) {
            $sum = 0;
            if ($point->point < 0) {
                $sum += $point['point'];
            }

            return $sum;
        });

        return $totalPoints;
    }

    public function totalBalance($points)
    {
        $totalBalance = $points->sum('balance');

        return $totalBalance;
    }

    public function coupons()
    {
        return $this->belongsToMany('App\Coupon', 'coupon_users', 'user_id','coupon_id')->withTimestamps();
    }

    public function inviteCode()
    {
        return $this->hasOne(InviteCode::class);
    }

    public function inviteCodeHistory()
    {
        return $this->hasOne(InviteCodeHistory::class, 'receive_user_id');
    }

    public function shifts()
    {
        return $this->belongsToMany(Shift::class)
            ->withPivot('day_shift', 'night_shift', 'off_shift')->withTimestamps();
    }

    public function castClass()
    {
        return $this->belongsTo(CastClass::class, 'class_id', 'id');
    }

    public function getClassNameAttribute()
    {
        return  $this->class_id ? app(CastClassRepository::class)->find($this->class_id)->name : '';
    }

    public function getJobNameAttribute()
    {
        return  $this->job_id ? app(JobRepository::class)->find($this->job_id)->name : '';
    }

    public function timelines()
    {
        return $this->hasMany(TimeLine::class);
    }
}
