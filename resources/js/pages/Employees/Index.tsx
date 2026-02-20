import { Head, useForm } from '@inertiajs/react';
import {
    Plus,
    Pencil,
    Users,
    Mail,
    Lock,
    Building2,
    Shield,
    Loader2,
    Trash2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';

interface Branch {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    name: string;
    email: string;
    branch_id: number | null;
    role: string;
    branch?: Branch;
}

interface Props {
    employees: Employee[];
    branches: Branch[];
}

export default function EmployeesIndex({ employees, branches }: Props) {
    const breadcrumbs = [{ title: 'Employees', href: '/employees' }];

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(
        null,
    );
    const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
        null,
    );

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        branch_id: '',
        role: 'employee',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        branch_id: '',
        role: '',
    });

    useEffect(() => {
        if (editingEmployee) {
            editForm.setData({
                name: editingEmployee.name,
                email: editingEmployee.email,
                password: '',
                branch_id: editingEmployee.branch_id?.toString() || '',
                role: editingEmployee.role,
            });
            editForm.clearErrors();
        }
    }, [editingEmployee]);

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/employees', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;
        editForm.put(`/employees/${editingEmployee.id}`, {
            onSuccess: () => {
                setEditingEmployee(null);
                editForm.reset();
            },
        });
    };

    const confirmDelete = () => {
        if (!deletingEmployee) return;
        createForm.delete(`/employees/${deletingEmployee.id}`, {
            onSuccess: () => setDeletingEmployee(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />

            <div className="mx-auto flex w-full flex-col gap-8 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Employee Management
                        </h1>
                        <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">
                            Manage staff members and their access roles.
                        </p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer gap-2 shadow-lg shadow-indigo-500/20">
                                <Plus className="size-4" /> New Employee
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Employee</DialogTitle>
                                <DialogDescription>
                                    Create a new account for a staff member.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submitCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. John Doe"
                                        value={createForm.data.name}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-xs text-red-500">
                                            {createForm.errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="e.g. john@example.com"
                                        value={createForm.data.email}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {createForm.errors.email && (
                                        <p className="text-xs text-red-500">
                                            {createForm.errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={createForm.data.password}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {createForm.errors.password && (
                                        <p className="text-xs text-red-500">
                                            {createForm.errors.password}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="branch">Branch</Label>
                                        <Select
                                            value={createForm.data.branch_id}
                                            onValueChange={(val) =>
                                                createForm.setData(
                                                    'branch_id',
                                                    val,
                                                )
                                            }
                                        >
                                            <SelectTrigger id="branch">
                                                <SelectValue placeholder="Select Branch" />
                                            </SelectTrigger>
                                            <SelectContent>
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
                                        {createForm.errors.branch_id && (
                                            <p className="text-xs text-red-500">
                                                {createForm.errors.branch_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={createForm.data.role}
                                            onValueChange={(val) =>
                                                createForm.setData('role', val)
                                            }
                                        >
                                            <SelectTrigger id="role">
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="employee">
                                                    Employee
                                                </SelectItem>
                                                <SelectItem value="admin">
                                                    Admin
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {createForm.errors.role && (
                                            <p className="text-xs text-red-500">
                                                {createForm.errors.role}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="w-full cursor-pointer"
                                    >
                                        {createForm.processing ? (
                                            <>
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {employees.map((employee) => (
                        <Card
                            key={employee.id}
                            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                                <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                                    <Users className="size-6" />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                                        onClick={() =>
                                            setEditingEmployee(employee)
                                        }
                                    >
                                        <Pencil className="size-4 text-slate-500" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 cursor-pointer rounded-xl hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
                                        onClick={() =>
                                            setDeletingEmployee(employee)
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-2">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {employee.name}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                        <Mail className="size-3.5" />
                                        {employee.email}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                                        <span className="flex items-center gap-1.5 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                            <Building2 className="size-3" />{' '}
                                            Branch
                                        </span>
                                        <span className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                                            {employee.branch?.name || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                                        <span className="flex items-center gap-1.5 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                            <Shield className="size-3" /> Role
                                        </span>
                                        <span className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-700 capitalize dark:text-slate-200">
                                            <span
                                                className={`size-2 rounded-full ${employee.role === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            />
                                            {employee.role}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Edit Modal */}
                <Dialog
                    open={!!editingEmployee}
                    onOpenChange={(open) => !open && setEditingEmployee(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Employee</DialogTitle>
                            <DialogDescription>
                                Update staff information or change access roles.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) =>
                                        editForm.setData('name', e.target.value)
                                    }
                                    required
                                />
                                {editForm.errors.name && (
                                    <p className="text-xs text-red-500">
                                        {editForm.errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">
                                    Email Address
                                </Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                {editForm.errors.email && (
                                    <p className="text-xs text-red-500">
                                        {editForm.errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-password">
                                    Password (leave blank to keep current)
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="edit-password"
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <Lock className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
                                </div>
                                {editForm.errors.password && (
                                    <p className="text-xs text-red-500">
                                        {editForm.errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-branch">Branch</Label>
                                    <Select
                                        value={editForm.data.branch_id}
                                        onValueChange={(val) =>
                                            editForm.setData('branch_id', val)
                                        }
                                    >
                                        <SelectTrigger id="edit-branch">
                                            <SelectValue placeholder="Select Branch" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                    {editForm.errors.branch_id && (
                                        <p className="text-xs text-red-500">
                                            {editForm.errors.branch_id}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select
                                        value={editForm.data.role}
                                        onValueChange={(val) =>
                                            editForm.setData('role', val)
                                        }
                                    >
                                        <SelectTrigger id="edit-role">
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="employee">
                                                Employee
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {editForm.errors.role && (
                                        <p className="text-xs text-red-500">
                                            {editForm.errors.role}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="w-full cursor-pointer"
                                >
                                    {editForm.processing ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        'Update Account'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <DeleteConfirmationDialog
                    isOpen={!!deletingEmployee}
                    onClose={() => setDeletingEmployee(null)}
                    onConfirm={confirmDelete}
                    title="Delete Employee"
                    description={`Are you sure you want to delete ${deletingEmployee?.name}? This will permanently remove their access to the system.`}
                />
            </div>
        </AppLayout>
    );
}
