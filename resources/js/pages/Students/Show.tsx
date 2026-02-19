import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Card,
    CardContent,
    CardDescription,
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
import { format } from 'date-fns';

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
        links: any[];
    };
    transferHistory: TransferLog[];
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
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">{student.name}</h1>
                    </div>
                </div>

                {/* Section 1: Student Information */}
                <Card className="bg-slate-50/50 border-slate-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <User className="size-5 text-slate-500" />
                            General Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Full Name</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{student.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Branch</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{student.branch?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Current Groups</p>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {currentGroups.length > 0 ? (
                                        currentGroups.map((group) => (
                                            <span key={group.id} className="inline-flex items-center rounded bg-white px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200 shadow-sm">
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
                    <Card className="flex flex-col justify-between bg-indigo-50/50 border-indigo-100 transition-colors hover:bg-indigo-50">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                Attendance Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-extrabold text-indigo-900">{attendanceRate}%</span>
                                <TrendingUp className={`size-4 mb-1.5 ${attendanceRate >= 75 ? 'text-green-500' : 'text-orange-500'}`} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Sessions */}
                    <Card className="flex flex-col justify-between bg-blue-50/50 border-blue-100 transition-colors hover:bg-blue-50">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                Total Sessions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-blue-900">{stats.total}</span>
                                <Calendar className="size-5 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Present */}
                    <Card className="flex flex-col justify-between bg-emerald-50/50 border-emerald-100 transition-colors hover:bg-emerald-50">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                Present
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-emerald-900">{stats.present}</span>
                                <CheckCircle2 className="size-5 text-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Absent */}
                    <Card className="flex flex-col justify-between bg-rose-50/50 border-rose-100 transition-colors hover:bg-rose-50">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-600">
                                Absent
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-rose-900">{stats.absent}</span>
                                <XCircle className="size-5 text-rose-400" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Excused */}
                    <Card className="flex flex-col justify-between bg-amber-50/50 border-amber-100 transition-colors hover:bg-amber-50">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600">
                                Excused
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-amber-900">{stats.excused}</span>
                                <Clock className="size-5 text-amber-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Section 3: Attendance History */}
                <Card className="border-slate-200">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="size-5 text-slate-500" />
                            Attendance History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="px-6">Date</TableHead>
                                    <TableHead>Group</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right px-6">Recorded At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendanceHistory.data.map((record) => (
                                    <TableRow key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium px-6 text-slate-900">
                                            {format(new Date(record.lecture_session.date), 'PPP')}
                                        </TableCell>
                                        <TableCell className="text-slate-600">{record.lecture_session.group.name}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                                record.status === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                record.status === 'absent' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-400 text-xs px-6">
                                            {format(new Date(record.created_at), 'p')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {attendanceHistory.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-slate-400 italic">
                                            No attendance records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {attendanceHistory.links && attendanceHistory.links.length > 3 && (
                            <div className="py-4 flex flex-wrap justify-center gap-1 border-t border-slate-100">
                                {attendanceHistory.links.map((link: any, i: number) => (
                                    <Link key={i} href={link.url || '#'} preserveScroll>
                                        <Button
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            className={`h-8 px-3 ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
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
                <Card className="border-slate-200">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <ArrowRightLeft className="size-5 text-slate-500" />
                            Transfer History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="px-6">From Group</TableHead>
                                    <TableHead className="w-10 text-center" />
                                    <TableHead>To Group</TableHead>
                                    <TableHead>Effective Date</TableHead>
                                    <TableHead className="text-right px-6">Reason</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transferHistory.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-semibold text-slate-900 px-6">{log.from_group.name}</TableCell>
                                        <TableCell className="text-center">
                                            <ArrowRightLeft className="size-4 text-slate-300 mx-auto" />
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-900">{log.to_group.name}</TableCell>
                                        <TableCell className="text-slate-600">{format(new Date(log.effective_date), 'PPP')}</TableCell>
                                        <TableCell className="text-right text-slate-600 max-w-[300px] truncate px-6" title={log.reason}>{log.reason}</TableCell>
                                    </TableRow>
                                ))}
                                {transferHistory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-slate-400 italic">
                                            No transfer records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
