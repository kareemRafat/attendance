<?php

namespace App\Enums;

enum CourseType: string
{
    case Frontend = 'frontend';
    case Backend = 'backend';
    case Fullstack = 'fullstack';
}
