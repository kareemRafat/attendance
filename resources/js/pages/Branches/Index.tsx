import { Head, useForm } from '@inertiajs/react';
import {
    Plus,
    Pencil,
    Building2,
    MapPin,
    Users,
    Library,
    Loader2,
} from 'lucide-react';
import { useState } from 'react';
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
import AppLayout from '@/layouts/app-layout';

interface Branch {
    id: number;
    name: string;
    location: string | null;
    groups_count: number;
    users_count: number;
}

interface Props {
    branches: Branch[];
}

export default function BranchesIndex({ branches }: Props) {
    const breadcrumbs = [{ title: 'الفروع', href: '/branches' }];

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

    const createForm = useForm({
        name: '',
        location: '',
    });

    const editForm = useForm({
        name: '',
        location: '',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/branches', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBranch) return;
        editForm.put(`/branches/${editingBranch.id}`, {
            onSuccess: () => {
                setEditingBranch(null);
                editForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الفروع" />

            <div className="mx-auto flex w-full flex-col gap-8 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            إدارة الفروع
                        </h1>
                        <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">
                            نظرة عامة وإعداد مواقع الأكاديمية الخاصة بك.
                        </p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer gap-2 shadow-lg shadow-indigo-500/20">
                                <Plus className="size-4" /> فرع جديد
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>إضافة فرع جديد</DialogTitle>
                                <DialogDescription>
                                    إنشاء موقع جديد للأكاديمية الخاصة بك.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submitCreate} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="name">اسم الفرع</Label>
                                    <Input
                                        id="name"
                                        placeholder="مثال: الفرع الرئيسي"
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
                                    <Label htmlFor="location">الموقع</Label>
                                    <Input
                                        id="location"
                                        placeholder="مثال: وسط المدينة"
                                        value={createForm.data.location}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'location',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {createForm.errors.location && (
                                        <p className="text-xs text-red-500">
                                            {createForm.errors.location}
                                        </p>
                                    )}
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
                                            'إنشاء الفرع'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {branches.map((branch) => (
                        <div key={branch.id}>
                            <Card className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900">
                                <CardHeader className="border-b border-blue-100/50 bg-blue-50/50 p-6 pb-4 dark:border-blue-900/20 dark:bg-blue-900/10">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="rounded-2xl bg-white p-2.5 text-blue-600 shadow-sm ring-1 ring-blue-100 dark:bg-slate-800 dark:text-blue-400 dark:ring-blue-900/30">
                                            <Building2 className="size-6" />
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="h-9 w-9 cursor-pointer rounded-xl border border-blue-100 bg-white text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-600 dark:border-blue-900/30 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                                            onClick={() => {
                                                setEditingBranch(branch);
                                                editForm.setData({
                                                    name: branch.name,
                                                    location:
                                                        branch.location || '',
                                                });
                                            }}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                    </div>
                                    <CardTitle className="text-2xl leading-tight font-black text-slate-900 dark:text-white">
                                        {branch.name}
                                    </CardTitle>
                                    <div className="mt-2 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                        <MapPin className="size-4 text-blue-400 dark:text-blue-500" />
                                        <span className="line-clamp-1 text-sm font-medium">
                                            {branch.location ||
                                                'مكتب عن بعد / افتراضي'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-6 pb-8">
                                    <div className="mt-2 grid grid-cols-2 gap-4">
                                        <div className="flex flex-col rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 dark:border-indigo-900/20 dark:bg-indigo-900/10">
                                            <span className="mb-1 text-[10px] font-black tracking-[0.15em] text-indigo-400 uppercase dark:text-indigo-500">
                                                المجموعات النشطة
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-indigo-700 dark:text-indigo-400">
                                                    {branch.groups_count}
                                                </span>
                                                <Library className="size-4 text-indigo-300 dark:text-indigo-600" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col rounded-2xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/20 dark:bg-blue-900/10">
                                            <span className="mb-1 text-[10px] font-black tracking-[0.15em] text-blue-400 uppercase dark:text-blue-500">
                                                الموظفون
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-blue-700 dark:text-blue-400">
                                                    {branch.users_count}
                                                </span>
                                                <Users className="size-4 text-blue-300 dark:text-blue-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-start">
                                        <div className="flex -space-x-2">
                                            {[
                                                ...Array(
                                                    Math.min(
                                                        branch.users_count,
                                                        3,
                                                    ),
                                                ),
                                            ].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 dark:border-slate-900 dark:bg-slate-800"
                                                >
                                                    <Users className="size-3 text-slate-400 dark:text-slate-500" />
                                                </div>
                                            ))}
                                            {branch.users_count > 3 && (
                                                <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-slate-50 text-[10px] font-bold text-slate-500 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-400">
                                                    +{branch.users_count - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="ms-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                            إجمالي عدد الموظفين:{' '}
                                            {branch.users_count}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}

                    {branches.length === 0 && (
                        <div className="col-span-full rounded-[2.5rem] border-4 border-dotted border-slate-100 bg-slate-50/30 py-24 text-center dark:border-slate-800 dark:bg-slate-900/20">
                            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-white shadow-sm dark:bg-slate-800">
                                <Building2 className="size-10 text-slate-200 dark:text-slate-700" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                وسع شبكتك
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm font-medium text-slate-500 dark:text-slate-400">
                                لم يتم إنشاء أي فروع بعد. هل أنت مستعد لافتتاح
                                أول موقع أكاديمي فعلي أو افتراضي؟
                            </p>
                            <Button
                                variant="outline"
                                className="mt-8 h-12 cursor-pointer rounded-xl border-indigo-200 px-8 font-bold text-indigo-600 transition-all hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                                onClick={() => setIsCreateOpen(true)}
                            >
                                <Plus className="ms-2 size-5" /> ابدأ الفرع
                                الأول
                            </Button>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                <Dialog
                    open={!!editingBranch}
                    onOpenChange={(open) => !open && setEditingBranch(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>تعديل الفرع</DialogTitle>
                            <DialogDescription>
                                تحديث تفاصيل موقع هذا الفرع.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="edit-name">اسم الفرع</Label>
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
                                <Label htmlFor="edit-location">الموقع</Label>
                                <Input
                                    id="edit-location"
                                    value={editForm.data.location}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'location',
                                            e.target.value,
                                        )
                                    }
                                />
                                {editForm.errors.location && (
                                    <p className="text-xs text-red-500">
                                        {editForm.errors.location}
                                    </p>
                                )}
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
                                            جاري حفظ التغييرات...
                                        </>
                                    ) : (
                                        'حفظ التغييرات'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
