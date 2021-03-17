<?php

namespace App\Http\Resources;

use App\Enums\CastTransferStatus;
use App\Enums\CohabitantType;
use App\Enums\DrinkVolumeType;
use App\Enums\SiblingsType;
use App\Enums\SmokingType;
use App\Repositories\BodyTypeRepository;
use App\Repositories\CastClassRepository;
use App\Repositories\JobRepository;
use App\Repositories\PrefectureRepository;
use App\Repositories\SalaryRepository;
use App\Traits\ResourceResponse;
use Illuminate\Http\Resources\Json\Resource;

class CastResource extends Resource
{
    use ResourceResponse;

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request)
    {
        return $this->filterNull([
            'id' => $this->id,
            'facebook_id' => $this->facebook_id,
            'line_id' => $this->line_id,
            'email' => $this->email,
            'nickname' => $this->nickname,
            'fullname' => $this->fullname,
            'fullname_kana' => $this->fullname_kana,
            'phone' => $this->phone,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth,
            'age' => $this->age,
            'height' => $this->height,
            'salary_id' => $this->salary_id,
            'salary' => $this->salary_id ? app(SalaryRepository::class)->find($this->salary_id)->name : '',
            'body_type_id' => $this->body_type_id,
            'body_type' => $this->body_type_id ? app(BodyTypeRepository::class)->find($this->body_type_id)->name : '',
            'prefecture_id' => $this->prefecture_id,
            'prefecture' => $this->prefecture_id ? app(PrefectureRepository::class)->find($this->prefecture_id)->name : '',
            'hometown_id' => $this->hometown_id,
            'hometown' => $this->hometown_id ? app(PrefectureRepository::class)->find($this->hometown_id)->name : '',
            'job_id' => $this->job_id,
            'job' => $this->job_id ? app(JobRepository::class)->find($this->job_id)->name : '',
            'drink_volume_type' => $this->drink_volume_type,
            'drink_volume' => $this->drink_volume_type ? DrinkVolumeType::getDescription($this->drink_volume_type) : '',
            'smoking_type' => $this->smoking_type,
            'smoking' => $this->smoking_type ? SmokingType::getDescription($this->smoking_type) : '',
            'siblings_type' => $this->siblings_type,
            'siblings' => $this->siblings_type ? SiblingsType::getDescription($this->siblings_type) : '',
            'cohabitant_type' => $this->cohabitant_type,
            'cohabitant' => $this->cohabitant_type ? CohabitantType::getDescription($this->cohabitant_type) : '',
            'intro' => $this->intro,
            'intro_updated_at' => $this->intro_updated_at,
            'description' => $this->description,
            'type' => $this->type,
            'status' => $this->status,
            'is_verified' => $this->is_verified,
            'cost' => $this->cost,
            'point' => $this->point,
            'total_point' => $this->total_point + $this->point,
            'avatars' => AvatarResource::collection($this->avatars),
            'working_today' => $this->is_working_today,
            'class_id' => $this->class_id,
            'cost_rate' => $this->cost_rate,
            'class' => $this->class_id ? app(CastClassRepository::class)->find($this->class_id)->name : '',
            'is_favorited' => $this->is_favorited,
            'is_blocked' => $this->is_blocked,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'last_active_at' => $this->last_active_at,
            'last_active' => $this->last_active,
            'is_online' => $this->is_online,
            'rating_score' => $this->rating_score,
            'room_id' => $this->room_id,
            'latest_order' => $this->when(null != $this->latest_order_flag, $this->latest_order),
            'bank_account' => BankAccountResource::make($this->whenLoaded('bankAccount')),
            'cast_order' => $this->whenPivotLoaded('cast_order', function () {
                return CastOrderResource::make($this->pivot);
            }),
            'cast_transfer_status' => ($this->cast_transfer_status) ? $this->cast_transfer_status : CastTransferStatus::OFFICIAL,
            'line_qr' => $this->line_qr,
            'front_id_image' => $this->front_id_image,
            'post_code' => $this->post_code,
            'address' => $this->address,
            'rank' => $this->rank,
            'deleted_at' => $this->deleted_at,
            'is_new_user' => $this->is_new_user,
            'resign_status' => $this->resign_status
        ]);
    }
}
