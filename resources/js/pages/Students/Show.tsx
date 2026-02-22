import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    CheckCircle2,
    XCircle,
    Clock,
    ArrowLeft,
    User,
    ArrowRightLeft,
    Calendar,
    GraduationCap,
    TrendingUp,
    Pencil,
    Trash,
} from 'lucide-react';
import { useState } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { EditStudentDialog } from '@/components/edit-student-dialog';
import { TransferStudentDialog } from '@/components/transfer-student-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Group {
    id: number;
    name: string;
}

interface Enrollment {
    id: number;
    group: Group;
    ended_at: string | null;
}

interface Student {
    id: number;
    name: string;
    track: string;
    formatted_track: string;
    branch?: { name: string; id: number };
    enrollments: Enrollment[];
    groups: Group[];
}

interface AttendanceRecord {
    id: number;
    status: 'present' | 'absent' | 'excused';
    lecture_session: {
        id: number;
        date: string;
        group: { name: string };
    };
    created_at: string;
}

interface TransferLog {
    id: number;
    from_group: { name: string };
    to_group: { name: string };
    transferred_at: string;
    effective_date: string;
    reason: string;
}

interface Props {
    student: Student;
    availableGroups: Group[];
    availableBranches: { id: number; name: string }[];
    courseTypes: { name: string; value: string }[];
    stats: {
        compliance: number;
        present: number;
        excused: number;
        absent: number;
        total: number;
    };
    attendanceHistory: {
        data: AttendanceRecord[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    transferHistory: {
        data: TransferLog[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

export default function StudentShow({
    student,
    availableGroups,
    availableBranches,
    courseTypes,
    stats,
    attendanceHistory,
    transferHistory,
}: Props) {
    const breadcrumbs = [
        { title: 'الطلاب', href: '/students' },
        { title: student.name, href: `/students/${student.id}` },
    ];

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = () => {
        setIsDeleting(true);
        router.delete(`/students/${student.id}`, {
            onFinish: () => setIsDeleting(false),
        });
    };

    const attendanceRate =
        stats.total > 0
            ? Math.round(((stats.present + stats.excused) / stats.total) * 100)
            : 0;

    const currentGroups = student.enrollments
        .filter((e) => !e.ended_at)
        .map((e) => e.group);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`طالب: ${student.name}`} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/students">
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
                                {student.name}
                            </h1>
                            <p className="text-sm font-medium text-slate-500 capitalize">
                                {student.branch?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="cursor-pointer gap-2 rounded-xl dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            onClick={() => setIsTransferOpen(true)}
                        >
                            <ArrowRightLeft className="size-4" /> نقل
                        </Button>
                        <Button
                            variant="outline"
                            className="cursor-pointer gap-2 rounded-xl dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            onClick={() => setIsEditOpen(true)}
                        >
                            <Pencil className="size-4" /> تعديل
                        </Button>
                        <Button
                            variant="destructive"
                            className="cursor-pointer gap-2 rounded-xl shadow-lg shadow-rose-500/20"
                            onClick={() => setIsDeleteOpen(true)}
                        >
                            <Trash className="size-4" /> حذف
                        </Button>
                    </div>
                </div>

                {/* Section 1: Student Information */}
                <Card className="border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-white">
                            <User className="size-5 text-slate-500" />
                            المعلومات العامة
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                            <div>
                                <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                                    الاسم بالكامل
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-200">
                                    {student.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                                    الفرع
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 capitalize dark:text-slate-200">
                                    {student.branch?.name || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                                    المسار
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 capitalize dark:text-slate-200">
                                    {student.formatted_track || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                                    المجموعات الحالية
                                </p>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {currentGroups.length > 0 ? (
                                        currentGroups.map((group) => (
                                            <span
                                                key={group.id}
                                                className="inline-flex items-center rounded border border-slate-200 bg-white px-2 py-0.5 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                            >
                                                <GraduationCap className="me-1 size-3 text-slate-400" />
                                                {group.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">
                                            غير مسجل في أي مجموعة
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Statistics Widgets */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <Card className="flex flex-col justify-between border-indigo-100 bg-indigo-50/50 transition-colors hover:bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/20">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                                نسبة الحضور
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-200">
                                    {stats.compliance}%
                                </span>
                                <TrendingUp
                                    className={`mb-1.5 size-4 ${stats.compliance >= 75 ? 'text-green-500' : 'text-orange-500'}`}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col justify-between border-blue-100 bg-blue-50/50 transition-colors hover:bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                                إجمالي المحاضرات
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-blue-900 dark:text-blue-200">
                                    {stats.total}
                                </span>
                                <Calendar className="size-5 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Present */}
                    <Card className="flex flex-col justify-between border-emerald-100 bg-emerald-50/50 transition-colors hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                حضور
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-200">
                                    {stats.present}
                                </span>
                                <CheckCircle2 className="size-5 text-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Absent */}
                    <Card className="flex flex-col justify-between border-rose-100 bg-rose-50/50 transition-colors hover:bg-rose-50 dark:border-rose-900 dark:bg-rose-950/20">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                                غياب
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-rose-900 dark:text-rose-200">
                                    {stats.absent}
                                </span>
                                <XCircle className="size-5 text-rose-400" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Excused */}
                    <Card className="flex flex-col justify-between border-amber-100 bg-amber-50/50 transition-colors hover:bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-indigo-400">
                                بعذر
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-amber-900 dark:text-amber-200">
                                    {stats.excused}
                                </span>
                                <Clock className="size-5 text-amber-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Section 3: Attendance History */}
                    <Card className="flex h-full flex-col overflow-hidden border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-3 dark:border-slate-800">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                                <Calendar className="size-5 text-indigo-500" />
                                سجل الحضور والغياب
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col p-0">
                            <div className="flex-1">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20">
                                        <TableRow className="dark:border-slate-800">
                                            <TableHead className="px-6 py-4 text-start font-bold text-slate-900 dark:text-slate-300">
                                                التاريخ
                                            </TableHead>
                                            <TableHead className="text-start font-bold text-slate-900 dark:text-slate-300">
                                                الحالة
                                            </TableHead>
                                            <TableHead className="text-center font-bold text-slate-900 dark:text-slate-300">
                                                المجموعة
                                            </TableHead>
                                            <TableHead className="px-6 text-end font-bold text-slate-900 dark:text-slate-300">
                                                الوقت
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendanceHistory.data.map(
                                            (record) => (
                                                <TableRow
                                                    key={record.id}
                                                    className="transition-colors hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                                                >
                                                    <TableCell className="px-6 text-start font-bold text-slate-900 dark:text-slate-200">
                                                        {format(
                                                            new Date(
                                                                record
                                                                    .lecture_session
                                                                    .date,
                                                            ),
                                                            'yyyy-MM-dd',
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-start">
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase ${
                                                                record.status ===
                                                                'present'
                                                                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                                    : record.status ===
                                                                        'absent'
                                                                      ? 'border-rose-100 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-400'
                                                                      : 'border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-400'
                                                            }`}
                                                        >
                                                            {record.status ===
                                                            'present'
                                                                ? 'حضور'
                                                                : record.status ===
                                                                    'absent'
                                                                  ? 'غياب'
                                                                  : 'بعذر'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium text-slate-500 dark:text-slate-400">
                                                        {
                                                            record
                                                                .lecture_session
                                                                .group.name
                                                        }
                                                    </TableCell>
                                                    <TableCell className="px-6 text-end text-xs font-medium text-slate-400">
                                                        {format(
                                                            new Date(
                                                                record.created_at,
                                                            ),
                                                            'p',
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                        {attendanceHistory.data.length ===
                                            0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="h-24 text-center text-slate-400 italic"
                                                >
                                                    لا توجد سجلات حضور.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {attendanceHistory.links &&
                                attendanceHistory.links.length > 3 && (
                                    <div className="flex flex-wrap justify-center gap-1 border-t border-slate-100 py-4 dark:border-slate-800">
                                        {attendanceHistory.links.map(
                                            (link, i) => (
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
                                            ),
                                        )}
                                    </div>
                                )}
                        </CardContent>
                    </Card>

                    {/* Section 4: Transfer History */}
                    <Card className="flex h-full flex-col overflow-hidden border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-3 dark:border-slate-800">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                                <ArrowRightLeft className="size-5 text-indigo-500" />
                                سجل النقل بين المجموعات
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col p-0">
                            <div className="flex-1">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20">
                                        <TableRow className="dark:border-slate-800">
                                            <TableHead className="min-w-[250px] px-6 py-4 text-start font-bold text-slate-900 dark:text-slate-300">
                                                من / إلى
                                            </TableHead>
                                            <TableHead className="text-start font-bold text-slate-900 dark:text-slate-300">
                                                التاريخ
                                            </TableHead>
                                            <TableHead className="px-6 text-end font-bold text-slate-900 dark:text-slate-300">
                                                السبب
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transferHistory.data.map((log) => (
                                            <TableRow
                                                key={log.id}
                                                className="transition-colors hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                                            >
                                                <TableCell className="px-6 text-start font-bold text-slate-900 dark:text-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {
                                                                log.from_group
                                                                    .name
                                                            }
                                                        </span>
                                                        <ArrowRightLeft className="size-3 text-slate-400 rtl:rotate-180" />
                                                        <span className="text-indigo-600 dark:text-indigo-400">
                                                            {log.to_group.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-start font-medium text-slate-500 dark:text-slate-400">
                                                    {format(
                                                        new Date(
                                                            log.effective_date,
                                                        ),
                                                        'yyyy-MM-dd',
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate px-6 text-end text-xs text-slate-600 dark:text-slate-400">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="cursor-help">
                                                                {log.reason}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs text-sm whitespace-pre-wrap">
                                                            {log.reason}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {transferHistory.data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="h-24 text-center text-slate-400 italic"
                                                >
                                                    لا توجد سجلات نقل.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {transferHistory.links &&
                                transferHistory.links.length > 3 && (
                                    <div className="flex flex-wrap justify-center gap-1 border-t border-slate-100 py-4 dark:border-slate-800">
                                        {transferHistory.links.map(
                                            (link, i) => (
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
                                            ),
                                        )}
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                </div>

                <EditStudentDialog
                    student={student}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    courseTypes={courseTypes}
                    availableBranches={availableBranches}
                    availableGroups={availableGroups}
                />

                <TransferStudentDialog
                    student={student}
                    isOpen={isTransferOpen}
                    onClose={() => setIsTransferOpen(false)}
                    availableGroups={availableGroups}
                    courseTypes={courseTypes}
                />

                <DeleteConfirmationDialog
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onConfirm={confirmDelete}
                    processing={isDeleting}
                    title="حذف الطالب"
                    description={`هل أنت متأكد من حذف الطالب ${student.name}؟ لا يمكن التراجع عن هذا الإجراء.`}
                />
            </div>
        </AppLayout>
    );
}
