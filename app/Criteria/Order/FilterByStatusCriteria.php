<?php

namespace App\Criteria\Order;

use App\Enums\OrderStatus;
use Prettus\Repository\Contracts\CriteriaInterface;
use Prettus\Repository\Contracts\RepositoryInterface;

/**
 * Class FilterByStatusCriteria.
 *
 * @package namespace App\Criteria\Order;
 */
class FilterByStatusCriteria implements CriteriaInterface
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
        $status = request()->status;

        if (! empty($status)) {
            $model = $model->where('status', $status);
        } else {
            $model = $model->where(function ($query) {
                $query
                    ->orWhere('status', OrderStatus::OPEN)
                    ->orWhere('status', OrderStatus::ACTIVE);
            });
        }

        return $model;
    }
}
