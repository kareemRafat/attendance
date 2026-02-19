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
    students: Student[];
    sessions: Session[];
}

export default function GroupShow({
    group,
    students,
    sessions,
}: Props) {
    const breadcrumbs = [
        { title: 'Groups', href: '/groups' },
        { title: group.name, href: `/groups/${group.id}` },
    ];

    const totalSessions = sessions.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Group Report: ${group.name}`} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/groups">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
                            <p className="text-sm text-slate-500 font-medium">{group.branch?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Section 1: Group Info Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-indigo-50/50 border-indigo-100 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                                <Calendar className="size-3.5" /> Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-lg font-bold text-indigo-900">{group.formatted_pattern}</p>
                            <p className="text-xs text-indigo-600/70 font-medium">Started {format(new Date(group.start_date), 'PPP')}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2">
                                <Users className="size-3.5" /> Enrollment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-lg font-bold text-emerald-900">{students.length} Students</p>
                            <p className="text-xs text-emerald-600/70 font-medium">Active in this group</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50/50 border-amber-100 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                                <BookOpen className="size-3.5" /> Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-lg font-bold text-amber-900">{totalSessions} / {group.max_lectures} Lectures</p>
                            <p className="text-xs text-amber-600/70 font-medium">Total sessions recorded</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Section 2: Students Attendance Report */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                            <GraduationCap className="size-5 text-indigo-500" />
                            Students Attendance Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="pl-6 py-4">Student Name</TableHead>
                                    <TableHead>Track</TableHead>
                                    <TableHead className="text-center">Rate</TableHead>
                                    <TableHead className="text-center text-emerald-600 font-bold">Present</TableHead>
                                    <TableHead className="text-center text-rose-600 font-bold">Absent</TableHead>
                                    <TableHead className="text-center text-amber-600 font-bold">Excused</TableHead>
                                    <TableHead className="text-right pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => {
                                    const totalStudentSessions = student.present_count + student.absent_count + student.excused_count;
                                    const rate = totalStudentSessions > 0 
                                        ? Math.round(((student.present_count + student.excused_count) / totalStudentSessions) * 100) 
                                        : 0;
                                    
                                    return (
                                        <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <TableCell className="font-bold pl-6 py-4 text-slate-900">
                                                {student.name}
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 capitalize">
                                                    {student.formatted_track}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <span className={cn(
                                                        "text-sm font-black",
                                                        rate >= 80 ? "text-emerald-600" : rate >= 60 ? "text-amber-600" : "text-rose-600"
                                                    )}>
                                                        {rate}%
                                                    </span>
                                                    <TrendingUp className={cn("size-3", rate >= 80 ? "text-emerald-400" : "text-slate-300")} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center size-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                                                    {student.present_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center size-7 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs border border-rose-100">
                                                    {student.absent_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center size-7 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs border border-amber-100">
                                                    {student.excused_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Link href={`/students/${student.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full">
                                                        View Profile
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {students.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-slate-400 italic">
                                            No students found in this group.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Section 3: Group Sessions History */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                            <Calendar className="size-5 text-indigo-500" />
                            Attendance History (Sessions)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="pl-6 py-4">Session #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-center text-emerald-600">Present</TableHead>
                                    <TableHead className="text-center text-rose-600">Absent</TableHead>
                                    <TableHead className="text-center text-amber-600">Excused</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.map((session) => (
                                    <TableRow key={session.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-black pl-6 py-4 text-slate-900">
                                            Lecture {session.lecture_number}
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-600">
                                            {format(new Date(session.date), 'PPP')}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold">
                                                <CheckCircle2 className="size-3.5" />
                                                {session.present_count}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-rose-600 font-bold">
                                                <XCircle className="size-3.5" />
                                                {session.absent_count}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                                                <Clock className="size-3.5" />
                                                {session.excused_count}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {sessions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-slate-400 italic">
                                            No sessions recorded for this group yet.
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
