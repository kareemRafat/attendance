import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import {
    Plus,
    Trash,
    ArrowRightLeft,
    Eye,
    Users,
    UserPlus,
    Search,
    Pencil,
    Loader2,
    MapPinCheck,
    NotebookText,
} from 'lucide-react';
import { useState } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { EditStudentDialog } from '@/components/edit-student-dialog';
import { TransferStudentDialog } from '@/components/transfer-student-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

interface Branch {
    id: number;
    name: string;
}

interface Group {
    id: number;
    name: string;
}

interface CourseTypeOption {
    name: string;
    value: string;
}

interface Student {
    id: number;
    name: string;
    track: string;
    formatted_track: string;
    branch?: { name: string; id: number };
    groups: Group[];
}

interface Props {
    students: {
        data: Student[];
        links: any[];
    };
    availableGroups: Group[];
    availableBranches: Branch[];
    courseTypes: CourseTypeOption[];
    filters: {
        search?: string;
        branch_id?: string;
        group_id?: string;
        track?: string;
    };
}

export default function StudentsIndex({
    students,
    availableGroups,
    availableBranches,
    courseTypes,
    filters,
}: Props) {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    const isAdmin = user.role === 'admin';

    const breadcrumbs = [{ title: 'الطلاب', href: '/students' }];

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isMassAddOpen, setIsMassAddOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [transferringStudent, setTransferringStudent] =
        useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    // Track state for filtering groups
    const [quickTrack, setQuickTrack] = useState('');
    const [massTrack, setMassTrack] = useState('');

    // Search and Filter State
    const [search, setSearch] = useState(filters.search || '');
    const [branchFilter, setBranchFilter] = useState(
        filters.branch_id || 'all',
    );
    const [groupFilter, setGroupFilter] = useState(filters.group_id || 'all');
    const [trackFilter, setTrackFilter] = useState(filters.track || 'all');

    const handleFilter = (
        newSearch?: string,
        newBranch?: string,
        newGroup?: string,
        newTrack?: string,
    ) => {
        const query: any = {};
        const s = newSearch !== undefined ? newSearch : search;
        const b = newBranch !== undefined ? newBranch : branchFilter;
        const g = newGroup !== undefined ? newGroup : groupFilter;
        const t = newTrack !== undefined ? newTrack : trackFilter;

        if (s) query.search = s;
        if (b && b !== 'all') query.branch_id = b;
        if (g && g !== 'all') query.group_id = g;
        if (t && t !== 'all') query.track = t;

        router.get('/students', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Quick Add Form
    const quickAdd = useForm({
        name: '',
        branch_id: isAdmin ? '' : user.branch_id?.toString() || '',
        group_id: '',
        track: '',
    });

    // Mass Add Form
    const massAdd = useForm({
        branch_id: isAdmin ? '' : user.branch_id?.toString() || '',
        group_id: '',
        track: '',
        students: [
            { name: '', details: '' },
            { name: '', details: '' },
            { name: '', details: '' },
        ],
    });

    const submitQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        quickAdd.post('/students', {
            onSuccess: () => {
                setIsCreateOpen(false);
                quickAdd.reset();
                setQuickTrack('');
            },
        });
    };

    const submitMassAdd = (e: React.FormEvent) => {
        e.preventDefault();
        massAdd.post('/students', {
            onSuccess: () => {
                setIsMassAddOpen(false);
                massAdd.reset();
                setMassTrack('');
            },
        });
    };

    const addStudentRow = () => {
        massAdd.setData('students', [
            ...massAdd.data.students,
            { name: '', details: '' },
        ]);
    };

    const removeStudentRow = (index: number) => {
        const newStudents = [...massAdd.data.students];
        newStudents.splice(index, 1);
        massAdd.setData('students', newStudents);
    };

    const updateStudentRow = (index: number, field: string, value: string) => {
        const newStudents = [...massAdd.data.students];
        newStudents[index] = { ...newStudents[index], [field]: value };
        massAdd.setData('students', newStudents);
    };

    const confirmDelete = () => {
        if (!deletingStudent) return;
        setIsDeleting(true);
        router.delete(`/students/${deletingStudent.id}`, {
            onSuccess: () => {
                setDeletingStudent(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const filteredGroupsByTrack = () => {
        return availableGroups;
    };

    const handleQuickTrackChange = (val: string) => {
        setQuickTrack(val);
        quickAdd.setData('track', val);
    };

    const handleMassTrackChange = (val: string) => {
        setMassTrack(val);
        massAdd.setData('track', val);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الطلاب" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        الطلاب
                    </h1>
                    <div className="flex gap-2">
                        {/* Mass Add Button & Dialog */}
                        <Dialog
                            open={isMassAddOpen}
                            onOpenChange={(open) => {
                                setIsMassAddOpen(open);
                                if (!open) setMassTrack('');
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="cursor-pointer gap-2 border-dashed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <Plus className="size-4" /> إضافة طلاب
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                                <DialogHeader>
                                    <div className="flex items-center gap-2">
                                        <Users className="size-5 text-muted-foreground" />
                                        <DialogTitle>
                                            إضافة طلاب متعددين
                                        </DialogTitle>
                                    </div>
                                    <DialogDescription>
                                        إضافة عدة طلاب دفعة واحدة وتعيينهم لمجموعة.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={submitMassAdd}
                                    className="space-y-6 pt-4"
                                >
                                    <div className="grid grid-cols-1 gap-4 rounded-lg border bg-secondary/30 p-4 md:grid-cols-2 dark:border-slate-700 dark:bg-slate-800/50">
                                        {isAdmin && (
                                            <div className="space-y-3">
                                                <Label htmlFor="mass-branch-id">
                                                    الفرع
                                                </Label>
                                                <Select
                                                    value={
                                                        massAdd.data.branch_id
                                                    }
                                                    onValueChange={(val) =>
                                                        massAdd.setData(
                                                            'branch_id',
                                                            val,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="bg-background dark:border-slate-700 dark:bg-slate-900">
                                                        <SelectValue placeholder="اختر الفرع" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableBranches.map(
                                                            (branch) => (
                                                                <SelectItem
                                                                    key={
                                                                        branch.id
                                                                    }
                                                                    value={branch.id.toString()}
                                                                >
                                                                    {
                                                                        branch.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {massAdd.errors.branch_id && (
                                                    <p className="text-xs text-destructive">
                                                        {
                                                            massAdd.errors
                                                                .branch_id
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            <Label>المسار</Label>
                                            <Select
                                                value={massTrack}
                                                onValueChange={
                                                    handleMassTrackChange
                                                }
                                            >
                                                <SelectTrigger className="bg-background dark:border-slate-700 dark:bg-slate-900">
                                                    <SelectValue placeholder="اختر المسار" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {courseTypes.map((type) => (
                                                        <SelectItem
                                                            key={type.value}
                                                            value={type.value}
                                                        >
                                                            {type.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {massAdd.errors.track && (
                                                <p className="text-xs text-destructive">
                                                    {massAdd.errors.track}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-3 md:col-span-2">
                                            <Label htmlFor="mass-group-id">
                                                المجموعة
                                            </Label>
                                            <Select
                                                value={massAdd.data.group_id}
                                                onValueChange={(val) =>
                                                    massAdd.setData(
                                                        'group_id',
                                                        val,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="bg-background dark:border-slate-700 dark:bg-slate-900">
                                                    <SelectValue placeholder="اختر المجموعة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filteredGroupsByTrack().map(
                                                        (group) => (
                                                            <SelectItem
                                                                key={group.id}
                                                                value={group.id.toString()}
                                                            >
                                                                {group.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {massAdd.errors.group_id && (
                                                <p className="text-xs text-destructive">
                                                    {massAdd.errors.group_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 rounded-lg border bg-secondary/30 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                                        <div className="px-1 text-xs font-bold tracking-widest text-muted-foreground uppercase dark:text-slate-400">
                                            قائمة الطلاب
                                        </div>
                                        <div className="space-y-2">
                                            {massAdd.data.students.map(
                                                (student, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start gap-2"
                                                    >
                                                        <div className="flex-1">
                                                            <Input
                                                                placeholder="اسم الطالب"
                                                                value={
                                                                    student.name
                                                                }
                                                                onChange={(e) =>
                                                                    updateStudentRow(
                                                                        index,
                                                                        'name',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-10 dark:border-slate-700 dark:bg-slate-900"
                                                                required
                                                            />
                                                            {massAdd.errors[
                                                                `students.${index}.name` as keyof typeof massAdd.errors
                                                            ] && (
                                                                <p className="mt-1 text-[10px] text-destructive">
                                                                    {
                                                                        massAdd
                                                                            .errors[
                                                                            `students.${index}.name` as keyof typeof massAdd.errors
                                                                        ]
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={
                                                                massAdd.data
                                                                    .students
                                                                    .length <= 1
                                                            }
                                                            onClick={() =>
                                                                removeStudentRow(
                                                                    index,
                                                                )
                                                            }
                                                            className="h-10 w-10 cursor-pointer text-muted-foreground hover:text-destructive dark:hover:bg-rose-900/20"
                                                        >
                                                            <Trash className="size-4" />
                                                        </Button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-4 dark:border-slate-700">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addStudentRow}
                                            className="cursor-pointer gap-2 dark:border-slate-700 dark:hover:bg-slate-800"
                                        >
                                            <Plus className="size-4" /> إضافة صف
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() =>
                                                    setIsMassAddOpen(false)
                                                }
                                                className="cursor-pointer dark:text-slate-400 dark:hover:bg-slate-800"
                                            >
                                                إلغاء
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={massAdd.processing}
                                                className="cursor-pointer bg-slate-900 shadow-lg shadow-slate-500/10 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                            >
                                                {massAdd.processing ? (
                                                    <>
                                                        <Loader2 className="ms-2 size-4 animate-spin" />{' '}
                                                        جاري الحفظ...
                                                    </>
                                                ) : (
                                                    <>
                                                        حفظ{' '}
                                                        {
                                                            massAdd.data
                                                                .students.length
                                                        }{' '}
                                                        طلاب
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Quick Add Button & Dialog */}
                        <Dialog
                            open={isCreateOpen}
                            onOpenChange={(open) => {
                                setIsCreateOpen(open);
                                if (!open) setQuickTrack('');
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    className="cursor-pointer gap-2 bg-slate-900 shadow-lg shadow-slate-500/10 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                    onClick={() => quickAdd.reset()}
                                >
                                    <UserPlus className="size-4" /> إضافة سريع
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="size-5 text-muted-foreground" />
                                        <DialogTitle>
                                            إضافة طالب جديد
                                        </DialogTitle>
                                    </div>
                                    <DialogDescription>
                                        إنشاء سجل طالب واحد على الفور.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={submitQuickAdd}
                                    className="space-y-6 pt-4"
                                >
                                    {isAdmin && (
                                        <div className="space-y-3">
                                            <Label htmlFor="branch_id">
                                                الفرع
                                            </Label>
                                            <Select
                                                value={quickAdd.data.branch_id}
                                                onValueChange={(val) =>
                                                    quickAdd.setData(
                                                        'branch_id',
                                                        val,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="dark:border-slate-700 dark:bg-slate-900">
                                                    <SelectValue placeholder="اختر الفرع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableBranches.map(
                                                        (branch) => (
                                                            <SelectItem
                                                                key={branch.id}
                                                                value={branch.id.toString()}
                                                            >
                                                                {branch.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {quickAdd.errors.branch_id && (
                                                <p className="text-xs text-destructive">
                                                    {quickAdd.errors.branch_id}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        <Label>المسار</Label>
                                        <Select
                                            value={quickTrack}
                                            onValueChange={
                                                handleQuickTrackChange
                                            }
                                        >
                                            <SelectTrigger className="dark:border-slate-700 dark:bg-slate-900">
                                                <SelectValue placeholder="اختر المسار" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courseTypes.map((type) => (
                                                    <SelectItem
                                                        key={type.value}
                                                        value={type.value}
                                                    >
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {quickAdd.errors.track && (
                                            <p className="text-xs text-destructive">
                                                {quickAdd.errors.track}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="quick-group-id">
                                            المجموعة
                                        </Label>
                                        <Select
                                            value={quickAdd.data.group_id}
                                            onValueChange={(val) =>
                                                quickAdd.setData(
                                                    'group_id',
                                                    val,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="dark:border-slate-700 dark:bg-slate-900">
                                                <SelectValue placeholder="اختر المجموعة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredGroupsByTrack().map(
                                                    (group) => (
                                                        <SelectItem
                                                            key={group.id}
                                                            value={group.id.toString()}
                                                        >
                                                            {group.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {quickAdd.errors.group_id && (
                                            <p className="text-xs text-destructive">
                                                {quickAdd.errors.group_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="name">الاسم</Label>
                                        <Input
                                            id="name"
                                            value={quickAdd.data.name}
                                            onChange={(e) =>
                                                quickAdd.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            className="dark:border-slate-700 dark:bg-slate-900"
                                            required
                                        />
                                        {quickAdd.errors.name && (
                                            <p className="text-xs text-destructive">
                                                {quickAdd.errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <DialogFooter className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={quickAdd.processing}
                                            className="w-full cursor-pointer bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                        >
                                            {quickAdd.processing ? (
                                                <>
                                                    <Loader2 className="ms-2 size-4 animate-spin" />{' '}
                                                    جاري الإنشاء...
                                                </>
                                            ) : (
                                                'إنشاء الطالب'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="overflow-hidden rounded-2xl border-slate-200/60 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader className="space-y-4 border-b border-slate-100 bg-slate-50/50 pb-4 dark:border-slate-800 dark:bg-slate-800/30">
                        <div className="flex items-center gap-2">
                            <Users className="size-5 text-slate-400 dark:text-slate-500" />
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                                    جميع الطلاب
                                </CardTitle>
                                <CardDescription className="font-medium dark:text-slate-400">
                                    إدارة قاعدة بيانات الطلاب وعضوية المجموعات.
                                </CardDescription>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 border-t border-slate-100/50 pt-4 dark:border-slate-800">
                            {/* Search */}
                            <div className="relative w-full md:w-96">
                                <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    type="search"
                                    placeholder="بحث عن طالب بالاسم..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        handleFilter(e.target.value);
                                    }}
                                    className="h-10 rounded-xl bg-white pr-9 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                                />
                            </div>

                            {/* Branch Filter */}
                            {isAdmin && (
                                <Select
                                    value={branchFilter}
                                    onValueChange={(val) => {
                                        setBranchFilter(val);
                                        handleFilter(undefined, val);
                                    }}
                                >
                                    <SelectTrigger className="h-10 w-full rounded-xl bg-white shadow-sm md:w-[200px] dark:border-slate-700 dark:bg-slate-900">
                                        <SelectValue placeholder="جميع الفروع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            جميع الفروع
                                        </SelectItem>
                                        {availableBranches.map((branch) => (
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

                            {/* Track Filter */}
                            <Select
                                value={trackFilter}
                                onValueChange={(val) => {
                                    setTrackFilter(val);
                                    handleFilter(
                                        undefined,
                                        undefined,
                                        undefined,
                                        val,
                                    );
                                }}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl bg-white shadow-sm md:w-[180px] dark:border-slate-700 dark:bg-slate-900">
                                    <SelectValue placeholder="جميع المسارات" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        جميع المسارات
                                    </SelectItem>
                                    {courseTypes.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Group Filter */}
                            <Select
                                value={groupFilter}
                                onValueChange={(val) => {
                                    setGroupFilter(val);
                                    handleFilter(undefined, undefined, val);
                                }}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl bg-white shadow-sm md:w-[220px] dark:border-slate-700 dark:bg-slate-900">
                                    <SelectValue placeholder="جميع المجموعات" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        جميع المجموعات
                                    </SelectItem>
                                    {availableGroups.map((group) => (
                                        <SelectItem
                                            key={group.id}
                                            value={group.id.toString()}
                                        >
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {(search ||
                                (branchFilter && branchFilter !== 'all') ||
                                (groupFilter && groupFilter !== 'all') ||
                                (trackFilter && trackFilter !== 'all')) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearch('');
                                        setBranchFilter('all');
                                        setGroupFilter('all');
                                        setTrackFilter('all');
                                        handleFilter('', 'all', 'all', 'all');
                                    }}
                                    className="h-10 cursor-pointer rounded-xl px-4 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
                                >
                                    إعادة تعيين
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="dark:bg-slate-800/20">
                                <TableRow className="dark:border-slate-800">
                                    <TableHead className="ps-6 text-start text-base font-bold text-slate-900 dark:text-slate-300">
                                        الاسم
                                    </TableHead>
                                    <TableHead className="text-start text-base font-bold text-slate-900 dark:text-slate-300">
                                        الفرع
                                    </TableHead>
                                    <TableHead className="text-start text-base font-bold text-slate-900 dark:text-slate-300">
                                        المسار
                                    </TableHead>
                                    <TableHead className="text-start text-base font-bold text-slate-900 dark:text-slate-300">
                                        المجموعات الحالية
                                    </TableHead>
                                    <TableHead className="pe-6 text-end text-base font-bold text-slate-900 dark:text-slate-300">
                                        الإجراءات
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.map((student) => (
                                    <TableRow
                                        key={student.id}
                                        className="transition-colors even:bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-800 dark:even:bg-slate-800/10 dark:hover:bg-slate-800/30"
                                    >
                                        <TableCell className="ps-6 text-start text-base font-bold">
                                            <Link
                                                href={`/students/${student.id}`}
                                                className="text-indigo-600 transition-colors hover:underline dark:text-indigo-400"
                                            >
                                                {student.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-start text-base font-medium dark:text-slate-300">
                                            <MapPinCheck size={18} className='text-slate-700 inline mx-2'/>
                                            {student.branch?.name || '-'}
                                        </TableCell>
                                        <TableCell className="text-start text-base">
                                            <NotebookText size={18} className='text-slate-700 inline mx-2' />
                                            {student.formatted_track ? (
                                                <span className="rounded-full border bg-slate-100 px-2.5 py-0.5 text-xs font-black tracking-tight text-slate-700 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    {student.formatted_track}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-start">
                                            <div className="flex flex-wrap gap-1">
                                                {student.groups.map((g) => (
                                                    <span
                                                        key={g.id}
                                                        className="inline-flex items-center rounded-md border bg-white px-2 py-0.5 text-sm font-bold text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                                    >
                                                        {g.name}
                                                    </span>
                                                ))}
                                                {student.groups.length ===
                                                    0 && (
                                                    <span className="text-sm text-muted-foreground italic dark:text-slate-500">
                                                        غير مسجل
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="pe-6 text-end">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/students/${student.id}`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 cursor-pointer gap-1.5 rounded-lg border-indigo-100 text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                                                    >
                                                        <Eye className="size-4" />
                                                        <span className="font-bold">عرض</span>
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 cursor-pointer gap-1.5 rounded-lg border-amber-100 text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30"
                                                    onClick={() =>
                                                        setTransferringStudent(
                                                            student,
                                                        )
                                                    }
                                                >
                                                    <ArrowRightLeft className="size-4" />
                                                    <span className="font-bold">نقل</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 cursor-pointer gap-1.5 rounded-lg border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                                    onClick={() =>
                                                        setEditingStudent(
                                                            student,
                                                        )
                                                    }
                                                >
                                                    <Pencil className="size-4" />
                                                    <span className="font-bold">تعديل</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 cursor-pointer gap-1.5 rounded-lg border-rose-100 text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30"
                                                    onClick={() =>
                                                        setDeletingStudent(
                                                            student,
                                                        )
                                                    }
                                                >
                                                    <Trash className="size-4" />
                                                    <span className="font-bold">حذف</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={isAdmin ? 5 : 4}
                                            className="h-24 text-center text-muted-foreground italic dark:text-slate-500"
                                        >
                                            لم يتم العثور على طلاب.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
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
                                    {students.links.map(
                                        (link: any, i: number) => (
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
                                                            __html: link.label === '&laquo; Previous' ? 'السابق' : (link.label === 'Next &raquo;' ? 'التالي' : link.label),
                                                        }}
                                                    />
                                                </Button>
                                            </Link>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <EditStudentDialog
                    student={editingStudent}
                    isOpen={!!editingStudent}
                    onClose={() => setEditingStudent(null)}
                    courseTypes={courseTypes}
                    availableBranches={availableBranches}
                    availableGroups={availableGroups}
                />

                <TransferStudentDialog
                    student={transferringStudent}
                    isOpen={!!transferringStudent}
                    onClose={() => setTransferringStudent(null)}
                    availableGroups={availableGroups}
                    courseTypes={courseTypes}
                />

                <DeleteConfirmationDialog
                    isOpen={!!deletingStudent}
                    onClose={() => setDeletingStudent(null)}
                    onConfirm={confirmDelete}
                    processing={isDeleting}
                    title="حذف الطالب"
                    description={
                        <>
                            هل أنت متأكد من حذف الطالب{' '}
                            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                                {deletingStudent?.name}
                            </span>
                            ؟ لا يمكن التراجع عن هذا الإجراء.
                        </>
                    }
                />
            </div>
        </AppLayout>
    );
}
