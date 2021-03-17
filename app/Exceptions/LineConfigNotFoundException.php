<?php

namespace App\Exceptions;

class LineConfigNotFoundException extends \Exception
{

    public function __construct($message)
    {
        parent::__construct($message);
    }

}