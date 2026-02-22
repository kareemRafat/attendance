import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    CheckCircle2,
    XCircle,
    Clock,
    ArrowLeft,
    Users,
    Calendar,
    GraduationCap,
    TrendingUp,
    BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Group {
    id: number;
    name: string;
    formatted_pattern: string;
    start_date: string;
    max_lectures: number;
    branch?: { name: string };
}

interface Student {
    id: number;
    name: string;
    formatted_track: string;
    present_count: number;
    absent_count: number;
    excused_count: number;
}

interface Session {
    id: number;
    date: string;
    lecture_number: number;
    present_count: number;
    absent_count: number;
    excused_count: number;
}

interface Props {
    group: Group;
    students: {
        data: Student[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        from: number;
        to: number;
        total: number;
    };
    sessions: {
        data: Session[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        from: number;
        to: number;
        total: number;
    };
}

export default function GroupShow({ group, students, sessions }: Props) {
    const breadcrumbs = [
        { title: 'المجموعات', href: '/groups' },
        { title: group.name, href: `/groups/${group.id}` },
    ];

    const totalSessions = sessions.total;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`تقرير المجموعة: ${group.name}`} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/groups">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                            >
                                <ArrowLeft className="size-4 rtl:rotate-180" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {group.name}
                            </h1>
                            <p className="text-sm font-medium text-slate-500">
                                {group.branch?.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 1: Group Info Summary */}
                <div className="grid grid-cols-1 gap-4 text-slate-900 md:grid-cols-3">
                    <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm dark:border-indigo-900 dark:bg-indigo-950/20">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                                <Calendar className="size-3.5" /> الجدول
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
                                {group.formatted_pattern}
                            </p>
                            <p className="text-xs font-medium text-indigo-600/70">
                                بدأت في{' '}
                                {format(new Date(group.start_date), 'PPP')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/20">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                <Users className="size-3.5" /> المسجلين
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                                {students.total} طلاب
                            </p>
                            <p className="text-xs font-medium text-emerald-600/70">
                                نشط في هذه المجموعة
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-100 bg-amber-50/50 shadow-sm dark:border-amber-900 dark:bg-amber-950/20">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                                <BookOpen className="size-3.5" /> التقدم
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-lg font-bold text-amber-900 dark:text-amber-200">
                                {totalSessions} / {group.max_lectures} محاضرة
                            </p>
                            <p className="text-xs font-medium text-amber-600/70">
                                إجمالي الجلسات المسجلة
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Section 2: Students Attendance Report */}
                <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-3 dark:border-slate-800 dark:bg-slate-800/30">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                            <GraduationCap className="size-5 text-indigo-500" />
                            تقرير حضور الطلاب
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20">
                                <TableRow className="dark:border-slate-800">
                                    <TableHead className="py-4 pr-6 font-bold text-slate-900 dark:text-slate-300">
                                        اسم الطالب
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-900 dark:text-slate-300">
                                        المسار
                                    </TableHead>
                                    <TableHead className="text-center font-bold text-slate-900 dark:text-slate-300">
                                        النسبة
                                    </TableHead>
                                    <TableHead className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                                        حضور
                                    </TableHead>
                                    <TableHead className="text-center font-bold text-rose-600 dark:text-rose-400">
                                        غياب
                                    </TableHead>
                                    <TableHead className="text-center font-bold text-amber-600 dark:text-amber-400">
                                        بعذر
                                    </TableHead>
                                    <TableHead className="pl-6 text-left font-bold text-slate-900 dark:text-slate-300">
                                        إجراء
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.map((student) => {
                                    const totalStudentSessions =
                                        student.present_count +
                                        student.absent_count +
                                        student.excused_count;
                                    const rate =
                                        totalStudentSessions > 0
                                            ? Math.round(
                                                  ((student.present_count +
                                                      student.excused_count) /
                                                      totalStudentSessions) *
                                                      100,
                                              )
                                            : 0;

                                    return (
                                        <TableRow
                                            key={student.id}
                                            className="group transition-colors hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                                        >
                                            <TableCell className="py-4 pr-6 font-bold text-slate-900 dark:text-slate-200">
                                                {student.name}
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-full border bg-slate-100 px-2.5 py-0.5 text-[10px] font-black tracking-tight text-slate-600 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    {student.formatted_track}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <span
                                                        className={cn(
                                                            'text-sm font-black',
                                                            rate >= 80
                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                : rate >= 60
                                                                  ? 'text-amber-600 dark:text-amber-400'
                                                                  : 'text-rose-600 dark:text-rose-400',
                                                        )}
                                                    >
                                                        {rate}%
                                                    </span>
                                                    <TrendingUp
                                                        className={cn(
                                                            'size-3',
                                                            rate >= 80
                                                                ? 'text-emerald-400'
                                                                : 'text-slate-300',
                                                        )}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex size-7 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                    {student.present_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex size-7 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400">
                                                    {student.absent_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex size-7 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-xs font-bold text-amber-700 dark:border-amber-900 dark:bg-emerald-950/30 dark:text-amber-400">
                                                    {student.excused_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="pl-6 text-left">
                                                <Link
                                                    href={`/students/${student.id}`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 rounded-full text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                                                    >
                                                        عرض الملف الشخصي
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {students.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-24 text-center text-slate-400 italic"
                                        >
                                            لا يوجد طلاب في هذه المجموعة.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {students.links && students.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/10">
                                <div className="text-sm font-bold tracking-tight text-slate-500 uppercase dark:text-slate-400">
                                    عرض{' '}
                                    <span className="text-slate-900 dark:text-white">
                                        {students.from}-{students.to}
                                    </span>{' '}
                                    من أصل{' '}
                                    <span className="text-slate-900 dark:text-white">
                                        {students.total}
                                    </span>{' '}
                                    طالب
                                </div>
                                <div className="flex flex-wrap justify-center gap-1">
                                    {students.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            preserveScroll
                                        >
                                            <Button
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                className={cn(
                                                    'h-8 rounded-lg px-3 text-xs font-bold transition-all',
                                                    !link.url
                                                        ? 'pointer-events-none opacity-50'
                                                        : 'cursor-pointer',
                                                    link.active
                                                        ? 'border-transparent bg-slate-900 shadow-md dark:bg-white dark:text-slate-900'
                                                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                                                )}
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            link.label ===
                                                            '&laquo; Previous'
                                                                ? 'السابق'
                                                                : link.label ===
                                                                    'Next &raquo;'
                                                                  ? 'التالي'
                                                                  : link.label,
                                                    }}
                                                />
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Section 3: Group Sessions History */}
                <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-3 dark:border-slate-800 dark:bg-slate-800/30">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                            <Calendar className="size-5 text-indigo-500" />
                            سجل الحضور (الجلسات)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20">
                                <TableRow className="dark:border-slate-800">
                                    <TableHead className="py-4 pr-6 font-bold text-slate-900 dark:text-slate-300">
                                        رقم الجلسة
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-900 dark:text-slate-300">
                                        التاريخ
                                    </TableHead>
                                    <TableHead className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                                        حضور
                                    </TableHead>
                                    <TableHead className="text-center font-bold text-rose-600 dark:text-rose-400">
                                        غياب
                                    </TableHead>
                                    <TableHead className="text-center font-bold text-amber-600 dark:text-amber-400">
                                        بعذر
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.data.map((session) => (
                                    <TableRow
                                        key={session.id}
                                        className="transition-colors hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                                    >
                                        <TableCell className="py-4 pr-6 font-black text-slate-900 dark:text-slate-200">
                                            محاضرة {session.lecture_number}
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                                            {format(
                                                new Date(session.date),
                                                'PPP',
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="size-3.5" />
                                                {session.present_count}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                                                <XCircle className="size-3.5" />
                                                {session.absent_count}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                                                <Clock className="size-3.5" />
                                                {session.excused_count}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {sessions.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-slate-400 italic"
                                        >
                                            لم يتم تسجيل أي جلسات لهذه المجموعة
                                            بعد.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {sessions.links && sessions.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/10">
                                <div className="text-sm font-bold tracking-tight text-slate-500 uppercase dark:text-slate-400">
                                    عرض{' '}
                                    <span className="text-slate-900 dark:text-white">
                                        {sessions.from}-{sessions.to}
                                    </span>{' '}
                                    من أصل{' '}
                                    <span className="text-slate-900 dark:text-white">
                                        {sessions.total}
                                    </span>{' '}
                                    جلسة
                                </div>
                                <div className="flex flex-wrap justify-center gap-1">
                                    {sessions.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            preserveScroll
                                        >
                                            <Button
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                className={cn(
                                                    'h-8 rounded-lg px-3 text-xs font-bold transition-all',
                                                    !link.url
                                                        ? 'pointer-events-none opacity-50'
                                                        : 'cursor-pointer',
                                                    link.active
                                                        ? 'border-transparent bg-slate-900 shadow-md dark:bg-white dark:text-slate-900'
                                                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                                                )}
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            link.label ===
                                                            '&laquo; Previous'
                                                                ? 'السابق'
                                                                : link.label ===
                                                                    'Next &raquo;'
                                                                  ? 'التالي'
                                                                  : link.label,
                                                    }}
                                                />
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
