<?php

namespace App\Repositories;

use App\CastClass;
use Prettus\Repository\Eloquent\BaseRepository;
use Prettus\Repository\Contracts\CacheableInterface;
use Prettus\Repository\Traits\CacheableRepository;

/**
 * Class CastClassRepositoryRepositoryEloquent.
 *
 * @package namespace App\Repositories;
 */
class CastClassRepository extends BaseRepository implements CacheableInterface
{
    use CacheableRepository;

    /**
     * Specify Model class name
     *
     * @return string
     */
    public function model()
    {
        return CastClass::class;
    }

    
}
