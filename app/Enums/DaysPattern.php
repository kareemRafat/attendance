<?php

namespace App\Enums;

enum DaysPattern: string
{
    case SatTue = 'sat_tue';
    case SunWed = 'sun_wed';
    case MonThu = 'mon_thu';

    public function label(): string
    {
        return match ($this) {
            self::SatTue => 'Saturday & Tuesday',
            self::SunWed => 'Sunday & Wednesday',
            self::MonThu => 'Monday & Thursday',
        };
    }
}
