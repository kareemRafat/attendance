import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle, Clock, Save, User as UserIcon } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';

interface Student {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
}

interface Group {
    id: number;
    name: string;
    branch_id: number;
    branch: Branch;
    students: Student[];
    lecture_session?: {
        id: number;
        lecture_number: number;
        attendances: Array<{
            student_id: number;
            status: string;
        }>;
    };
}

interface Props {
    groups: Group[];
    selectedDate: string;
    branches: Branch[];
    selectedBranchId: number | null;
}

export default function AttendanceIndex({
    groups,
    selectedDate,
    branches,
    selectedBranchId,
}: Props) {
    const { auth } = usePage().props as any;
    const isAdmin = auth.user.role === 'admin';
    const breadcrumbs = [{ title: 'Attendance', href: '/attendance' }];

    const [activeGroupId, setActiveGroupId] = useState<number | null>(
        groups.length > 0 ? groups[0].id : null,
    );
    const [focusedStudentId, setFocusedStudentId] = useState<number | null>(
        null,
    );
    const [isSaving, setIsSaving] = useState(false);

    // Initial state calculation helper
    const calculateInitialState = (groupsList: Group[]) => {
        const state: Record<number, Record<number, string>> = {};
        groupsList.forEach((group) => {
            state[group.id] = {};
            group.students.forEach((student) => {
                const existing = group.lecture_session?.attendances.find(
                    (a) => a.student_id === student.id,
                );
                state[group.id][student.id] = existing
                    ? existing.status
                    : 'absent';
            });
        });
        return state;
    };

    // Local state for attendance to make it "Ultra-Fast"
    const [localAttendances, setLocalAttendances] = useState<
        Record<number, Record<number, string>>
    >(() => calculateInitialState(groups));

    useEffect(() => {
        setLocalAttendances(calculateInitialState(groups));

        // Focus first student by default
        if (groups.length > 0 && groups[0].students.length > 0) {
            setFocusedStudentId(groups[0].students[0].id);
        }

        // Set active group to the first one if not set or not in the current list
        if (groups.length > 0 && (!activeGroupId || !groups.find(g => g.id === activeGroupId))) {
            setActiveGroupId(groups[0].id);
        }
    }, [groups]);

    const activeGroup = groups.find((g) => g.id === activeGroupId);

    const handleStatusChange = (
        groupId: number,
        studentId: number,
        status: string,
    ) => {
        if (!status) return; // Prevent unselecting
        setLocalAttendances((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                [studentId]: status,
            },
        }));
    };

    const saveAttendance = useCallback(
        (groupId: number) => {
            const attendancesForGroup = Object.entries(
                localAttendances[groupId] || {},
            ).map(([studentId, status]) => ({
                student_id: parseInt(studentId),
                status,
            }));

            setIsSaving(true);
            router.post(
                '/attendance',
                {
                    group_id: groupId,
                    date: selectedDate,
                    attendances: attendancesForGroup,
                },
                {
                    preserveScroll: true,
                    onFinish: () => setIsSaving(false),
                },
            );
        },
        [localAttendances, selectedDate],
    );

    const handleBranchChange = (branchId: string) => {
        router.get(
            '/attendance',
            {
                date: selectedDate,
                branch_id: branchId === 'all' ? null : branchId,
            },
            { preserveState: true },
        );
    };

    // Group groups by branch for admin display
    const groupedGroups = useMemo(() => {
        const grouped: Record<number, { name: string, groups: Group[] }> = {};
        groups.forEach(group => {
            if (!grouped[group.branch_id]) {
                grouped[group.branch_id] = {
                    name: group.branch.name,
                    groups: []
                };
            }
            grouped[group.branch_id].groups.push(group);
        });
        return grouped;
    }, [groups]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!activeGroup) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Meta+S or Ctrl+S to save
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                saveAttendance(activeGroup.id);
                return;
            }

            const currentIndex = activeGroup.students.findIndex(
                (s) => s.id === focusedStudentId,
            );

            // Navigation
            if (e.key === 'ArrowDown' || e.key === 'j') {
                e.preventDefault();
                const next = activeGroup.students[currentIndex + 1];
                if (next) setFocusedStudentId(next.id);
            } else if (e.key === 'ArrowUp' || e.key === 'k') {
                e.preventDefault();
                const prev = activeGroup.students[currentIndex - 1];
                if (prev) setFocusedStudentId(prev.id);
            }

            // Status marking
            if (focusedStudentId) {
                if (e.key === '1' || e.key === 'p') {
                    handleStatusChange(
                        activeGroup.id,
                        focusedStudentId,
                        'present',
                    );
                } else if (e.key === '2' || e.key === 'e') {
                    handleStatusChange(
                        activeGroup.id,
                        focusedStudentId,
                        'excused',
                    );
                } else if (e.key === '3' || e.key === 'a') {
                    handleStatusChange(
                        activeGroup.id,
                        focusedStudentId,
                        'absent',
                    );
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeGroup, focusedStudentId, saveAttendance]);

    const counters = useMemo(() => {
        if (!activeGroupId || !localAttendances[activeGroupId])
            return { present: 0, excused: 0, absent: 0 };

        const stats = { present: 0, excused: 0, absent: 0 };
        Object.values(localAttendances[activeGroupId]).forEach((status) => {
            if (status === 'present') stats.present++;
            else if (status === 'excused') stats.excused++;
            else if (status === 'absent') stats.absent++;
        });
        return stats;
    }, [activeGroupId, localAttendances]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mark Attendance" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-2xl font-bold">
                        Attendance - {selectedDate}
                    </h1>

                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
                        {isAdmin && (
                            <Select
                                value={selectedBranchId?.toString() || 'all'}
                                onValueChange={handleBranchChange}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All Branches" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Branches</SelectItem>
                                    {branches.map((branch) => (
                                        <SelectItem
                                            key={branch.id}
                                            value={branch.id.toString()}
                                        >
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Select
                            value={activeGroupId?.toString() || ''}
                            onValueChange={(val) => setActiveGroupId(parseInt(val))}
                        >
                            <SelectTrigger className="w-full sm:w-[240px]">
                                <SelectValue placeholder="Select Group" />
                            </SelectTrigger>
                            <SelectContent>
                                {isAdmin ? (
                                    Object.entries(groupedGroups).map(([branchId, data]) => (
                                        <SelectGroup key={branchId}>
                                            <SelectLabel>{data.name}</SelectLabel>
                                            {data.groups.map((group) => (
                                                <SelectItem
                                                    key={group.id}
                                                    value={group.id.toString()}
                                                >
                                                    {group.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))
                                ) : (
                                    groups.map((group) => (
                                        <SelectItem
                                            key={group.id}
                                            value={group.id.toString()}
                                        >
                                            {group.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {activeGroup ? (
                    <Card className="flex-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>{activeGroup.name}</CardTitle>
                                <CardDescription>
                                    {activeGroup.lecture_session
                                        ? `Lecture #${activeGroup.lecture_session.lecture_number}`
                                        : 'New Lecture Session'}
                                    {isAdmin && ` • Branch: ${activeGroup.branch.name}`}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-3 text-sm">
                                    <div className="flex items-center gap-1 font-medium text-green-600">
                                        <CheckCircle2 className="size-4" />{' '}
                                        {counters.present}
                                    </div>
                                    <div className="flex items-center gap-1 font-medium text-yellow-600">
                                        <Clock className="size-4" />{' '}
                                        {counters.excused}
                                    </div>
                                    <div className="flex items-center gap-1 font-medium text-red-600">
                                        <XCircle className="size-4" />{' '}
                                        {counters.absent}
                                    </div>
                                </div>
                                <Button
                                    onClick={() =>
                                        saveAttendance(activeGroup.id)
                                    }
                                    disabled={isSaving}
                                    className="gap-2"
                                >
                                    <Save className="size-4" /> Save
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-col items-start justify-between gap-4 border-b py-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    <span className="flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1 py-0 text-[10px]"
                                        >
                                            ↓/↑
                                        </Badge>{' '}
                                        Navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1 py-0 text-[10px]"
                                        >
                                            1/P
                                        </Badge>{' '}
                                        Present
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1 py-0 text-[10px]"
                                        >
                                            2/E
                                        </Badge>{' '}
                                        Excused
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1 py-0 text-[10px]"
                                        >
                                            3/A
                                        </Badge>{' '}
                                        Absent
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1 py-0 text-[10px]"
                                        >
                                            ⌘S
                                        </Badge>{' '}
                                        Save
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {activeGroup.students.map((student) => (
                                    <div
                                        key={student.id}
                                        onClick={() =>
                                            setFocusedStudentId(student.id)
                                        }
                                        className={`flex cursor-pointer flex-col items-start justify-between rounded-lg border p-3 transition-all sm:flex-row sm:items-center ${
                                            focusedStudentId === student.id
                                                ? 'border-primary bg-accent ring-1 ring-primary/50'
                                                : 'bg-card hover:bg-accent/30'
                                        }`}
                                    >
                                        <div className="mb-3 flex items-center gap-3 sm:mb-0">
                                            <div
                                                className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                                                    focusedStudentId ===
                                                    student.id
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                }`}
                                            >
                                                <UserIcon className="size-4" />
                                            </div>
                                            <span className="font-medium">
                                                {student.name}
                                            </span>
                                        </div>

                                        <ToggleGroup
                                            type="single"
                                            value={
                                                localAttendances[
                                                    activeGroup.id
                                                ]?.[student.id]
                                            }
                                            onValueChange={(val) =>
                                                handleStatusChange(
                                                    activeGroup.id,
                                                    student.id,
                                                    val,
                                                )
                                            }
                                            className="grid w-full grid-cols-3 rounded-md border bg-background p-1 sm:flex sm:w-auto"
                                        >
                                            <ToggleGroupItem
                                                value="present"
                                                aria-label="Present"
                                                className="flex-1 data-[state=on]:bg-green-100 data-[state=on]:text-green-700"
                                            >
                                                <CheckCircle2 className="size-4 sm:mr-2" />
                                                <span className="hidden sm:inline">
                                                    Present
                                                </span>
                                                <span className="text-xs sm:hidden">
                                                    P
                                                </span>
                                            </ToggleGroupItem>
                                            <ToggleGroupItem
                                                value="excused"
                                                aria-label="Excused"
                                                className="flex-1 data-[state=on]:bg-yellow-100 data-[state=on]:text-yellow-700"
                                            >
                                                <Clock className="size-4 sm:mr-2" />
                                                <span className="hidden sm:inline">
                                                    Excused
                                                </span>
                                                <span className="text-xs sm:hidden">
                                                    E
                                                </span>
                                            </ToggleGroupItem>
                                            <ToggleGroupItem
                                                value="absent"
                                                aria-label="Absent"
                                                className="flex-1 data-[state=on]:bg-red-100 data-[state=on]:text-red-700"
                                            >
                                                <XCircle className="size-4 sm:mr-2" />
                                                <span className="hidden sm:inline">
                                                    Absent
                                                </span>
                                                <span className="text-xs sm:hidden">
                                                    A
                                                </span>
                                            </ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>
                                ))}

                                {activeGroup.students.length === 0 && (
                                    <div className="py-12 text-center text-muted-foreground">
                                        No students enrolled in this group.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="rounded-xl border bg-muted/20 py-24 text-center">
                        <h3 className="text-lg font-medium">
                            No groups active for today
                        </h3>
                        <p className="text-muted-foreground">
                            Try selecting another date or check the groups'
                            schedules.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
