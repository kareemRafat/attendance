import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { Plus, Pencil, Trash, ArrowRightLeft, Eye } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

interface Branch {
    id: number;
    name: string;
}

interface Group {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
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
}

export default function StudentsIndex({
    students,
    availableGroups,
    availableBranches,
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

    // Quick Add Form
    const quickAdd = useForm({
        name: '',
        branch_id: isAdmin ? '' : user.branch_id?.toString() || '',
        group_id: '',
    });

    // Mass Add Form
    const massAdd = useForm({
        branch_id: isAdmin ? '' : user.branch_id?.toString() || '',
        group_id: '',
        students: [
            { name: '', details: '' },
            { name: '', details: '' },
            { name: '', details: '' },
        ],
    });

    // Edit Form
    const editForm = useForm({
        name: '',
    });

    // Transfer Form
    const transferForm = useForm({
        from_group_id: '',
        to_group_id: '',
        effective_date: new Date().toISOString().split('T')[0],
        reason: '',
    });

    const submitQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        quickAdd.post('/students', {
            onSuccess: () => {
                setIsCreateOpen(false);
                quickAdd.reset();
            },
        });
    };

    const submitMassAdd = (e: React.FormEvent) => {
        e.preventDefault();
        massAdd.post('/students', {
            onSuccess: () => {
                setIsMassAddOpen(false);
                massAdd.reset();
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

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;
        editForm.put(`/students/${editingStudent.id}`, {
            onSuccess: () => {
                setEditingStudent(null);
                editForm.reset();
            },
        });
    };

    const submitTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferringStudent) return;
        transferForm.post(`/students/${transferringStudent.id}/transfer`, {
            onSuccess: () => {
                setTransferringStudent(null);
                transferForm.reset();
            },
        });
    };

    const confirmDelete = () => {
        if (!deletingStudent) return;
        router.delete(`/students/${deletingStudent.id}`, {
            onSuccess: () => {
                setDeletingStudent(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Students</h1>
                    <div className="flex gap-2">
                        {/* Mass Add Button & Dialog */}
                        <Dialog
                            open={isMassAddOpen}
                            onOpenChange={setIsMassAddOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="gap-2 border-dashed cursor-pointer"
                                >
                                    <Plus className="size-4" /> Add Students
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add Multiple Students</DialogTitle>
                                    <DialogDescription>
                                        Add multiple students at once. You can
                                        optionally enroll them in a group.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={submitMassAdd}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        {isAdmin && (
                                            <div className="space-y-2 pb-4 border-b border-slate-200">
                                                <Label htmlFor="mass-branch-id">
                                                    Select Branch
                                                </Label>
                                                <Select
                                                    value={massAdd.data.branch_id}
                                                    onValueChange={(val) =>
                                                        massAdd.setData('branch_id', val)
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Choose a branch" />
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
                                                {massAdd.errors.branch_id && (
                                                    <p className="text-sm text-red-500">
                                                        {massAdd.errors.branch_id}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label htmlFor="mass-group-id">
                                                Enroll in Group
                                            </Label>
                                            <Select
                                                value={massAdd.data.group_id}
                                                onValueChange={(val) =>
                                                    massAdd.setData('group_id', val)
                                                }
                                            >
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Choose a group for all students" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableGroups.map(
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
                                                <p className="text-sm text-red-500">
                                                    {massAdd.errors.group_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-12 gap-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <div className="col-span-11">Name</div>
                                            <div className="col-span-1" />
                                        </div>
                                        <div className="space-y-3">
                                            {massAdd.data.students.map(
                                                (student, index) => (
                                                    <div
                                                        key={index}
                                                        className="grid grid-cols-12 gap-4 items-start"
                                                    >
                                                        <div className="col-span-11">
                                                            <Input
                                                                placeholder="Student name"
                                                                value={student.name}
                                                                onChange={(e) =>
                                                                    updateStudentRow(
                                                                        index,
                                                                        'name',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                required
                                                            />
                                                            {massAdd.errors[`students.${index}.name` as keyof typeof massAdd.errors] && (
                                                                <p className="text-[10px] text-red-500 mt-1">
                                                                    {massAdd.errors[`students.${index}.name` as keyof typeof massAdd.errors]}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="col-span-1 pt-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled={
                                                                    massAdd.data.students
                                                                        .length <=
                                                                    1
                                                                }
                                                                onClick={() =>
                                                                    removeStudentRow(
                                                                        index,
                                                                    )
                                                                }
                                                                className="hover:text-red-500 cursor-pointer"
                                                            >
                                                                <Trash className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addStudentRow}
                                            className="gap-2 cursor-pointer"
                                        >
                                            <Plus className="size-3" /> Add More
                                        </Button>
                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                disabled={massAdd.processing}
                                                className="cursor-pointer"
                                            >
                                                Create {massAdd.data.students.length}{' '}
                                                Student
                                                {massAdd.data.students.length !== 1
                                                    ? 's'
                                                    : ''}
                                            </Button>
                                        </DialogFooter>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Quick Add Button & Dialog */}
                        <Dialog
                            open={isCreateOpen}
                            onOpenChange={setIsCreateOpen}
                        >
                            <DialogTrigger asChild>
                                <Button className="gap-2 cursor-pointer" onClick={() => quickAdd.reset()}>
                                    <Plus className="size-4" /> Quick Add
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Student</DialogTitle>
                                    <DialogDescription>
                                        Create a new student record.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={submitQuickAdd}
                                    className="space-y-4"
                                >
                                    {isAdmin && (
                                        <div className="space-y-2">
                                            <Label htmlFor="branch_id">
                                                Branch
                                            </Label>
                                            <Select
                                                value={quickAdd.data.branch_id}
                                                onValueChange={(val) =>
                                                    quickAdd.setData('branch_id', val)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a branch" />
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
                                                <p className="text-sm text-red-500">
                                                    {quickAdd.errors.branch_id}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="quick-group-id">
                                            Enroll in Group
                                        </Label>
                                        <Select
                                            value={quickAdd.data.group_id}
                                            onValueChange={(val) =>
                                                quickAdd.setData('group_id', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableGroups.map(
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
                                            <p className="text-sm text-red-500">
                                                {quickAdd.errors.group_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={quickAdd.data.name}
                                            onChange={(e) =>
                                                quickAdd.setData('name', e.target.value)
                                            }
                                            required
                                        />
                                        {quickAdd.errors.name && (
                                            <p className="text-sm text-red-500">
                                                {quickAdd.errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            disabled={quickAdd.processing}
                                            className="cursor-pointer"
                                        >
                                            Create Student
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Students</CardTitle>
                        <CardDescription>Manage students and their transfers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Current Groups</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                href={`/students/${student.id}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                            >
                                                {student.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{student.branch?.name || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {student.groups.map((g) => (
                                                    <span key={g.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                                                        {g.name}
                                                    </span>
                                                ))}
                                                {student.groups.length === 0 && (
                                                    <span className="text-xs text-muted-foreground">Not Enrolled</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/students/${student.id}`}>
                                                    <Button variant="ghost" size="icon" title="View Student" className="cursor-pointer hover:bg-slate-100 transition-colors">
                                                        <Eye className="size-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Transfer Student"
                                                    className="cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                                    onClick={() => {
                                                        setTransferringStudent(student);
                                                        transferForm.setData({
                                                            from_group_id: student.groups.length === 1 ? student.groups[0].id.toString() : '',
                                                            to_group_id: '',
                                                            effective_date: new Date().toISOString().split('T')[0],
                                                            reason: '',
                                                        });
                                                    }}
                                                >
                                                    <ArrowRightLeft className="size-4 text-orange-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                    onClick={() => {
                                                        setEditingStudent(student);
                                                        editForm.setData('name', student.name);
                                                    }}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    onClick={() => setDeletingStudent(student)}
                                                >
                                                    <Trash className="size-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No students found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {students.links && students.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap justify-center gap-1">
                                {students.links.map((link: any, i: number) => (
                                    <Link key={i} href={link.url || '#'} preserveScroll>
                                        <Button
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            className={!link.url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Student</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                                {editForm.errors.name && <p className="text-sm text-red-500">{editForm.errors.name}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={editForm.processing} className="cursor-pointer">Update Student</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Transfer Dialog */}
                <Dialog open={!!transferringStudent} onOpenChange={(open) => !open && setTransferringStudent(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Transfer Student</DialogTitle>
                            <DialogDescription>Transfer {transferringStudent?.name} to another group.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitTransfer} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="from_group_id">From Group</Label>
                                    <Select value={transferForm.data.from_group_id} onValueChange={(val) => transferForm.setData('from_group_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Current Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transferringStudent?.groups.map((group) => (
                                                <SelectItem key={group.id} value={group.id.toString()}>{group.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="to_group_id">To Group</Label>
                                    <Select value={transferForm.data.to_group_id} onValueChange={(val) => transferForm.setData('to_group_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Target Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableGroups.filter((g) => g.id.toString() !== transferForm.data.from_group_id).map((group) => (
                                                <SelectItem key={group.id} value={group.id.toString()}>{group.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="effective_date">Effective Date</Label>
                                <Input
                                    id="effective_date"
                                    type="date"
                                    value={transferForm.data.effective_date}
                                    onChange={(e) => transferForm.setData('effective_date', e.target.value)}
                                    required
                                />
                                {transferForm.errors.effective_date && <p className="text-sm text-red-500">{transferForm.errors.effective_date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason for Transfer</Label>
                                <Input
                                    id="reason"
                                    placeholder="Enter reason for transfer"
                                    value={transferForm.data.reason}
                                    onChange={(e) => transferForm.setData('reason', e.target.value)}
                                    required
                                />
                                {transferForm.errors.reason && <p className="text-sm text-red-500">{transferForm.errors.reason}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={transferForm.processing} className="cursor-pointer">Transfer Student</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <DeleteConfirmationDialog
                    isOpen={!!deletingStudent}
                    onClose={() => setDeletingStudent(null)}
                    onConfirm={confirmDelete}
                    processing={false}
                    title="Delete Student"
                    description={`Are you sure you want to delete ${deletingStudent?.name}? This action cannot be undone.`}
                />
            </div>
        </AppLayout>
    );
}
