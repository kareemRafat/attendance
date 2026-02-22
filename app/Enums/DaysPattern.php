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
            self::SatTue => 'السبت والثلاثاء',
            self::SunWed => 'الأحد والأربعاء',
            self::MonThu => 'الاثنين والخميس',
        };
    }
}
