import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Users, Calendar, BookOpen, CheckCircle, RotateCcw, Edit, Loader2 } from 'lucide-react';
import { useState, FormEventHandler } from 'react';
import { end, reactivate, store, update } from '@/actions/App/Http/Controllers/GroupController';
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

interface CourseTypeOption {
    name: string;
    value: string;
}

interface DaysPatternOption {
    name: string;
    value: string;
}

interface Group {
    id: number;
    branch_id: number;
    name: string;
    course_type: string;
    pattern: string;
    formatted_course_type: string;
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
    groups: Group[];
    branches: Branch[];
    courseTypes: CourseTypeOption[];
    daysPatterns: DaysPatternOption[];
}

export default function GroupsIndex({ groups = [], branches = [], courseTypes = [], daysPatterns = [] }: Props) {
    const breadcrumbs = [{ title: 'Groups', href: '/groups' }];
    const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);

    const { post: postEnd } = useForm();
    const { post: postReactivate } = useForm();

    const createForm = useForm({
        branch_id: branches.length > 0 ? branches[0].id : 0,
        name: '',
        course_type: courseTypes.length > 0 ? courseTypes[0].value : '',
        pattern: daysPatterns.length > 0 ? daysPatterns[0].value : '',
        start_date: new Date().toISOString().split('T')[0],
        max_lectures: 45,
    });

    const editForm = useForm({
        branch_id: 0,
        name: '',
        course_type: '',
        pattern: '',
        start_date: '',
        max_lectures: 45,
    });

    const filteredGroups = (groups || []).filter((group) =>
        activeTab === 'active' ? group.is_active : !group.is_active
    );

    const toggleStatus = (group: Group) => {
        if (group.is_active) {
            if (confirm('Are you sure you want to finish this group?')) {
                postEnd(end.url({ group: group.id }));
            }
        } else {
            postReactivate(reactivate.url({ group: group.id }));
        }
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
            course_type: group.course_type,
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
                    <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="size-4" /> New Group
                    </Button>
                </div>

                <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800 self-start">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={cn(
                            'flex items-center rounded-md px-4 py-2 transition-colors text-sm font-medium',
                            activeTab === 'active'
                                ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        Active Groups
                    </button>
                    <button
                        onClick={() => setActiveTab('closed')}
                        className={cn(
                            'flex items-center rounded-md px-4 py-2 transition-colors text-sm font-medium',
                            activeTab === 'closed'
                                ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        Closed Groups
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredGroups.map((group) => (
                        <Card key={group.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">
                                            {group.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            {group.branch?.name}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-muted-foreground"
                                        onClick={() => handleEditClick(group)}
                                    >
                                        <Edit className="size-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <BookOpen className="size-4" />
                                        <span>
                                            {group.formatted_course_type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="size-4" />
                                        <span>{group.formatted_pattern}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="size-4" />
                                        <span>
                                            {group.students_count || 0} Students
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant={group.is_active ? "outline" : "default"}
                                        size="sm"
                                        className="flex-1 gap-2"
                                        onClick={() => toggleStatus(group)}
                                    >
                                        {group.is_active ? (
                                            <>
                                                <CheckCircle className="size-4" />
                                                Finish
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw className="size-4" />
                                                Activate
                                            </>
                                        )}
                                    </Button>
                                    
                                    {group.is_active && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
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

                    {filteredGroups.length === 0 && (
                        <div className="col-span-full rounded-xl border bg-muted/20 py-24 text-center">
                            <p className="text-muted-foreground">
                                No {activeTab} groups found.
                            </p>
                        </div>
                    )}
                </div>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-course-type">Course Type</Label>
                                    <Select
                                        value={createForm.data.course_type}
                                        onValueChange={(v) => createForm.setData('course_type', v)}
                                    >
                                        <SelectTrigger id="create-course-type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(courseTypes || []).map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={createForm.errors.course_type} />
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-course-type">Course Type</Label>
                                    <Select
                                        value={editForm.data.course_type}
                                        onValueChange={(v) => editForm.setData('course_type', v)}
                                    >
                                        <SelectTrigger id="edit-course-type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(courseTypes || []).map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={editForm.errors.course_type} />
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
        </AppLayout>
    );
}
