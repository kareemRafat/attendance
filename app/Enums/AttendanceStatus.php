<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case Present = 'present';
    case Excused = 'excused';
    case Absent = 'absent';
}
