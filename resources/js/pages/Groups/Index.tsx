import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import {
    Plus,
    Users,
    Calendar,
    CheckCircle,
    RotateCcw,
    Edit,
    Loader2,
    Search,
    Navigation,
} from 'lucide-react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import {
    end,
    reactivate,
    store,
    update,
} from '@/actions/App/Http/Controllers/GroupController';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { cn } from '@/lib/utils';

interface Branch {
    id: number;
    name: string;
}

interface DaysPatternOption {
    name: string;
    value: string;
}

interface Group {
    id: number;
    branch_id: number;
    name: string;
    pattern: string;
    formatted_pattern: string;
    start_date: string;
    max_lectures: number;
    is_active: boolean;
    students_count?: number;
    branch?: {
        name: string;
    };
}

interface Props {
    groups: {
        data: Group[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        from: number;
        to: number;
        total: number;
    };
    branches: Branch[];
    daysPatterns: DaysPatternOption[];
    currentTab: string;
    filters: {
        search?: string;
        branch_id?: string;
        pattern?: string;
    };
}

export default function GroupsIndex({
    groups,
    branches = [],
    daysPatterns = [],
    currentTab,
    filters,
}: Props) {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    const isAdmin = user.role === 'admin';

    const breadcrumbs = [{ title: 'المجموعات', href: '/groups' }];
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [finishingGroup, setFinishingGroup] = useState<Group | null>(null);
    const [reactivatingGroup, setReactivatingGroup] = useState<Group | null>(
        null,
    );

    // Search and Filter State
    const [search, setSearch] = useState(filters.search || '');
    const [branchFilter, setBranchFilter] = useState(
        filters.branch_id || 'all',
    );
    const [patternFilter, setPatternFilter] = useState(
        filters.pattern || 'all',
    );

    const handleFilter = (
        newSearch?: string,
        newBranch?: string,
        newPattern?: string,
    ) => {
        const query: any = { tab: currentTab };
        const s = newSearch !== undefined ? newSearch : search;
        const b = newBranch !== undefined ? newBranch : branchFilter;
        const p = newPattern !== undefined ? newPattern : patternFilter;

        if (s) query.search = s;
        if (b && b !== 'all') query.branch_id = b;
        if (p && p !== 'all') query.pattern = p;

        router.get('/groups', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const { post: postEnd, processing: finishing } = useForm();
    const { post: postReactivate, processing: reactivating } = useForm();

    const createForm = useForm({
        branch_id: branches.length > 0 ? branches[0].id : 0,
        name: '',
        pattern: daysPatterns.length > 0 ? daysPatterns[0].value : '',
        start_date: new Date().toISOString().split('T')[0],
        max_lectures: 45,
    });

    const editForm = useForm({
        branch_id: 0,
        name: '',
        pattern: '',
        start_date: '',
        max_lectures: 45,
    });

    const toggleStatus = (group: Group) => {
        if (group.is_active) {
            setFinishingGroup(group);
        } else {
            setReactivatingGroup(group);
        }
    };

    const handleConfirmFinish = () => {
        if (!finishingGroup) return;
        postEnd(end.url({ group: finishingGroup.id }), {
            onSuccess: () => setFinishingGroup(null),
        });
    };

    const handleConfirmReactivate = () => {
        if (!reactivatingGroup) return;
        postReactivate(reactivate.url({ group: reactivatingGroup.id }), {
            onSuccess: () => setReactivatingGroup(null),
        });
    };

    const handleCreateSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        createForm.post(store.url(), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditClick = (group: Group) => {
        setEditingGroup(group);
        editForm.setData({
            branch_id: group.branch_id,
            name: group.name,
            pattern: group.pattern,
            start_date: group.start_date ? group.start_date.split('T')[0] : '',
            max_lectures: group.max_lectures,
        });
    };

    const handleEditSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingGroup) return;

        editForm.put(update.url({ group: editingGroup.id }), {
            onSuccess: () => {
                setEditingGroup(null);
                editForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="المجموعات" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">إدارة المجموعات</h1>
                        <p className="text-sm text-muted-foreground">
                            إدارة مجموعات الدورات وحالاتها.
                        </p>
                    </div>
                    <Button
                        className="cursor-pointer gap-2"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="size-4" /> مجموعة جديدة
                    </Button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex gap-1 self-start rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                        <Link
                            href={`/groups?tab=active${branchFilter !== 'all' ? `&branch_id=${branchFilter}` : ''}${patternFilter !== 'all' ? `&pattern=${patternFilter}` : ''}${search ? `&search=${search}` : ''}`}
                            className={cn(
                                'flex cursor-pointer items-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
                                currentTab === 'active'
                                    ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                    : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                            )}
                        >
                            المجموعات النشطة
                        </Link>
                        <Link
                            href={`/groups?tab=closed${branchFilter !== 'all' ? `&branch_id=${branchFilter}` : ''}${patternFilter !== 'all' ? `&pattern=${patternFilter}` : ''}${search ? `&search=${search}` : ''}`}
                            className={cn(
                                'flex cursor-pointer items-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
                                currentTab === 'closed'
                                    ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                    : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                            )}
                        >
                            المجموعات المغلقة
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="search"
                                placeholder="بحث عن المجموعات..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    handleFilter(e.target.value);
                                }}
                                className="h-10 rounded-xl border-slate-200 bg-white pr-9 dark:border-slate-800 dark:bg-slate-900"
                            />
                        </div>

                        {/* Branch Filter (Admin Only) */}
                        {isAdmin && (
                            <Select
                                value={branchFilter}
                                onValueChange={(val) => {
                                    setBranchFilter(val);
                                    handleFilter(undefined, val);
                                }}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white sm:w-48 dark:border-slate-800 dark:bg-slate-900">
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

                        {/* Pattern Filter */}
                        <Select
                            value={patternFilter}
                            onValueChange={(val) => {
                                setPatternFilter(val);
                                handleFilter(undefined, undefined, val);
                            }}
                        >
                            <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white sm:w-48 dark:border-slate-800 dark:bg-slate-900">
                                <SelectValue placeholder="جميع الأيام" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الأيام</SelectItem>
                                {daysPatterns.map((pattern) => (
                                    <SelectItem
                                        key={pattern.value}
                                        value={pattern.value}
                                    >
                                        {pattern.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(search ||
                            (branchFilter && branchFilter !== 'all') ||
                            (patternFilter && patternFilter !== 'all')) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    setBranchFilter('all');
                                    setPatternFilter('all');
                                    handleFilter('', 'all', 'all');
                                }}
                                className="h-10 cursor-pointer rounded-xl px-4 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20"
                            >
                                إعادة تعيين
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {groups.data.map((group) => (
                        <div
                            key={group.id}
                            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900"
                        >
                            {/* Card Header Area */}
                            <div className="p-5 pb-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-2xl leading-tight font-extrabold text-slate-900 capitalize transition-colors group-hover:text-indigo-600 dark:text-white">
                                            {group.name}
                                        </h3>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            {/* <Building2 size={17} className='text-slate-700' /> */}
                                            <Navigation
                                                size={18}
                                                className="text-slate-700"
                                            />
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-sm font-bold tracking-wider text-blue-900 capitalize dark:bg-slate-800">
                                                {group.branch?.name}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEditClick(group)}
                                        className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-transparent text-slate-400 transition-all hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30"
                                    >
                                        <Edit className="size-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Card Body Area */}
                            <div className="p-5">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-base font-medium text-slate-600 dark:border-slate-800/50 dark:bg-slate-800/50 dark:text-slate-400">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm dark:bg-slate-800">
                                            <Calendar className="size-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold tracking-tight text-slate-400 uppercase">
                                                الجدول
                                            </span>
                                            <span className="text-slate-900 dark:text-slate-200">
                                                {group.formatted_pattern}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-base font-medium text-slate-600 dark:border-slate-800/50 dark:bg-slate-800/50 dark:text-slate-400">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-white text-emerald-500 shadow-sm dark:bg-slate-800">
                                            <Users className="size-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold tracking-tight text-slate-400 uppercase">
                                                المسجلين
                                            </span>
                                            <span className="text-slate-900 dark:text-slate-200">
                                                {group.students_count || 0} طلاب
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Area */}
                                <div className="mt-6 flex items-center gap-3">
                                    <Button
                                        variant={
                                            group.is_active
                                                ? 'outline'
                                                : 'default'
                                        }
                                        className={cn(
                                            'h-11 flex-1 cursor-pointer rounded-xl border-2 text-base font-bold transition-all',
                                            group.is_active
                                                ? 'border-slate-100 text-slate-600 hover:border-red-100 hover:bg-red-50 hover:text-red-600'
                                                : 'border-transparent bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700',
                                        )}
                                        onClick={() => toggleStatus(group)}
                                    >
                                        {group.is_active ? (
                                            <>
                                                <CheckCircle className="mr-2 size-5" />{' '}
                                                إنهاء المجموعة
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw className="mr-2 size-5" />{' '}
                                                إعادة تنشيط
                                            </>
                                        )}
                                    </Button>

                                    {group.is_active && (
                                        <Button
                                            asChild
                                            className="h-11 cursor-pointer rounded-xl bg-slate-900 px-6 text-base font-bold text-white shadow-lg shadow-slate-500/10 transition-all hover:bg-slate-800"
                                        >
                                            <Link
                                                href={`/groups/${group.id}${window.location.search}`}
                                            >
                                                الحضور
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {groups.data.length === 0 && (
                        <div className="col-span-full rounded-xl border bg-muted/20 py-24 text-center">
                            <p className="text-muted-foreground">
                                لم يتم العثور على مجموعات{' '}
                                {currentTab === 'active' ? 'نشطة' : 'مغلقة'}.
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {groups.links && groups.links.length > 3 && (
                    <div className="flex items-center justify-between rounded-xl border-t border-slate-100 bg-slate-50/30 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/10">
                        <div className="text-sm font-bold tracking-tight text-slate-500 uppercase dark:text-slate-400">
                            عرض{' '}
                            <span className="text-slate-900 dark:text-white">
                                {groups.from}-{groups.to}
                            </span>{' '}
                            من أصل{' '}
                            <span className="text-slate-900 dark:text-white">
                                {groups.total}
                            </span>{' '}
                            مجموعة
                        </div>
                        <div className="flex flex-wrap justify-center gap-1">
                            {groups.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    preserveScroll
                                >
                                    <Button
                                        variant={
                                            link.active ? 'default' : 'outline'
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
                                                __html:
                                                    link.label ===
                                                    '&laquo; Previous'
                                                        ? 'السابق'
                                                        : link.label ===
                                                            'Next &raquo;'
                                                          ? 'التالي'
                                                          : link.label,
                                            }}
                                        />
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            >
                <DialogContent>
                    <form onSubmit={handleCreateSubmit}>
                        <DialogHeader>
                            <DialogTitle>إنشاء مجموعة جديدة</DialogTitle>
                            <DialogDescription>
                                إضافة مجموعة دراسية جديدة لفرع معين.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-branch">الفرع</Label>
                                <Select
                                    value={createForm.data.branch_id.toString()}
                                    onValueChange={(v) =>
                                        createForm.setData(
                                            'branch_id',
                                            parseInt(v),
                                        )
                                    }
                                >
                                    <SelectTrigger id="create-branch">
                                        <SelectValue placeholder="اختر الفرع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(branches || []).map((branch) => (
                                            <SelectItem
                                                key={branch.id}
                                                value={branch.id.toString()}
                                            >
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={createForm.errors.branch_id}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-name">
                                    اسم المجموعة
                                </Label>
                                <Input
                                    id="create-name"
                                    value={createForm.data.name}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="مثال: فرونت إند G1"
                                />
                                <InputError message={createForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-pattern">
                                    نمط الأيام
                                </Label>
                                <Select
                                    value={createForm.data.pattern}
                                    onValueChange={(v) =>
                                        createForm.setData('pattern', v)
                                    }
                                >
                                    <SelectTrigger id="create-pattern">
                                        <SelectValue placeholder="اختر النمط" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(daysPatterns || []).map((pattern) => (
                                            <SelectItem
                                                key={pattern.value}
                                                value={pattern.value}
                                            >
                                                {pattern.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={createForm.errors.pattern}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-start-date">
                                        تاريخ البدء
                                    </Label>
                                    <Input
                                        id="create-start-date"
                                        type="date"
                                        value={createForm.data.start_date}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'start_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={createForm.errors.start_date}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-max-lectures">
                                        أقصى عدد محاضرات
                                    </Label>
                                    <Input
                                        id="create-max-lectures"
                                        type="number"
                                        value={createForm.data.max_lectures}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'max_lectures',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={createForm.errors.max_lectures}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                            >
                                {createForm.processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                إنشاء المجموعة
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Group Modal */}
            <Dialog
                open={!!editingGroup}
                onOpenChange={(open) => !open && setEditingGroup(null)}
            >
                <DialogContent>
                    <form onSubmit={handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle>تعديل المجموعة</DialogTitle>
                            <DialogDescription>
                                تحديث تفاصيل المجموعة.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-branch">الفرع</Label>
                                <Select
                                    value={editForm.data.branch_id.toString()}
                                    onValueChange={(v) =>
                                        editForm.setData(
                                            'branch_id',
                                            parseInt(v),
                                        )
                                    }
                                >
                                    <SelectTrigger id="edit-branch">
                                        <SelectValue placeholder="اختر الفرع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(branches || []).map((branch) => (
                                            <SelectItem
                                                key={branch.id}
                                                value={branch.id.toString()}
                                            >
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={editForm.errors.branch_id}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">اسم المجموعة</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) =>
                                        editForm.setData('name', e.target.value)
                                    }
                                />
                                <InputError message={editForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-pattern">نمط الأيام</Label>
                                <Select
                                    value={editForm.data.pattern}
                                    onValueChange={(v) =>
                                        editForm.setData('pattern', v)
                                    }
                                >
                                    <SelectTrigger id="edit-pattern">
                                        <SelectValue placeholder="اختر النمط" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(daysPatterns || []).map((pattern) => (
                                            <SelectItem
                                                key={pattern.value}
                                                value={pattern.value}
                                            >
                                                {pattern.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.pattern} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-start-date">
                                        تاريخ البدء
                                    </Label>
                                    <Input
                                        id="edit-start-date"
                                        type="date"
                                        value={editForm.data.start_date}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'start_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={editForm.errors.start_date}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-max-lectures">
                                        أقصى عدد محاضرات
                                    </Label>
                                    <Input
                                        id="edit-max-lectures"
                                        type="number"
                                        value={editForm.data.max_lectures}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'max_lectures',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={editForm.errors.max_lectures}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingGroup(null)}
                            >
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                {editForm.processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                حفظ التغييرات
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Finish Confirmation Modal */}
            <DeleteConfirmationDialog
                isOpen={!!finishingGroup}
                onClose={() => setFinishingGroup(null)}
                onConfirm={handleConfirmFinish}
                processing={finishing}
                title="إنهاء المجموعة"
                description={
                    <>
                        هل أنت متأكد من إنهاء المجموعة   "
                        <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                            {finishingGroup?.name}
                        </span>
                        " ؟ سيتم نقلها إلى قسم المجموعات المغلقة.
                    </>
                }
                confirmText="إنهاء المجموعة"
                confirmVariant="destructive"
                confirmSize="sm"
            />

            {/* Reactivate Confirmation Modal */}
            <DeleteConfirmationDialog
                isOpen={!!reactivatingGroup}
                onClose={() => setReactivatingGroup(null)}
                onConfirm={handleConfirmReactivate}
                processing={reactivating}
                title="إعادة تنشيط المجموعة"
                description={`هل أنت متأكد من إعادة تنشيط المجموعة "${reactivatingGroup?.name}"؟ سيتم إعادتها إلى قسم المجموعات النشطة.`}
                confirmText="إعادة تنشيط"
                confirmVariant="default"
                confirmSize="sm"
            />
        </AppLayout>
    );
}
