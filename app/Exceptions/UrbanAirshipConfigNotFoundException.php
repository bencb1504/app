<?php

namespace App\Exceptions;

class UrbanAirshipConfigNotFoundException extends \Exception
{

    public function __construct($message)
    {
        parent::__construct($message);
    }

}