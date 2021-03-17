<?php

namespace App\Http\Controllers;

use Auth;
use GuzzleHttp\Client;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    public function index()
    {
        if (\Session()->has('backUrl')) {
            \Session()->forget('backUrl');
        }

        $user = Auth::user();
        $bankAccount = $user->bankAccount;
        if ($bankAccount) {
            return view('web.bank_account.index', compact('bankAccount'));
        } else {
            return view('web.bank_account.create');
        }
    }

    public function edit()
    {
        $user = Auth::user();
        $bankAccount = $user->bankAccount;
        return view('web.bank_account.edit', compact('bankAccount'));
    }

    public function searchBankName(Request $request)
    {
        $backUrl = \URL::previous();
        $urlEdit = route('cast_mypage.bank_account.edit');

        if ($backUrl == $urlEdit) {
            $request->session()->put('backUrl', $backUrl);
        }

        return view('web.bank_account.bank_name');
    }

    public function bankName(Request $request)
    {
        $prevUrl = $request->back_url;
        $bankName = $request->bank_name;
        $infoBank = [
            'bank_code' => $request->bank_code,
            'bank_name' => $request->bank_name,
            'branch_code' => $request->branch_code,
            'branch_name' => $request->branch_name,
        ];

        if (preg_match('/[\'^£$%&*()}{@#~?><>,|=_+¬-]/', $bankName)) {
            $listResult = collect();
        } else {
            $client = new \GuzzleHttp\Client();
            $res = $client->request('GET', "https://bankcode-api.appspot.com/api/bank/JP?name=$bankName");
            $listResult = collect(json_decode($res->getBody()->getContents())->data);
        }

        return view('web.bank_account.bank_name', compact('listResult', 'infoBank', 'prevUrl'));
    }

    public function searchBranchBankName(Request $request)
    {
        $backUrl = \URL::previous();
        $urlEdit = route('cast_mypage.bank_account.edit');

        if ($backUrl == $urlEdit) {
            $request->session()->put('backUrl', $backUrl);
        }

        return view('web.bank_account.branch_bank_name');
    }

    public function branchBankName(Request $request)
    {
        $prevUrl = $request->back_url;
        $branchName = $request->branch_name;
        $bankCode = $request->bank_code;

        if (empty($bankCode) && Auth::user()->bankAccount) {
            $bankCode = Auth::user()->bankAccount->bank_code;
        }

        $infoBank = [
            'bank_code' => $request->bank_code,
            'bank_name' => $request->bank_name,
            'branch_code' => $request->branch_code,
            'branch_name' => $request->branch_name,
        ];

        if (preg_match('/[\'^£$%&*()}{@#~?><>,|=_+¬-]/', $branchName) || (!$bankCode)) {
            $listResult = collect();
        } else {
            $client = new \GuzzleHttp\Client();
            $res = $client->request('GET', "https://bankcode-api.appspot.com/api/bank/JP/$bankCode?name=$branchName");
            $listResult = collect(json_decode($res->getBody()->getContents())->data);
        }

        return view('web.bank_account.branch_bank_name', compact('listResult', 'infoBank', 'prevUrl'));
    }
}
