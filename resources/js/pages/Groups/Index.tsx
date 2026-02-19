import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Users, Calendar, CheckCircle, RotateCcw, Edit, Loader2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import { end, reactivate, store, update } from '@/actions/App/Http/Controllers/GroupController';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    };
    branches: Branch[];
    daysPatterns: DaysPatternOption[];
    currentTab: string;
}

export default function GroupsIndex({ groups, branches = [], daysPatterns = [], currentTab }: Props) {
    const breadcrumbs = [{ title: 'Groups', href: '/groups' }];
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [finishingGroup, setFinishingGroup] = useState<Group | null>(null);
    const [reactivatingGroup, setReactivatingGroup] = useState<Group | null>(null);

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
            <Head title="Groups" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Groups Management</h1>
                        <p className="text-sm text-muted-foreground">Manage your course groups and their status.</p>
                    </div>
                    <Button className="gap-2 cursor-pointer" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="size-4" /> New Group
                    </Button>
                </div>

                <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800 self-start">
                    <Link
                        href="/groups?tab=active"
                        className={cn(
                            'flex items-center rounded-md px-4 py-2 transition-colors text-sm font-medium cursor-pointer',
                            currentTab === 'active'
                                ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        Active Groups
                    </Link>
                    <Link
                        href="/groups?tab=closed"
                        className={cn(
                            'flex items-center rounded-md px-4 py-2 transition-colors text-sm font-medium cursor-pointer',
                            currentTab === 'closed'
                                ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        Closed Groups
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.data.map((group) => (
                        <Card key={group.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                                            {group.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            {group.branch?.name}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 text-muted-foreground cursor-pointer"
                                        onClick={() => handleEditClick(group)}
                                    >
                                        <Edit className="size-3.5" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1.5 font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-md">
                                        <Calendar className="size-3.5" />
                                        <span>{group.formatted_pattern}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md">
                                        <Users className="size-3.5" />
                                        <span>
                                            {group.students_count || 0} Students
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <Button
                                        variant={group.is_active ? "outline" : "default"}
                                        size="sm"
                                        className={cn(
                                            "flex-1 gap-1.5 cursor-pointer h-8 text-xs",
                                            group.is_active && "hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                        )}
                                        onClick={() => toggleStatus(group)}
                                    >
                                        {group.is_active ? (
                                            <>
                                                <CheckCircle className="size-3.5" />
                                                Finish
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw className="size-3.5" />
                                                Activate
                                            </>
                                        )}
                                    </Button>
                                    
                                    {group.is_active && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 h-8 text-xs cursor-pointer"
                                            asChild
                                        >
                                            <Link
                                                href={`/attendance?group_id=${group.id}`}
                                            >
                                                Attendance
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {groups.data.length === 0 && (
                        <div className="col-span-full rounded-xl border bg-muted/20 py-24 text-center">
                            <p className="text-muted-foreground">
                                No {currentTab} groups found.
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {groups.links && groups.links.length > 3 && (
                    <div className="py-4 flex flex-wrap justify-center gap-1">
                        {groups.links.map((link, i) => (
                            <Link key={i} href={link.url || '#'} preserveScroll>
                                <Button
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-3 ${!link.url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Button>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <form onSubmit={handleCreateSubmit}>
                        <DialogHeader>
                            <DialogTitle>Create New Group</DialogTitle>
                            <DialogDescription>
                                Add a new study group to a specific branch.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-branch">Branch</Label>
                                <Select
                                    value={createForm.data.branch_id.toString()}
                                    onValueChange={(v) => createForm.setData('branch_id', parseInt(v))}
                                >
                                    <SelectTrigger id="create-branch">
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(branches || []).map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.branch_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-name">Group Name</Label>
                                <Input
                                    id="create-name"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="e.g. Frontend G1"
                                />
                                <InputError message={createForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-pattern">Days Pattern</Label>
                                <Select
                                    value={createForm.data.pattern}
                                    onValueChange={(v) => createForm.setData('pattern', v)}
                                >
                                    <SelectTrigger id="create-pattern">
                                        <SelectValue placeholder="Select pattern" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(daysPatterns || []).map((pattern) => (
                                            <SelectItem key={pattern.value} value={pattern.value}>
                                                {pattern.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.pattern} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-start-date">Start Date</Label>
                                    <Input
                                        id="create-start-date"
                                        type="date"
                                        value={createForm.data.start_date}
                                        onChange={(e) => createForm.setData('start_date', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.start_date} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-max-lectures">Max Lectures</Label>
                                    <Input
                                        id="create-max-lectures"
                                        type="number"
                                        value={createForm.data.max_lectures}
                                        onChange={(e) => createForm.setData('max_lectures', parseInt(e.target.value))}
                                    />
                                    <InputError message={createForm.errors.max_lectures} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Group
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Group Modal */}
            <Dialog open={!!editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)}>
                <DialogContent>
                    <form onSubmit={handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Group</DialogTitle>
                            <DialogDescription>
                                Update the group details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-branch">Branch</Label>
                                <Select
                                    value={editForm.data.branch_id.toString()}
                                    onValueChange={(v) => editForm.setData('branch_id', parseInt(v))}
                                >
                                    <SelectTrigger id="edit-branch">
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(branches || []).map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.branch_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Group Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                />
                                <InputError message={editForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-pattern">Days Pattern</Label>
                                <Select
                                    value={editForm.data.pattern}
                                    onValueChange={(v) => editForm.setData('pattern', v)}
                                >
                                    <SelectTrigger id="edit-pattern">
                                        <SelectValue placeholder="Select pattern" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(daysPatterns || []).map((pattern) => (
                                            <SelectItem key={pattern.value} value={pattern.value}>
                                                {pattern.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.pattern} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-start-date">Start Date</Label>
                                    <Input
                                        id="edit-start-date"
                                        type="date"
                                        value={editForm.data.start_date}
                                        onChange={(e) => editForm.setData('start_date', e.target.value)}
                                    />
                                    <InputError message={editForm.errors.start_date} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-max-lectures">Max Lectures</Label>
                                    <Input
                                        id="edit-max-lectures"
                                        type="number"
                                        value={editForm.data.max_lectures}
                                        onChange={(e) => editForm.setData('max_lectures', parseInt(e.target.value))}
                                    />
                                    <InputError message={editForm.errors.max_lectures} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
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
                title="Finish Group"
                description={`Are you sure you want to finish the group "${finishingGroup?.name}"? This will move it to the closed groups section.`}
                confirmText="Finish Group"
                confirmVariant="destructive"
                confirmSize="sm"
            />

            {/* Reactivate Confirmation Modal */}
            <DeleteConfirmationDialog
                isOpen={!!reactivatingGroup}
                onClose={() => setReactivatingGroup(null)}
                onConfirm={handleConfirmReactivate}
                processing={reactivating}
                title="Reactivate Group"
                description={`Are you sure you want to reactivate the group "${reactivatingGroup?.name}"? This will move it back to the active groups section.`}
                confirmText="Reactivate"
                confirmVariant="default"
                confirmSize="sm"
            />
        </AppLayout>
    );
}
