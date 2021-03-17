<?php

namespace App\Http\Controllers\Admin\Cast;

use DB;
use App\Cast;
use App\Room;
use App\User;
use App\Shift;
use App\CastClass;
use Carbon\Carbon;
use App\Prefecture;
use App\BankAccount;
use App\Enums\Status;
use App\Enums\UserType;
use App\Enums\PointType;
use Webpatser\Uuid\Uuid;
use App\Enums\ProviderType;
use App\Enums\ResignStatus;
use App\Services\CSVExport;
use App\Services\LogService;
use Illuminate\Http\Request;
use App\Enums\BankAccountType;
use Illuminate\Validation\Rule;
use App\Enums\CastTransferStatus;
use App\Notifications\CreateCast;
use App\Enums\PointCorrectionType;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\CheckDateRequest;
use Illuminate\Support\Facades\Storage;

class CastController extends Controller
{
    public function index(CheckDateRequest $request)
    {
        $keyword = $request->search;
        $isSchedule = $request->is_schedule;
        $orderBy = $request->only('last_active_at', 'rank', 'class_id');
        $casts = User::withTrashed()->where('type', UserType::CAST)->where(function($query) {
            $query->whereNull('cast_transfer_status')
                ->orWhere('cast_transfer_status', CastTransferStatus::APPROVED)
                ->orWhere('cast_transfer_status', CastTransferStatus::OFFICIAL);
        });

        $casts = $casts->where(function($query) {
            $query->where('resign_status', ResignStatus::APPROVED)
                ->orWhere(function($sq) {
                    $sq->where('deleted_at', null);
                });
        });

        $fromDate = $request->from_date ? Carbon::parse($request->from_date)->startOfDay() : null;
        $toDate = $request->to_date ? Carbon::parse($request->to_date)->endOfDay() : null;

        switch ($isSchedule) {
            case 'date':
                if ($fromDate) {
                    $casts->where(function ($query) use ($fromDate) {
                        $query->where('created_at', '>=', $fromDate);
                    });
                }

                if ($toDate) {
                    $casts->where(function ($query) use ($toDate) {
                        $query->where('created_at', '<=', $toDate);
                    });
                }
                break;

            case 'schedule':
                $casts->whereHas('shifts', function ($query) use ($fromDate, $toDate) {
                    if ($fromDate) {
                        $query->where(function($q) use ($fromDate) {
                            $q->where('date', '>=', $fromDate)
                                ->where(function ($sq) {
                                    $sq->where('day_shift', true)->orWhere('night_shift', true);
                                });
                        });
                    }

                    if ($toDate) {
                        $query->where(function ($q) use ($toDate) {
                            $q->where('date', '<=', $toDate)
                                ->where(function ($sq) {
                                    $sq->where('day_shift', true)->orWhere('night_shift', true);
                                });
                        });
                    }
                });
                break;

            default:break;
        }

        if ($keyword) {
            $casts->where(function ($query) use ($keyword) {
                $query->where('id', "$keyword")
                    ->orWhere('nickname', 'like', "%$keyword%")
                    ->orWhereHas('castClass', function ($sq) use ($keyword) {
                        $sq->where('name', 'like', "%$keyword%");
                    });
            });
        }

        if (!empty($orderBy)) {
            foreach ($orderBy as $key => $value) {
                $casts->orderBy($key, $value);
            }
        } else {
            $casts->orderBy('last_active_at', 'DESC');
        }

        $casts = $casts->paginate($request->limit ?: 10);

        return view('admin.casts.index', compact('casts'));
    }

    public function registerCast(User $user)
    {
        $castClass = CastClass::all();
        $prefectures = Prefecture::supported()->get();

        return view('admin.casts.register', compact('user', 'castClass', 'prefectures'));
    }

    public function validRegister($request, $user)
    {
        $this->validate($request,
            [
                'last_name' => 'required',
                'first_name' => 'required',
                'last_name_kana' => 'required|string|regex:/^[ぁ-ん ]/u',
                'first_name_kana' => 'required|string|regex:/^[ぁ-ん ]/u',
                'nick_name' => 'required',
                'phone' => [
                    'required',
                    'bail',
                    'regex:/^[0-9]+$/',
                    'digits_between:10,13',
                    Rule::unique('users', 'phone')
                        ->whereNull('deleted_at')
                        ->ignore($user->id)
                ],
                'line' => 'required',
                'number' => 'nullable|numeric|digits:7',
                'front_side' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
                'back_side' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            ],
            [
                'phone.unique' => 'この電話番号はすでに別のアカウントで使用されています。',
            ]
        );

        $year = $request->start_year;
        $month = $request->start_month;
        $date = $request->start_date;
        if (!checkdate($month, $date, $year)) {
            return false;
        }
        $age = Carbon::createFromDate($year, $month, $date)->age;

        $data = [
            'lastname' => $request->last_name,
            'firstname' => $request->first_name,
            'fullname' => $request->last_name . $request->first_name,
            'lastname_kana' => $request->last_name_kana,
            'firstname_kana' => $request->first_name_kana,
            'fullname_kana' => $request->last_name_kana . $request->first_name_kana,
            'nickname' => $request->nick_name,
            'phone' => $request->phone,
            'line_id' => $request->line,
            'note' => $request->note,
            'gender' => $request->gender,
            'class_id' => $request->cast_class,
            'year' => $year,
            'month' => $month,
            'date' => $date,
            'age' => $age,
            'prefecture_id' => $request->prefecture,
            'rank' => $request->cast_rank,
        ];

        if ($request->bank_name && $request->number && $request->branch_name) {
            $data['branch_name'] = $request->branch_name;
            $data['bank_name'] = $request->bank_name;
            $data['number'] = $request->number;
        }

        $frontImage = request()->file('front_side');
        $backImage = request()->file('back_side');

        $frontImageName = Uuid::generate()->string . '.' . strtolower($frontImage->getClientOriginalExtension());
        $backImageName = Uuid::generate()->string . '.' . strtolower($backImage->getClientOriginalExtension());

        $frontFileUploaded = Storage::put($frontImageName, file_get_contents($frontImage), 'public');
        $backFileUploaded = Storage::put($backImageName, file_get_contents($backImage), 'public');

        if ($frontFileUploaded && $backFileUploaded) {
            $data['front_id_image'] = $frontImageName;
            $data['back_id_image'] = $backImageName;
        }

        return $data;
    }

    public function confirmRegister(Request $request, User $user)
    {
        $data = $this->validRegister($request, $user);

        if (!$data) {
            $request->session()->flash('msgdate', trans('messages.date_not_valid'));

            return redirect()->route('admin.casts.register', compact('user'));
        }

        return view('admin.casts.confirm', compact('data', 'user'));
    }

    public function saveCast(Request $request, User $user)
    {
        $castClass = CastClass::where('id', $request->class_id)->first();

        $year = $request->year;
        $month = $request->month;
        $date = $request->date;

        $data = [
            'lastname' => $request->lastname,
            'firstname' => $request->firstname,
            'fullname' => $request->lastname . $request->firstname,
            'lastname_kana' => $request->lastname_kana,
            'firstname_kana' => $request->firstname_kana,
            'fullname_kana' => $request->lastname_kana . $request->firstname_kana,
            'nickname' => $request->nickname,
            'phone' => $request->phone,
            'line_id' => $request->line_id,
            'note' => $request->note,
            'gender' => $request->gender,
            'class_id' => $request->class_id,
            'front_id_image' => $request->front_id_image,
            'back_id_image' => $request->back_id_image,
            'cost' => $castClass->cost,
            'date_of_birth' => $year . '-' . $month . '-' . $date,
            'type' => UserType::CAST,
            'prefecture_id' => $request->prefecture,
            'rank' => $request->cast_rank,
            'accept_request_transfer_date' => now(),
            'cast_transfer_status' => CastTransferStatus::OFFICIAL
        ];

        $user->update($data);

        if (isset($request->bank_name)) {
            BankAccount::create([
                'user_id' => $user->id,
                'bank_name' => $request->bank_name,
                'branch_name' => $request->branch_name,
                'number' => $request->number,
            ]);
        }

        if (count($user->shifts)) {
            $castLatestShift = $user->shifts()->orderBy('id', 'desc')->first();
            $castShiftDate = Carbon::parse($castLatestShift->date);
            $shifts = Shift::whereDate('date', '>', $castShiftDate)->pluck('id');

            if (count($shifts)) {
                $user->shifts()->attach($shifts);
            }
        } else {
            $now = now()->startOfDay();
            $shifts = Shift::whereDate('date', '>=', $now)->pluck('id');
            $user->shifts()->attach($shifts);
        }

        $user->notify(new CreateCast());

        return redirect()->route('admin.casts.index');
    }

    public function sumPointReceive($points)
    {
        return $points->sum(function ($product) {
            $sum = 0;
            if ($product->is_receive) {
                $sum += $product->point;
            }

            return $sum;
        });
    }

    public function sumConsumedPoint($points)
    {
        return $points->sum(function ($product) {
            $sum = 0;
            if ($product->is_transfer) {
                $sum += $product->point;
            }

            if ($product->is_adjusted && $product->point < 0) {
                $sum += -$product->point;
            }

            return $sum;
        });
    }

    public function getOperationHistory($castId, CheckDateRequest $request)
    {
        $keyword = $request->search_point_type;
        $pointTypes = [
            0 => '全て', // all
            PointType::ADJUSTED => '調整',
            PointType::RECEIVE => 'ポイント受取',
            PointType::TRANSFER => '振込',
        ];

        $pointCorrectionTypes = [
            PointCorrectionType::ACQUISITION => '取得ポイント',
            PointCorrectionType::CONSUMPTION => '消費ポイント',
        ];

        $with['order'] = function ($query) {
            return $query->withTrashed();
        };

        $user = User::withTrashed()->find($castId);

        $points = $user->points()->with($with)
            ->where(function ($query) {
                $query->whereIn('type',
                    [
                        PointType::RECEIVE,
                        PointType::TRANSFER,
                    ])
                    ->orWhere(function ($subQ) {
                        $subQ->where('type', PointType::ADJUSTED)
                            ->where('is_cast_adjusted', true);
                    });
                })
            ->where('status', Status::ACTIVE);

        $fromDate = $request->from_date ? Carbon::parse($request->from_date)->startOfDay() : null;
        $toDate = $request->to_date ? Carbon::parse($request->to_date)->endOfDay() : null;

        if ($fromDate) {
            $points->where(function ($query) use ($fromDate) {
                $query->where('created_at', '>=', $fromDate);
            });
        }

        if ($toDate) {
            $points->where(function ($query) use ($toDate) {
                $query->where('created_at', '<=', $toDate);
            });
        }

        if ($keyword) {
            if ('0' != $keyword) {
                $points->where(function ($query) use ($keyword) {
                    $query->where('type', $keyword);
                });
            }
        }

        $points = $points->orderBy('created_at', 'DESC');
        $pointsExport = $points->get();
        $points = $points->paginate($request->limit ?: 10);

        $sumPointReceive = $this->sumPointReceive($pointsExport);
        $sumConsumedPoint = -$this->sumConsumedPoint($pointsExport);
        $sumBalance = $sumPointReceive - $sumConsumedPoint;

        $sumDebitAmount = $points->sum(function ($product) {
            $sum = 0;
            if ($product->is_transfer && $product->point < 0) {
                $sum += $product->point;
            }

            return $sum;
        });

        if ('export' == $request->submit) {
            $data = collect($pointsExport)->map(function ($item) {
                return [
                    Carbon::parse($item->created_at)->format('Y年m月d日'),
                    PointType::getDescription($item->type),
                    ($item->is_receive) ? $item->order->id : '--',
                    ($item->is_receive || ($item->is_adjusted && $item->point > 0)) ? number_format($item->point) : '',
                    (($item->is_transfer) || ($item->is_adjusted && $item->point < 0)) ? number_format($item->point) : '',
                    number_format($item->balance),
                    ($item->is_transfer) ? '￥' . number_format(abs($item->point)) : '',
                ];
            })->toArray();

            $sum = [
                '合計',
                '-',
                '-',
                $sumPointReceive,
                $sumConsumedPoint,
                $sumBalance,
                '¥' . number_format(abs($sumDebitAmount)),
            ];

            array_push($data, $sum);

            $header = [
                '日付',
                '取引種別',
                '予約ID',
                '取得ポイント',
                '消費ポイント',
                '残高',
                '引き落とし額',
            ];

            try {
                $file = CSVExport::toCSV($data, $header);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);
                $request->session()->flash('msg', trans('messages.server_error'));

                return redirect()->route('admin.casts.operation_history', compact('user'));
            }
            $file->output('operation_history_point_of_cast_' . $user->fullname . '_' . Carbon::now()->format('Ymd_Hi') . '.csv');

            return;
        }

        return view('admin.casts.operation_history', compact('user', 'points', 'pointTypes',
            'sumPointReceive', 'sumConsumedPoint', 'sumBalance', 'sumDebitAmount', 'pointCorrectionTypes')
        );
    }

    public function changePoint(Request $request, Cast $user)
    {
        $rules = [
            'point' => 'regex:/^[0-9]+$/',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()->all()], 400);
        }

        switch ($request->correction_type) {
            case PointCorrectionType::ACQUISITION:
                $point = $request->point;
                break;
            case PointCorrectionType::CONSUMPTION:
                $point = -$request->point;
                break;

            default:break;
        }

        $newPoint = $user->point + $point;
        $balance = ($point < 0) ? $newPoint : $point;

        $input = [
            'point' => $point,
            'balance' => $balance,
            'type' => PointType::ADJUSTED,
            'status' => Status::ACTIVE,
            'is_cast_adjusted' => true,
        ];

        try {
            DB::beginTransaction();

            $user->points()->create($input);

            $user->point = $newPoint;
            $user->save();

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            LogService::writeErrorLog($e);
            $request->session()->flash('msg', trans('messages.server_error'));
        }

        return response()->json(['success' => true]);
    }

    public function changeStatusWork(Cast $user)
    {
        try {
            $today = Carbon::today();
            $user->working_today = !$user->working_today;
            $shiftToday = $user->shifts()->where('date', $today)->first();
            if ($user->working_today) {
                $shiftToday->pivot->day_shift = $user->working_today;
                $shiftToday->pivot->off_shift = false;
                $shiftToday->pivot->save();
            } else {
                $shiftToday->pivot->day_shift = $user->working_today;
                $shiftToday->pivot->night_shift = $user->working_today;
                $shiftToday->pivot->off_shift = true;
                $shiftToday->pivot->save();
            }

            $user->update();

            return back();
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
        }
    }

    public function create()
    {
        $castClass = CastClass::all();
        $prefectures = Prefecture::supported()->get();

        return view('admin.casts.create', compact('castClass', 'prefectures'));
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $maxYear = Carbon::parse(now())->subYear(52)->format('Y');
            $minYear = Carbon::parse(now())->subYear(20)->format('Y');

            $rules = [
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6',
                'gender' => 'required',
                'lastname' => 'required|string',
                'firstname' => 'required|string',
                'lastname_kana' => 'required|string|regex:/^[ぁ-ん ]/u',
                'firstname_kana' => 'required|string|regex:/^[ぁ-ん ]/u',
                'nickname' => 'required|string|max:20',
                'phone' => [
                    'required',
                    'bail',
                    'regex:/^[0-9]+$/',
                    'digits_between:10,13',
                    Rule::unique('users', 'phone')
                        ->whereNull('deleted_at')
                ],
                'line_id' => 'required|string',
                'front_side' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
                'back_side' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
                'date_of_birth' => 'required|date|after:'. $maxYear.'|before:'.$minYear,
                'account_number' => 'nullable|numeric|digits:7|required_with:bank_name,branch_name',
                'bank_name' => 'required_with:branch_name,account_number',
                'branch_name' => 'required_with:bank_name,account_number',
            ];

            $messages = [
                'phone.unique' => 'この電話番号はすでに別のアカウントで使用されています。',
            ];
    
            $validator = validator(request()->all(), $rules, $messages);

            if ($validator->fails()) {
                return back()->withErrors($validator->errors())->withInput();
            }

            $castClass = CastClass::where('id', $request->class_id)->first();

            $year = $request->year;
            $month = $request->month;
            $date = $request->date;

            $input = [
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'lastname' => $request->lastname,
                'firstname' => $request->firstname,
                'fullname' => $request->lastname . $request->firstname,
                'lastname_kana' => $request->lastname_kana,
                'firstname_kana' => $request->firstname_kana,
                'fullname_kana' => $request->lastname_kana . $request->firstname_kana,
                'nickname' => $request->nickname,
                'phone' => $request->phone,
                'line_id' => $request->line_id,
                'note' => $request->note,
                'gender' => $request->gender,
                'class_id' => $request->class_id,
                'front_id_image' => $request->front_id_image,
                'back_id_image' => $request->back_id_image,
                'cost' => $castClass->cost,
                'date_of_birth' => $year . '-' . $month . '-' . $date,
                'type' => UserType::CAST,
                'prefecture_id' => $request->prefecture,
                'rank' => $request->cast_rank,
                'provider' => ProviderType::EMAIL,
            ];

            $frontImage = request()->file('front_side');
            $backImage = request()->file('back_side');

            $frontImageName = Uuid::generate()->string . '.' . strtolower($frontImage->getClientOriginalExtension());
            $backImageName = Uuid::generate()->string . '.' . strtolower($backImage->getClientOriginalExtension());

            $frontFileUploaded = Storage::put($frontImageName, file_get_contents($frontImage), 'public');
            $backFileUploaded = Storage::put($backImageName, file_get_contents($backImage), 'public');

            if ($frontFileUploaded && $backFileUploaded) {
                $input['front_id_image'] = $frontImageName;
                $input['back_id_image'] = $backImageName;
            }

            $user = new Cast;
            $user = $user->create($input);

            if ($request->bank_name && $request->branch_name && $request->account_number) {
                BankAccount::create([
                    'user_id' => $user->id,
                    'bank_name' => $request->bank_name,
                    'branch_name' => $request->branch_name,
                    'number' => $request->account_number,
                ]);
            }

            $room = Room::create([
                'owner_id' => $user->id
            ]);

            $room->users()->attach([1, $user->id]);
            $user->notify(new CreateCast());

            DB::commit();

            return redirect()->route('admin.casts.index');
        } catch (\Exception $e) {
            DB::rollBack();
            LogService::writeErrorLog($e);

            return back();
        }
    }

    public function exportBankAccounts(Request $request)
    {
        $bankAccounts = BankAccount::all();

        $data = collect($bankAccounts)->map(function ($item) {
            return [
                $item->id,
                $item->user_id,
                $item->bank_name,
                $item->bank_code,
                $item->branch_name,
                $item->branch_code,
                $item->number,
                $item->holder_name,
                $item->holder_type,
                BankAccountType::getDescription($item->type),
                Carbon::parse($item->created_at)->format('Y年m月d日'),
                Carbon::parse($item->updated_at)->format('Y年m月d日'),
            ];
        })->toArray();

        $header = [
            'No.',
            'User ID',
            'Bank Name',
            'Bank Code',
            'Branch Name',
            'Branch Code',
            'Number',
            'Holder Name',
            'Holder Type',
            'Type',
            'Create At',
            'Updated At',
        ];

        try {
            $file = CSVExport::toCSV($data, $header);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            $request->session()->flash('msg', trans('messages.server_error'));

            return redirect()->route('admin.casts.index');
        }

        $file->output('bank_accounts_' . Carbon::now()->format('Ymd_Hi') . '.csv');

        return;
    }

    public function bankAccount($user)
    {
        $user = User::withTrashed()->find($user);
        $bankAccount = BankAccount::where('user_id', $user->id)->first();

        return view('admin.casts.bank_account', compact('user', 'bankAccount'));
    }

    public function updateNote(Request $request, Cast $user)
    {
        try {
            $user->note = $request->note;
            $user->save();

            return redirect()->route('admin.users.show', compact('user'));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
        }
    }

    public function updateCostRate(User $user, Request $request)
    {
        $user->cost_rate = $request->cost_rate;
        $user->save();

        return redirect()->route('admin.users.show', ['user' => $user->id]);
    }
}
