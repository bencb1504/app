<?php

namespace App\Criteria\Order;

use Prettus\Repository\Contracts\CriteriaInterface;
use Prettus\Repository\Contracts\RepositoryInterface;
use Illuminate\Support\Facades\Auth;

/**
 * Class OnlyGuestCriteria.
 *
 * @package namespace App\Criteria\Order;
 */
class OnlyGuestCriteria implements CriteriaInterface
{
    /**
     * Apply criteria in query repository
     *
     * @param string              $model
     * @param RepositoryInterface $repository
     *
     * @return mixed
     */
    public function apply($model, RepositoryInterface $repository)
    {
        $user = Auth::user();

        return $model->where('user_id', $user->id);
    }
}
