<?php

namespace App\Repositories;

use App\Salary;
use Prettus\Repository\Eloquent\BaseRepository;
use Prettus\Repository\Contracts\CacheableInterface;
use Prettus\Repository\Traits\CacheableRepository;

/**
 * Class SalaryRepositoryRepositoryEloquent.
 *
 * @package namespace App\Repositories;
 */
class SalaryRepository extends BaseRepository implements CacheableInterface
{
    use CacheableRepository;

    /**
     * Specify Model class name
     *
     * @return string
     */
    public function model()
    {
        return Salary::class;
    }

}
