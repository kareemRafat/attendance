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
import { Plus, Pencil, Trash, ArrowRightLeft, UserPlus } from 'lucide-react';

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
    students: Student[];
    availableGroups: Group[];
}

export default function StudentsIndex({ students, availableGroups }: Props) {
    const breadcrumbs = [{ title: 'Students', href: '/students' }];

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [enrollingStudent, setEnrollingStudent] = useState<Student | null>(
        null,
    );
    const [transferringStudent, setTransferringStudent] =
        useState<Student | null>(null);

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
        group_id: '',
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

    const submitEnroll = (e: React.FormEvent) => {
        e.preventDefault();
        if (!enrollingStudent) return;
        post(`/students/${enrollingStudent.id}/enroll`, {
            onSuccess: () => {
                setEnrollingStudent(null);
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
                            Manage students, enrollments, and transfers.
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
                                {students.map((student) => (
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
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Enroll in Group"
                                                    onClick={() => {
                                                        setEnrollingStudent(
                                                            student,
                                                        );
                                                        setData(
                                                            'name',
                                                            student.name,
                                                        );
                                                    }}
                                                >
                                                    <UserPlus className="size-4 text-green-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Transfer Student"
                                                    onClick={() => {
                                                        setTransferringStudent(
                                                            student,
                                                        );
                                                        setData(
                                                            'name',
                                                            student.name,
                                                        );
                                                    }}
                                                >
                                                    <ArrowRightLeft className="size-4 text-orange-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
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
                                                    onClick={() =>
                                                        deleteStudent(student)
                                                    }
                                                >
                                                    <Trash className="size-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.length === 0 && (
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

                {/* Enroll Dialog */}
                <Dialog
                    open={!!enrollingStudent}
                    onOpenChange={(open) => !open && setEnrollingStudent(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enroll Student</DialogTitle>
                            <DialogDescription>
                                Add {enrollingStudent?.name} to a group.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitEnroll} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="group_id">Select Group</Label>
                                <Select
                                    onValueChange={(val) =>
                                        setData('group_id', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a group" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                {errors.group_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.group_id}
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    Enroll
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
            </div>
        </AppLayout>
    );
}
