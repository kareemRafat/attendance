import { Head, useForm, router } from '@inertiajs/react';
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
import { Plus, Pencil, Trash, ArrowRightLeft, UserPlus, Eye } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

interface Group {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    branch?: { name: string };
    groups: Group[];
}

interface Props {
    students: {
        data: Student[];
        links: any[];
    };
    availableGroups: Group[];
}

export default function StudentsIndex({ students, availableGroups }: Props) {
    const breadcrumbs = [{ title: 'Students', href: '/students' }];

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [transferringStudent, setTransferringStudent] =
        useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        name: '',
        from_group_id: '',
        to_group_id: '',
        effective_date: new Date().toISOString().split('T')[0],
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/students', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;
        put(`/students/${editingStudent.id}`, {
            onSuccess: () => {
                setEditingStudent(null);
                reset();
            },
        });
    };

    const submitTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferringStudent) return;
        post(`/students/${transferringStudent.id}/transfer`, {
            onSuccess: () => {
                setTransferringStudent(null);
                reset();
            },
        });
    };

    const confirmDelete = () => {
        if (!deletingStudent) return;
        destroy(`/students/${deletingStudent.id}`, {
            onSuccess: () => {
                setDeletingStudent(null);
            },
        });
    };

    const deleteStudent = (student: Student) => {
        if (confirm('Are you sure you want to delete this student?')) {
            destroy(`/students/${student.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Students</h1>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="size-4" /> Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Student</DialogTitle>
                                <DialogDescription>
                                    Create a new student record.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submitCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        Create Student
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Students</CardTitle>
                        <CardDescription>
                            Manage students and their transfers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Current Groups</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">
                                            {student.name}
                                        </TableCell>
                                        <TableCell>
                                            {student.branch?.name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {student.groups.map((g) => (
                                                    <span
                                                        key={g.id}
                                                        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset"
                                                    >
                                                        {g.name}
                                                    </span>
                                                ))}
                                                {student.groups.length ===
                                                    0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Not Enrolled
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/students/${student.id}`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="View Student"
                                                        className="cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                                    >
                                                        <Eye className="size-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Transfer Student"
                                                    className="cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                                    onClick={() => {
                                                        setTransferringStudent(
                                                            student,
                                                        );
                                                        setData({
                                                            ...data,
                                                            name: student.name,
                                                            from_group_id:
                                                                student.groups
                                                                    .length ===
                                                                1
                                                                    ? student.groups[0].id.toString()
                                                                    : '',
                                                            to_group_id: '',
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
                                                        setEditingStudent(
                                                            student,
                                                        );
                                                        setData(
                                                            'name',
                                                            student.name,
                                                        );
                                                    }}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    onClick={() =>
                                                        setDeletingStudent(student)
                                                    }
                                                >
                                                    <Trash className="size-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {students.links && students.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap justify-center gap-1">
                                {students.links.map((link: any, i: number) => (
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
                                            className={
                                                !link.url
                                                    ? 'pointer-events-none opacity-50'
                                                    : 'cursor-pointer'
                                            }
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog
                    open={!!editingStudent}
                    onOpenChange={(open) => !open && setEditingStudent(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Student</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    Update Student
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Transfer Dialog */}
                <Dialog
                    open={!!transferringStudent}
                    onOpenChange={(open) =>
                        !open && setTransferringStudent(null)
                    }
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Transfer Student</DialogTitle>
                            <DialogDescription>
                                Transfer {transferringStudent?.name} to another
                                group.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitTransfer} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="from_group_id">
                                        From Group
                                    </Label>
                                    <Select
                                        value={data.from_group_id}
                                        onValueChange={(val) =>
                                            setData('from_group_id', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Current Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transferringStudent?.groups.map(
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
                                    {errors.from_group_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.from_group_id}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="to_group_id">
                                        To Group
                                    </Label>
                                    <Select
                                        value={data.to_group_id}
                                        onValueChange={(val) =>
                                            setData('to_group_id', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Target Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableGroups
                                                .filter(
                                                    (g) =>
                                                        g.id.toString() !==
                                                        data.from_group_id,
                                                )
                                                .map((group) => (
                                                    <SelectItem
                                                        key={group.id}
                                                        value={group.id.toString()}
                                                    >
                                                        {group.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.to_group_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.to_group_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="effective_date">
                                    Effective Date
                                </Label>
                                <Input
                                    id="effective_date"
                                    type="date"
                                    value={data.effective_date}
                                    onChange={(e) =>
                                        setData(
                                            'effective_date',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                {errors.effective_date && (
                                    <p className="text-sm text-red-500">
                                        {errors.effective_date}
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    Transfer Student
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <DeleteConfirmationDialog
                    isOpen={!!deletingStudent}
                    onClose={() => setDeletingStudent(null)}
                    onConfirm={confirmDelete}
                    processing={processing}
                    title="Delete Student"
                    description={`Are you sure you want to delete ${deletingStudent?.name}? This action cannot be undone.`}
                />
            </div>
        </AppLayout>
    );
}
