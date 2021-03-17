<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckDateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'from_date' => 'nullable|date_format:Y/m/d',
            'to_date' => 'nullable|date_format:Y/m/d',
        ];
    }

    public function messages()
    {
        return [
            'from_date.date_format' => "From dateの形式は、'Y/m/d'と合いません。",
            'to_date.date_format' => "To dateの形式は、'Y/m/d'と合いません。",
        ];
    }
}
