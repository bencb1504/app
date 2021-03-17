<?php

namespace App\Http\Controllers\Admin\Coupon;

use App\Services\LogService;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Coupon;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(CheckDateRequest $request) {
        $keyword = $request->search;
        $coupons = Coupon::with('users');

        if ($request->has('search')) {
            $coupons->where(function ($query) use ($keyword) {
                $query->where('name', 'like', "%$keyword%");
            });
        }

        if ($request->has('from_date') && !empty($request->from_date)) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $coupons->where(function ($query) use ($fromDate) {
                $query->where('created_at', '>=', $fromDate);
            });
        }

        if ($request->has('to_date') && !empty($request->to_date)) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $coupons->where(function ($query) use ($toDate) {
                $query->where('created_at', '<=', $toDate);
            });
        }

        $coupons = $coupons->orderBy('sort_index')->get();

        return view('admin.coupons.index', compact('coupons'));
    }

    public function create() {
        return view('admin.coupons.create');
    }

    public function store(Request $request) {
        $rules = [
            'name' => 'required|max:255',
            'type' => 'required|numeric|in:1,2,3',
            'point' => 'numeric|required_if:type,1|nullable',
            'time' => 'numeric|min:1|max:9999|required_if:type,2|nullable',
            'percent' => 'numeric|required_if:type,3|nullable',
            'max_point' => 'required_if:type,2|required_if:type,3',
            'note' => 'string|max:500|nullable',
            'is_filter_after_created_date' => 'numeric|nullable',
            'filter_after_created_date' => 'numeric|min:1|max:7|nullable',
            'is_filter_order_duration' => 'numeric|nullable',
            'filter_order_duration' => 'numeric|nullable',
        ];

        $messages = [
            'name.required' => 'クーポン名は、必ず指定してください',
            'name.max' => 'クーポン名には、255以下の数字を指定してください。',
            'type.required' => '適用対象は、必ず指定してください。',
            'type.numeric' => '適用対象には、数字を指定してください。',
            'type.in' => '選択された適用対象は、有効ではありません。',
            'point.numeric' => 'ポイント数には、数字を指定してください。',
            'point.required_if' => 'ポイント数を指定してください',
            'time.numeric' => '時間には、数字を指定してください。',
            'time.required_if' => '時間を指定してください',
            'time.min' => '時間には、1以上の数字を指定してください。',
            'time.max' => '時間には、9999以上の数字を指定してください。',
            'percent.numeric' => 'パーセントには、数字を指定してください。',
            'percent.required_if' => 'パーセントを指定してください',
            'max_point.required_if' => '時間, %Offが指定されている場合、クーポン適用最高上限額も指定してください。',
            'note.string' => '備考には、文字を指定してください。',
            'note.max' => '備考は、500文字以下にしてください。',

        ];

        $validator = validator(request()->all(), $rules, $messages);
        if ($validator->fails()) {
            return back()->withErrors($validator->errors())->withInput();
        }

        $input = request()->only([
            'name',
            'type',
            'point',
            'time',
            'percent',
            'max_point',
            'note',
            'is_filter_after_created_date',
            'filter_after_created_date',
            'is_filter_order_duration',
            'filter_order_duration',
        ]);

        if (isset($input['time'])) {
            $input['time'] = $input['time'] / 60;
        }

        $couponLast = Coupon::orderByDesc('sort_index')->first();
        $input['sort_index'] = $couponLast ? ($couponLast->sort_index + 1) : 1;

        $coupon = new Coupon;
        $coupon = $coupon->create($input);

        if ($coupon) {
            return redirect(route('admin.coupons.index'));
        } else {
            $request->session()->flash('err', trans('messages.server_error'));

            return redirect(route('admin.coupons.create'));
        }
    }

    public function delete(Coupon $coupon)
    {
        $coupon->delete();

        return redirect()->route('admin.coupons.index');
    }

    public function history(Coupon $coupon) {
        $historyCoupons = $coupon->orders()->paginate();

        return view('admin.coupons.history', compact('coupon', 'historyCoupons'));
    }

    public function show(Coupon $coupon) {
        return view('admin.coupons.show', compact('coupon'));
    }

    public function update(Request $request, Coupon $coupon)
    {
        $rules = [
            'name' => 'string|max:255',
            'type' => 'numeric|in:1,2,3',
            'point' => 'numeric|required_if:type,1|nullable',
            'time' => 'numeric|max:9999|required_if:type,2|nullable',
            'percent' => 'numeric|required_if:type,3|nullable',
            'max_point' => 'required_if:type,2|required_if:type,3',
            'note' => 'string|max:500|nullable',
            'is_filter_after_created_date' => 'numeric|nullable',
            'filter_after_created_date' => 'numeric|required_if:is_filter_after_created_date,1|nullable',
            'is_filter_order_duration' => 'numeric|nullable',
            'filter_order_duration' => 'numeric|required_if:is_filter_order_duration,1|nullable',
        ];

        $messages = [
            'name.max' => 'クーポン名には、255以下の数字を指定してください。',
            'type.numeric' => '適用対象には、数字を指定してください。',
            'type.in' => '選択された適用対象は、有効ではありません。',
            'point.numeric' => 'ポイント数には、数字を指定してください。',
            'point.required_if' => 'ポイント数を指定してください',
            'time.numeric' => '時間には、数字を指定してください。',
            'time.max' => '時間には、9999以上の数字を指定してください。',
            'time.required_if' => '時間を指定してください',
            'percent.numeric' => '%Offには、数字を指定してください。',
            'percent.required_if' => 'パーセントを指定してください',
            'max_point.required_if' => '時間, %Offが指定されている場合、クーポン適用最高上限額も指定してください。',
            'note.string' => '備考には、文字を指定してください。',
            'note.max' => '備考は、500文字以下にしてください。',

        ];

        $validator = validator(request()->all(), $rules, $messages);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors())->withInput();
        }
        $input = request()->only([
            'name',
            'type',
            'point',
            'time',
            'percent',
            'max_point',
            'note',
            'is_filter_after_created_date',
            'filter_after_created_date',
            'is_filter_order_duration',
            'filter_order_duration',
        ]);

        if (!isset($input['is_filter_after_created_date'])) {
            $input['is_filter_after_created_date'] = 0;
        }

        if (!isset($input['is_filter_order_duration'])) {
            $input['is_filter_order_duration'] = 0;
        }

        try {
            if (isset($input['time'])) {
                $input['time'] = $input['time'] / 60;
            }

            $coupon->update($input);

            return redirect()->route('admin.coupons.index');

        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            $request->session()->flash('err', trans('messages.server_error'));

            return redirect()->route('admin.coupons.show', compact('coupon'));
        }
    }

    public function updateSortIndex(Request $request)
    {
        try {
            $coupons = Coupon::getModel()->getTable();

            $ids = [];
            $cases = [];
            $params = [];

            $couponIds = $request->couponIds;

            foreach ($couponIds as $key => $couponId) {
                $id = (int) $couponId;
                $ids[] = $id;
                $cases[] = "WHEN {$id} then ?";
                $params[] = $key + 1;
            }

            $ids = implode(',', $ids);
            $cases = implode(' ', $cases);
            $params[] = Carbon::now();

            DB::update("UPDATE `{$coupons}` SET `sort_index` = CASE `id` {$cases} END, `updated_at` = ? WHERE `id` in ({$ids})", $params);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            $request->session()->flash('msg', trans('messages.server_error'));
        }

    }

    public function updateIsActive(Request $request)
    {
        try {
            $couponId = $request->couponId;
            $coupon = Coupon::findOrFail($couponId);

            $coupon->is_active = !$coupon->is_active;
            $coupon->update();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            $request->session()->flash('msg', trans('messages.server_error'));
        }
    }
}
