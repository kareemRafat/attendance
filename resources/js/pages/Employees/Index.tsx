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
    const breadcrumbs = [{ title: 'الموظفون', href: '/employees' }];

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
            <Head title="الموظفون" />

            <div className="mx-auto flex w-full flex-col gap-8 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            إدارة الموظفين
                        </h1>
                        <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">
                            إدارة أعضاء الفريق وصلاحيات وصولهم.
                        </p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer gap-2 shadow-lg shadow-indigo-500/20">
                                <Plus className="size-4" /> موظف جديد
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>إضافة موظف جديد</DialogTitle>
                                <DialogDescription>
                                    إنشاء حساب جديد لعضو في الفريق.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submitCreate} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="name">الاسم بالكامل</Label>
                                    <Input
                                        id="name"
                                        placeholder="مثال: أحمد محمد"
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
                                <div className="space-y-3">
                                    <Label htmlFor="email">البريد الإلكتروني</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="example@domain.com"
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
                                <div className="space-y-3">
                                    <Label htmlFor="password">كلمة المرور</Label>
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
                                    <div className="space-y-3">
                                        <Label htmlFor="branch">الفرع</Label>
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
                                                <SelectValue placeholder="اختر الفرع" />
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
                                    <div className="space-y-3">
                                        <Label htmlFor="role">الصلاحية</Label>
                                        <Select
                                            value={createForm.data.role}
                                            onValueChange={(val) =>
                                                createForm.setData('role', val)
                                            }
                                        >
                                            <SelectTrigger id="role">
                                                <SelectValue placeholder="اختر الصلاحية" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="employee">
                                                    موظف
                                                </SelectItem>
                                                <SelectItem value="admin">
                                                    مدير
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
                                                <Loader2 className="ms-2 size-4 animate-spin" />
                                                جاري الإنشاء...
                                            </>
                                        ) : (
                                            'إنشاء الحساب'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20">
                            <TableRow className="dark:border-slate-800">
                                <TableHead className="px-6 py-4 text-start font-bold text-slate-900 dark:text-slate-300">
                                    الموظف
                                </TableHead>
                                <TableHead className="text-start font-bold text-slate-900 dark:text-slate-300">
                                    الفرع
                                </TableHead>
                                <TableHead className="text-start font-bold text-slate-900 dark:text-slate-300">
                                    الصلاحية
                                </TableHead>
                                <TableHead className="px-6 text-end font-bold text-slate-900 dark:text-slate-300">
                                    الإجراءات
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((employee) => (
                                <TableRow
                                    key={employee.id}
                                    className="dark:border-slate-800"
                                >
                                    <TableCell className="px-6 py-4 text-start">
                                        <div className="flex items-center gap-3 text-start">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                                                <Users className="size-5" />
                                            </div>
                                            <div className="flex flex-col text-start">
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {employee.name}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {employee.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-start">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="size-4 text-slate-400" />
                                            <span className="font-medium text-slate-700 dark:text-slate-200">
                                                {employee.branch?.name || 'غير محدد'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-start">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize',
                                                employee.role === 'admin'
                                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
                                            )}
                                        >
                                            <Shield className="size-3" />
                                            {employee.role === 'admin' ? 'مدير' : 'موظف'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 text-end">
                                        <div className="flex justify-end gap-2">
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
                                                    setDeletingEmployee(
                                                        employee,
                                                    )
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {employees.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-24 text-center text-slate-400 italic"
                                    >
                                        لم يتم العثور على موظفين.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Modal */}
                <Dialog
                    open={!!editingEmployee}
                    onOpenChange={(open) => !open && setEditingEmployee(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>تعديل بيانات الموظف</DialogTitle>
                            <DialogDescription>
                                تحديث معلومات الموظف أو تغيير صلاحيات الوصول.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="edit-name">الاسم بالكامل</Label>
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
                            <div className="space-y-3">
                                <Label htmlFor="edit-email">
                                    البريد الإلكتروني
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
                            <div className="space-y-3">
                                <Label htmlFor="edit-password">
                                    كلمة المرور (اتركها فارغة للإبقاء على الحالية)
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
                                    <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                </div>
                                {editForm.errors.password && (
                                    <p className="text-xs text-red-500">
                                        {editForm.errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label htmlFor="edit-branch">الفرع</Label>
                                    <Select
                                        value={editForm.data.branch_id}
                                        onValueChange={(val) =>
                                            editForm.setData('branch_id', val)
                                        }
                                    >
                                        <SelectTrigger id="edit-branch">
                                            <SelectValue placeholder="اختر الفرع" />
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
                                <div className="space-y-3">
                                    <Label htmlFor="edit-role">الصلاحية</Label>
                                    <Select
                                        value={editForm.data.role}
                                        onValueChange={(val) =>
                                            editForm.setData('role', val)
                                        }
                                    >
                                        <SelectTrigger id="edit-role">
                                            <SelectValue placeholder="اختر الصلاحية" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="employee">
                                                موظف
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                مدير
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
                                            <Loader2 className="ms-2 size-4 animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        'تحديث الحساب'
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
                    title="حذف الموظف"
                    description={`هل أنت متأكد من حذف الموظف ${deletingEmployee?.name}؟ سيؤدي هذا إلى إزالة صلاحية وصوله إلى النظام بشكل نهائي.`}
                />
            </div>
        </AppLayout>
    );
}
