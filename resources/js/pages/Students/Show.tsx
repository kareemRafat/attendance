import { Head, Link } from '@inertiajs/react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    branch?: { name: string };
    enrollments: Enrollment[];
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
    stats: {
        present: number;
        absent: number;
        excused: number;
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
    stats,
    attendanceHistory,
    transferHistory,
}: Props) {
    const breadcrumbs = [
        { title: 'Students', href: '/students' },
        { title: student.name, href: `/students/${student.id}` },
    ];

    const attendanceRate =
        stats.total > 0
            ? Math.round(((stats.present + stats.excused) / stats.total) * 100)
            : 0;

    const currentGroups = student.enrollments
        .filter((e) => !e.ended_at)
        .map((e) => e.group);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Student: ${student.name}`} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/students">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{student.name}</h1>
                            <p className="text-sm text-slate-500 font-medium">{student.branch?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Section 1: Student Information */}
                <Card className="bg-slate-50/50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-white text-slate-700">
                            <User className="size-5 text-slate-500" />
                            General Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Full Name</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-200">{student.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Branch</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-200">{student.branch?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Track</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-200 capitalize">{student.formatted_track || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Current Groups</p>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {currentGroups.length > 0 ? (
                                        currentGroups.map((group) => (
                                            <span key={group.id} className="inline-flex items-center rounded bg-white dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <GraduationCap className="mr-1 size-3 text-slate-400" />
                                                {group.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Not enrolled</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Statistics Widgets with Light Colors */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    {/* Attendance Rate */}
                    <Card className="flex flex-col justify-between bg-indigo-50/50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 transition-colors hover:bg-indigo-50">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Attendance Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-200">{attendanceRate}%</span>
                                <TrendingUp className={`size-4 mb-1.5 ${attendanceRate >= 75 ? 'text-green-500' : 'text-orange-500'}`} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Sessions */}
                    <Card className="flex flex-col justify-between bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900 transition-colors hover:bg-blue-50">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Total Sessions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-blue-900 dark:text-blue-200">{stats.total}</span>
                                <Calendar className="size-5 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Present */}
                    <Card className="flex flex-col justify-between bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900 transition-colors hover:bg-emerald-50">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                Present
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-200">{stats.present}</span>
                                <CheckCircle2 className="size-5 text-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Absent */}
                    <Card className="flex flex-col justify-between bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900 transition-colors hover:bg-rose-50">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                Absent
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-rose-900 dark:text-rose-200">{stats.absent}</span>
                                <XCircle className="size-5 text-rose-400" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Excused */}
                    <Card className="flex flex-col justify-between bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900 transition-colors hover:bg-amber-50">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                Excused
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-amber-900 dark:text-amber-200">{stats.excused}</span>
                                <Clock className="size-5 text-amber-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Section 3: Attendance History */}
                    <Card className="border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 dark:text-white text-slate-800">
                                <Calendar className="size-5 text-indigo-500" />
                                Attendance History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col">
                            <div className="flex-1">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20">
                                        <TableRow className="dark:border-slate-800">
                                            <TableHead className="px-6 py-4 text-slate-900 dark:text-slate-300 font-bold">Date</TableHead>
                                            <TableHead className="text-slate-900 dark:text-slate-300 font-bold">Status</TableHead>
                                            <TableHead className="text-slate-900 dark:text-slate-300 font-bold text-center">Group</TableHead>
                                            <TableHead className="text-right px-6 text-slate-900 dark:text-slate-300 font-bold">Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendanceHistory.data.map((record) => (
                                            <TableRow key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors dark:border-slate-800">
                                                <TableCell className="font-bold px-6 text-slate-900 dark:text-slate-200">
                                                    {format(new Date(record.lecture_session.date), 'PPP')}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                                                        record.status === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900' :
                                                        record.status === 'absent' ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900' :
                                                        'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900'
                                                    }`}>
                                                        {record.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center text-slate-500 dark:text-slate-400 font-medium">
                                                    {record.lecture_session.group.name}
                                                </TableCell>
                                                <TableCell className="text-right px-6 text-xs text-slate-400 font-medium">
                                                    {format(new Date(record.created_at), 'p')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {attendanceHistory.data.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center text-slate-400 italic">
                                                    No attendance records found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {attendanceHistory.links && attendanceHistory.links.length > 3 && (
                                <div className="py-4 flex flex-wrap justify-center gap-1 border-t border-slate-100 dark:border-slate-800">
                                    {attendanceHistory.links.map((link, i) => (
                                        <Link key={i} href={link.url || '#'} preserveScroll>
                                            <Button
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                className={cn(
                                                    "h-8 px-3 transition-all rounded-lg font-bold text-xs",
                                                    !link.url ? "pointer-events-none opacity-50" : "cursor-pointer",
                                                    link.active 
                                                        ? "bg-slate-900 dark:bg-white dark:text-slate-900 border-transparent shadow-md" 
                                                        : "bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 border-slate-200"
                                                )}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section 4: Transfer History */}
                    <Card className="border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 dark:text-white text-slate-800">
                                <ArrowRightLeft className="size-5 text-indigo-500" />
                                Transfer History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col">
                            <div className="flex-1">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20">
                                        <TableRow className="dark:border-slate-800">
                                            <TableHead className="px-6 py-4 text-slate-900 dark:text-slate-300 font-bold">From/To</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right pr-6">Reason</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transferHistory.data.map((log) => (
                                            <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors dark:border-slate-800">
                                                <TableCell className="font-bold text-slate-900 dark:text-slate-200 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs">{log.from_group.name}</span>
                                                        <ArrowRightLeft className="size-3 text-slate-300 my-0.5" />
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400">{log.to_group.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    {format(new Date(log.effective_date), 'PPP')}
                                                </TableCell>
                                                <TableCell className="text-right text-slate-600 dark:text-slate-400 max-w-[200px] truncate px-6 text-xs" title={log.reason}>
                                                    {log.reason}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {transferHistory.data.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center text-slate-400 italic">
                                                    No transfer records found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {transferHistory.links && transferHistory.links.length > 3 && (
                                <div className="py-4 flex flex-wrap justify-center gap-1 border-t border-slate-100 dark:border-slate-800">
                                    {transferHistory.links.map((link, i) => (
                                        <Link key={i} href={link.url || '#'} preserveScroll>
                                            <Button
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                className={cn(
                                                    "h-8 px-3 transition-all rounded-lg font-bold text-xs",
                                                    !link.url ? "pointer-events-none opacity-50" : "cursor-pointer",
                                                    link.active 
                                                        ? "bg-slate-900 dark:bg-white dark:text-slate-900 border-transparent shadow-md" 
                                                        : "bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 border-slate-200"
                                                )}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
