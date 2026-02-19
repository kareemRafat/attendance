<?php

namespace App\Enums;

enum CourseType: string
{
    case Frontend = 'frontend';
    case Backend = 'backend';
    case Fullstack = 'fullstack';

    public function label(): string
    {
        return match ($this) {
            self::Frontend => 'Frontend',
            self::Backend => 'Backend',
            self::Fullstack => 'Fullstack',
        };
    }
}
