<?php

namespace App\Exceptions;

class RocketConfigNotFoundException extends \Exception
{

    public function __construct($message)
    {
        parent::__construct($message);
    }

}