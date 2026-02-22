import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Save,
    User as UserIcon,
    ReceiptText,
} from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { cn } from '@/lib/utils';

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
            is_installment_due: boolean;
        }>;
    };
}

interface Props {
    groups: Group[];
    selectedDate: string;
    branches: Branch[];
    selectedBranchId: number | null;
}

interface AttendanceState {
    status: string;
    is_installment_due: boolean;
}

export default function AttendanceIndex({
    groups,
    selectedDate,
    branches,
    selectedBranchId,
}: Props) {
    const { auth } = usePage().props as any;
    const isAdmin = auth.user.role === 'admin';
    const breadcrumbs = [{ title: 'الحضور والغياب', href: '/attendance' }];

    const [activeGroupId, setActiveGroupId] = useState<number | null>(
        groups.length > 0 ? groups[0].id : null,
    );
    const [focusedStudentId, setFocusedStudentId] = useState<number | null>(
        null,
    );
    const [isSaving, setIsSaving] = useState(false);

    // Initial state calculation helper
    const calculateInitialState = (groupsList: Group[]) => {
        const state: Record<number, Record<number, AttendanceState>> = {};
        groupsList.forEach((group) => {
            state[group.id] = {};
            group.students.forEach((student) => {
                const existing = group.lecture_session?.attendances.find(
                    (a) => a.student_id === student.id,
                );
                state[group.id][student.id] = {
                    status: existing ? existing.status : 'present',
                    is_installment_due: existing
                        ? existing.is_installment_due
                        : false,
                };
            });
        });
        return state;
    };

    // Local state for attendance to make it "Ultra-Fast"
    const [localAttendances, setLocalAttendances] = useState<
        Record<number, Record<number, AttendanceState>>
    >(() => calculateInitialState(groups));

    useEffect(() => {
        setLocalAttendances(calculateInitialState(groups));

        // Focus first student by default
        if (groups.length > 0 && groups[0].students.length > 0) {
            setFocusedStudentId(groups[0].students[0].id);
        }

        // Set active group to the first one if not set or not in the current list
        if (
            groups.length > 0 &&
            (!activeGroupId || !groups.find((g) => g.id === activeGroupId))
        ) {
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
                [studentId]: {
                    ...prev[groupId][studentId],
                    status,
                },
            },
        }));
    };

    const handleInstallmentToggle = (
        groupId: number,
        studentId: number,
        checked: boolean,
    ) => {
        setLocalAttendances((prev) => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                [studentId]: {
                    ...prev[groupId][studentId],
                    is_installment_due: checked,
                },
            },
        }));
    };

    const saveAttendance = useCallback(
        (groupId: number) => {
            const attendancesForGroup = Object.entries(
                localAttendances[groupId] || {},
            ).map(([studentId, data]) => ({
                student_id: parseInt(studentId),
                status: data.status,
                is_installment_due: data.is_installment_due,
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
        const grouped: Record<number, { name: string; groups: Group[] }> = {};
        groups.forEach((group) => {
            if (!grouped[group.branch_id]) {
                grouped[group.branch_id] = {
                    name: group.branch.name,
                    groups: [],
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
                } else if (e.key === 'i') {
                    const current =
                        localAttendances[activeGroup.id][focusedStudentId];
                    handleInstallmentToggle(
                        activeGroup.id,
                        focusedStudentId,
                        !current.is_installment_due,
                    );
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeGroup, focusedStudentId, saveAttendance, localAttendances]);

    const counters = useMemo(() => {
        if (!activeGroupId || !localAttendances[activeGroupId])
            return { present: 0, excused: 0, absent: 0 };

        const stats = { present: 0, excused: 0, absent: 0 };
        Object.values(localAttendances[activeGroupId]).forEach((data) => {
            if (data.status === 'present') stats.present++;
            else if (data.status === 'excused') stats.excused++;
            else if (data.status === 'absent') stats.absent++;
        });
        return stats;
    }, [activeGroupId, localAttendances]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="تسجيل الحضور والغياب" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        الحضور والغياب - {selectedDate}
                    </h1>

                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
                        {isAdmin && (
                            <Select
                                value={selectedBranchId?.toString() || 'all'}
                                onValueChange={handleBranchChange}
                            >
                                <SelectTrigger className="w-full rounded-xl bg-white shadow-sm sm:w-[200px] dark:bg-slate-900">
                                    <SelectValue placeholder="جميع الفروع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        جميع الفروع
                                    </SelectItem>
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
                    </div>
                </div>

                {/* Groups Selection Buttons */}
                {groups.length > 0 && (
                    <div className="flex flex-wrap justify-end gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                        {groups.map((group) => (
                            <Button
                                key={group.id}
                                variant={
                                    activeGroupId === group.id
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setActiveGroupId(group.id)}
                                className={cn(
                                    'h-9 cursor-pointer rounded-lg px-4 text-sm font-bold transition-all',
                                    activeGroupId === group.id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                                )}
                            >
                                {group.name}
                            </Button>
                        ))}
                    </div>
                )}
                {activeGroup ? (
                    <Card className="flex-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>{activeGroup.name}</CardTitle>
                                <CardDescription>
                                    {activeGroup.lecture_session
                                        ? `محاضرة رقم #${activeGroup.lecture_session.lecture_number}`
                                        : 'محاضرة جديدة'}
                                    {isAdmin &&
                                        ` • الفرع: ${activeGroup.branch.name}`}
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
                                    <Save className="size-4" /> حفظ
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
                                        التنقل
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1 py-0 text-[10px]"
                                        >
                                            1/P
                                        </Badge>{' '}
                                        حاضر
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1 py-0 text-[10px]"
                                        >
                                            2/E
                                        </Badge>{' '}
                                        إعتذر
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1 py-0 text-[10px]"
                                        >
                                            3/A
                                        </Badge>{' '}
                                        غائب
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1 py-0 text-[10px]"
                                        >
                                            I
                                        </Badge>{' '}
                                        قسط
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1 py-0 text-[10px]"
                                        >
                                            ⌘S
                                        </Badge>{' '}
                                        حفظ
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {activeGroup.students.map((student, index) => {
                                    const studentAttendance =
                                        localAttendances[activeGroup.id]?.[
                                            student.id
                                        ];
                                    const isDue =
                                        studentAttendance?.is_installment_due;
                                    const isFocused =
                                        focusedStudentId === student.id;

                                    return (
                                        <div
                                            key={student.id}
                                            onClick={() =>
                                                setFocusedStudentId(student.id)
                                            }
                                            className={cn(
                                                'flex cursor-pointer flex-col items-start justify-between rounded-lg border p-3 transition-all sm:flex-row sm:items-center',
                                                isFocused &&
                                                    !isDue &&
                                                    'border-primary bg-accent ring-1 ring-primary/50',
                                                isFocused &&
                                                    isDue &&
                                                    'border-red-500 bg-red-100 ring-1 ring-red-500/50',
                                                !isFocused &&
                                                    isDue &&
                                                    'border-red-200 bg-red-50 hover:bg-red-100',
                                                !isFocused &&
                                                    !isDue &&
                                                    'bg-card hover:bg-accent/30',
                                            )}
                                        >
                                            <div className="mb-3 flex items-center gap-4 sm:mb-0">
                                                <div className="w-6 text-sm font-bold text-slate-400">
                                                    {index + 1}
                                                </div>
                                                <Checkbox
                                                    id={`installment-${student.id}`}
                                                    checked={isDue}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        handleInstallmentToggle(
                                                            activeGroup.id,
                                                            student.id,
                                                            checked === true,
                                                        )
                                                    }
                                                    className={cn(
                                                        'size-5 transition-transform hover:scale-110',
                                                        isDue
                                                            ? 'border-transparent data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                                                            : 'border-muted-foreground',
                                                    )}
                                                    title="تحديد قسط مستحق"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                />

                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            'flex size-8 items-center justify-center rounded-full transition-colors',
                                                            isFocused
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted',
                                                        )}
                                                    >
                                                        <UserIcon className="size-4" />
                                                    </div>
                                                    <div className="flex flex-col text-start">
                                                        <span className="font-medium">
                                                            {student.name}
                                                        </span>
                                                        {isDue && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase">
                                                                <ReceiptText className="size-3" />{' '}
                                                                قسط مستحق
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex w-full items-center justify-end gap-4 sm:w-auto">
                                                <ToggleGroup
                                                    type="single"
                                                    value={
                                                        studentAttendance?.status
                                                    }
                                                    onValueChange={(val) =>
                                                        handleStatusChange(
                                                            activeGroup.id,
                                                            student.id,
                                                            val,
                                                        )
                                                    }
                                                    className="grid flex-1 grid-cols-3 rounded-md border bg-background p-1 sm:flex sm:w-auto"
                                                >
                                                    <ToggleGroupItem
                                                        value="absent"
                                                        aria-label="Absent"
                                                        className="flex-1 data-[state=on]:bg-red-300 data-[state=on]:text-red-900"
                                                    >
                                                        <XCircle className="size-4 sm:me-2" />
                                                        <span className="hidden sm:inline">
                                                            غائب
                                                        </span>
                                                        <span className="text-xs sm:hidden">
                                                            غ
                                                        </span>
                                                    </ToggleGroupItem>
                                                    <ToggleGroupItem
                                                        value="excused"
                                                        aria-label="Excused"
                                                        className="flex-1 data-[state=on]:bg-yellow-300 data-[state=on]:text-yellow-900"
                                                    >
                                                        <Clock className="size-4 sm:me-2" />
                                                        <span className="hidden sm:inline">
                                                            إعتذر
                                                        </span>
                                                        <span className="text-xs sm:hidden">
                                                            ع
                                                        </span>
                                                    </ToggleGroupItem>
                                                    <ToggleGroupItem
                                                        value="present"
                                                        aria-label="Present"
                                                        className="flex-1 data-[state=on]:bg-green-300 data-[state=on]:text-green-900"
                                                    >
                                                        <CheckCircle2 className="size-4 sm:me-2" />
                                                        <span className="hidden sm:inline">
                                                            حاضر
                                                        </span>
                                                        <span className="text-xs sm:hidden">
                                                            ح
                                                        </span>
                                                    </ToggleGroupItem>
                                                </ToggleGroup>
                                            </div>
                                        </div>
                                    );
                                })}

                                {activeGroup.students.length === 0 && (
                                    <div className="py-12 text-center text-muted-foreground">
                                        لا يوجد طلاب مسجلين في هذه المجموعة.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="rounded-xl border bg-muted/20 py-24 text-center">
                        <h3 className="text-lg font-medium">
                            لا توجد مجموعات نشطة لهذا اليوم
                        </h3>
                        <p className="text-muted-foreground">
                            حاول اختيار تاريخ آخر أو تحقق من جداول المجموعات.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
