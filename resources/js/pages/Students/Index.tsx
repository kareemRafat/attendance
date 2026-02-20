import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import { Plus, Trash, ArrowRightLeft, Eye, Users, UserPlus, Search, Pencil, Loader2 } from 'lucide-react';
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

    const breadcrumbs = [{ title: 'Students', href: '/students' }];

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isMassAddOpen, setIsMassAddOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [transferringStudent, setTransferringStudent] =
        useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Track state for filtering groups
    const [quickTrack, setQuickTrack] = useState('');
    const [massTrack, setMassTrack] = useState('');

    // Search and Filter State
    const [search, setSearch] = useState(filters.search || '');
    const [branchFilter, setBranchFilter] = useState(filters.branch_id || 'all');
    const [groupFilter, setGroupFilter] = useState(filters.group_id || 'all');
    const [trackFilter, setTrackFilter] = useState(filters.track || 'all');

    const handleFilter = (newSearch?: string, newBranch?: string, newGroup?: string, newTrack?: string) => {
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
        massAdd.setData('students', [...massAdd.data.students, { name: '', details: '' }]);
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
            <Head title="Students" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Students</h1>
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
                                    className="gap-2 border-dashed cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <Plus className="size-4" /> Add Students
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <div className="flex items-center gap-2">
                                        <Users className="size-5 text-muted-foreground" />
                                        <DialogTitle>Add Multiple Students</DialogTitle>
                                    </div>
                                    <DialogDescription>
                                        Add multiple students at once and assign them to a group.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={submitMassAdd}
                                    className="space-y-6 pt-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/30 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
                                        {isAdmin && (
                                            <div className="space-y-2">
                                                <Label htmlFor="mass-branch-id">Branch</Label>
                                                <Select
                                                    value={massAdd.data.branch_id}
                                                    onValueChange={(val) =>
                                                        massAdd.setData('branch_id', val)
                                                    }
                                                >
                                                    <SelectTrigger className="bg-background dark:bg-slate-900 dark:border-slate-700">
                                                        <SelectValue placeholder="Select branch" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableBranches.map((branch) => (
                                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                                {branch.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {massAdd.errors.branch_id && <p className="text-xs text-destructive">{massAdd.errors.branch_id}</p>}
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>Choice Track</Label>
                                            <Select value={massTrack} onValueChange={handleMassTrackChange}>
                                                <SelectTrigger className="bg-background dark:bg-slate-900 dark:border-slate-700">
                                                    <SelectValue placeholder="Choose Track" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {courseTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>{type.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {massAdd.errors.track && <p className="text-xs text-destructive">{massAdd.errors.track}</p>}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="mass-group-id">Group Enrollment</Label>
                                            <Select
                                                value={massAdd.data.group_id}
                                                onValueChange={(val) =>
                                                    massAdd.setData('group_id', val)
                                                }
                                            >
                                                <SelectTrigger className="bg-background dark:bg-slate-900 dark:border-slate-700">
                                                    <SelectValue placeholder="Select group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filteredGroupsByTrack().map((group) => (
                                                        <SelectItem key={group.id} value={group.id.toString()}>
                                                            {group.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {massAdd.errors.group_id && <p className="text-xs text-destructive">{massAdd.errors.group_id}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 bg-secondary/30 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
                                        <div className="px-1 text-xs font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-widest">Students List</div>
                                        <div className="space-y-2">
                                            {massAdd.data.students.map((student, index) => (
                                                <div key={index} className="flex gap-2 items-start">
                                                    <div className="flex-1">
                                                        <Input
                                                            placeholder="Student name"
                                                            value={student.name}
                                                            onChange={(e) => updateStudentRow(index, 'name', e.target.value)}
                                                            className="dark:bg-slate-900 dark:border-slate-700 h-10"
                                                            required
                                                        />
                                                        {massAdd.errors[`students.${index}.name` as keyof typeof massAdd.errors] && (
                                                            <p className="text-[10px] text-destructive mt-1">{massAdd.errors[`students.${index}.name` as keyof typeof massAdd.errors]}</p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={massAdd.data.students.length <= 1}
                                                        onClick={() => removeStudentRow(index)}
                                                        className="h-10 w-10 text-muted-foreground hover:text-destructive cursor-pointer dark:hover:bg-rose-900/20"
                                                    >
                                                        <Trash className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t dark:border-slate-700">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addStudentRow}
                                            className="gap-2 cursor-pointer dark:border-slate-700 dark:hover:bg-slate-800"
                                        >
                                            <Plus className="size-4" /> Add Row
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="ghost" onClick={() => setIsMassAddOpen(false)} className="cursor-pointer dark:text-slate-400 dark:hover:bg-slate-800">Cancel</Button>
                                            <Button type="submit" disabled={massAdd.processing} className="cursor-pointer bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-lg shadow-slate-500/10">
                                                {massAdd.processing ? (
                                                    <><Loader2 className="mr-2 size-4 animate-spin" /> Saving...</>
                                                ) : (
                                                    <>Save {massAdd.data.students.length} Students</>
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
                                    className="gap-2 cursor-pointer bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-lg shadow-slate-500/10"
                                    onClick={() => quickAdd.reset()}
                                >
                                    <UserPlus className="size-4" /> Quick Add
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="size-5 text-muted-foreground" />
                                        <DialogTitle>Quick Add Student</DialogTitle>
                                    </div>
                                    <DialogDescription>Create a single student record instantly.</DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={submitQuickAdd}
                                    className="space-y-4 pt-4"
                                >
                                    {isAdmin && (
                                        <div className="space-y-2">
                                            <Label htmlFor="branch_id">Branch</Label>
                                            <Select
                                                value={quickAdd.data.branch_id}
                                                onValueChange={(val) => quickAdd.setData('branch_id', val)}
                                            >
                                                <SelectTrigger className="dark:bg-slate-900 dark:border-slate-700">
                                                    <SelectValue placeholder="Select branch" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableBranches.map((branch) => (
                                                        <SelectItem key={branch.id} value={branch.id.toString()}>
                                                            {branch.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {quickAdd.errors.branch_id && <p className="text-xs text-destructive">{quickAdd.errors.branch_id}</p>}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label>Choice Track</Label>
                                        <Select value={quickTrack} onValueChange={handleQuickTrackChange}>
                                            <SelectTrigger className="dark:bg-slate-900 dark:border-slate-700">
                                                <SelectValue placeholder="Choose Track" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courseTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>{type.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {quickAdd.errors.track && <p className="text-xs text-destructive">{quickAdd.errors.track}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quick-group-id">Group</Label>
                                        <Select
                                            value={quickAdd.data.group_id}
                                            onValueChange={(val) => quickAdd.setData('group_id', val)}
                                        >
                                            <SelectTrigger className="dark:bg-slate-900 dark:border-slate-700">
                                                <SelectValue placeholder="Select group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredGroupsByTrack().map((group) => (
                                                    <SelectItem key={group.id} value={group.id.toString()}>
                                                        {group.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {quickAdd.errors.group_id && <p className="text-xs text-destructive">{quickAdd.errors.group_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={quickAdd.data.name}
                                            onChange={(e) => quickAdd.setData('name', e.target.value)}
                                            className="dark:bg-slate-900 dark:border-slate-700"
                                            required
                                        />
                                        {quickAdd.errors.name && <p className="text-xs text-destructive">{quickAdd.errors.name}</p>}
                                    </div>
                                    <DialogFooter className="pt-2">
                                        <Button type="submit" disabled={quickAdd.processing} className="w-full cursor-pointer bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                                            {quickAdd.processing ? (
                                                <><Loader2 className="mr-2 size-4 animate-spin" /> Creating...</>
                                            ) : (
                                                'Create Student'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="dark:bg-slate-900 dark:border-slate-800 shadow-sm border-slate-200/60 overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 pb-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Users className="size-5 text-slate-400 dark:text-slate-500" />
                            <div>
                                <CardTitle className="text-lg text-slate-900 dark:text-white font-bold">All Students</CardTitle>
                                <CardDescription className="dark:text-slate-400 font-medium">Manage your student database and group memberships.</CardDescription>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100/50 dark:border-slate-800">
                            {/* Search */}
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    placeholder="Search students by name..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        handleFilter(e.target.value);
                                    }}
                                    className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm h-10 rounded-xl pl-9"
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
                                    <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm h-10 rounded-xl">
                                        <SelectValue placeholder="All Branches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Branches</SelectItem>
                                        {availableBranches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id.toString()}>
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
                                    handleFilter(undefined, undefined, undefined, val);
                                }}
                            >
                                <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm h-10 rounded-xl">
                                    <SelectValue placeholder="All Tracks" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Tracks</SelectItem>
                                    {courseTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
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
                                <SelectTrigger className="w-full md:w-[220px] bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm h-10 rounded-xl">
                                    <SelectValue placeholder="All Groups" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Groups</SelectItem>
                                    {availableGroups.map((group) => (
                                        <SelectItem key={group.id} value={group.id.toString()}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {(search || (branchFilter && branchFilter !== 'all') || (groupFilter && groupFilter !== 'all') || (trackFilter && trackFilter !== 'all')) && (
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
                                    className="text-xs h-10 px-4 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all cursor-pointer"
                                >
                                    Reset Filters
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="dark:bg-slate-800/20">
                                <TableRow className="dark:border-slate-800">
                                    <TableHead className="pl-6 text-slate-900 dark:text-slate-300 font-bold">Name</TableHead>
                                    <TableHead className="text-slate-900 dark:text-slate-300 font-bold">Branch</TableHead>
                                    <TableHead className="text-slate-900 dark:text-slate-300 font-bold">Track</TableHead>
                                    <TableHead className="text-slate-900 dark:text-slate-300 font-bold">Current Groups</TableHead>
                                    <TableHead className="text-right pr-6 text-slate-900 dark:text-slate-300 font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.map((student) => (
                                    <TableRow key={student.id} className="even:bg-slate-50/50 dark:even:bg-slate-800/10 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 dark:border-slate-800 transition-colors">
                                        <TableCell className="font-bold pl-6">
                                            <Link
                                                href={`/students/${student.id}`}
                                                className="text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
                                            >
                                                {student.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="dark:text-slate-300 font-medium">{student.branch?.name || '-'}</TableCell>
                                        <TableCell>
                                            {student.formatted_track ? (
                                                <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black border dark:border-slate-700 uppercase tracking-tight">
                                                    {student.formatted_track}
                                                </span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {student.groups.map((g) => (
                                                    <span key={g.id} className="inline-flex items-center rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border dark:border-slate-700 shadow-xs">
                                                        {g.name}
                                                    </span>
                                                ))}
                                                {student.groups.length === 0 && (
                                                    <span className="text-xs text-muted-foreground italic dark:text-slate-500">Not Enrolled</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-1.5">
                                                <Link href={`/students/${student.id}`}>
                                                    <Button variant="ghost" size="icon" title="View Student" className="size-8 cursor-pointer text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors rounded-lg">
                                                        <Eye className="size-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Transfer Student"
                                                    className="size-8 cursor-pointer text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors rounded-lg"
                                                    onClick={() => setTransferringStudent(student)}
                                                >
                                                    <ArrowRightLeft className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Edit Student"
                                                    className="size-8 cursor-pointer text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg"
                                                    onClick={() => setEditingStudent(student)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Delete Student"
                                                    className="size-8 cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors rounded-lg"
                                                    onClick={() => setDeletingStudent(student)}
                                                >
                                                    <Trash className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center text-muted-foreground italic dark:text-slate-500">No students found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {students.links && students.links.length > 3 && (
                            <div className="py-4 px-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
                                <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                                    Showing <span className="text-slate-900 dark:text-white">{students.from}-{students.to}</span> of <span className="text-slate-900 dark:text-white">{students.total}</span> students
                                </div>
                                <div className="flex flex-wrap justify-center gap-1">
                                    {students.links.map((link: any, i: number) => (
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
                    title="Delete Student"
                    description={`Are you sure you want to delete ${deletingStudent?.name}? This action cannot be undone.`}
                />
            </div>
        </AppLayout>
    );
}
