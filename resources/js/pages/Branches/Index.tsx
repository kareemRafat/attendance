import { Head, useForm, router, Link } from '@inertiajs/react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Plus, Pencil, Building2, MapPin, Users, Library, Settings2 } from 'lucide-react';


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
    const breadcrumbs = [{ title: 'Branches', href: '/branches' }];

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
            <Head title="Branches" />

            <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Branch Management</h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Overview and configuration of your academy locations.
                        </p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 cursor-pointer">
                                <Plus className="size-4" /> New Branch
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Branch</DialogTitle>
                                <DialogDescription>
                                    Create a new location for your academy.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submitCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Branch Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Main Campus"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        required
                                    />
                                    {createForm.errors.name && <p className="text-xs text-red-500">{createForm.errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g. Downtown Area"
                                        value={createForm.data.location}
                                        onChange={(e) => createForm.setData('location', e.target.value)}
                                    />
                                    {createForm.errors.location && <p className="text-xs text-red-500">{createForm.errors.location}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createForm.processing} className="w-full cursor-pointer">
                                        Create Branch
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {branches.map((branch) => (
                        <div key={branch.id}>
                            <Card className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                                                                <CardHeader className="p-6 pb-4 bg-blue-50/50 border-b border-blue-100/50">
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <div className="bg-white p-2.5 rounded-2xl text-blue-600 shadow-sm ring-1 ring-blue-100">
                                                                            <Building2 className="size-6" />
                                                                        </div>
                                                                        <Button 
                                                                            variant="secondary" 
                                                                            size="icon" 
                                                                            className="h-9 w-9 bg-white border border-blue-100 shadow-sm hover:bg-blue-50 text-slate-600 hover:text-blue-600 cursor-pointer rounded-xl"
                                                                            onClick={() => {
                                                                                setEditingBranch(branch);
                                                                                editForm.setData({
                                                                                    name: branch.name,
                                                                                    location: branch.location || '',
                                                                                });
                                                                            }}
                                                                        >
                                                                            <Pencil className="size-4" />
                                                                        </Button>
                                                                    </div>
                                                                    <CardTitle className="text-2xl font-black text-slate-900 leading-tight">
                                                                        {branch.name}
                                                                    </CardTitle>
                                                                    <div className="flex items-center gap-1.5 mt-2 text-slate-500">
                                                                        <MapPin className="size-4 text-blue-400" />
                                                                        <span className="text-sm font-medium line-clamp-1">
                                                                            {branch.location || 'Remote/Virtual Office'}
                                                                        </span>
                                                                    </div>
                                                                </CardHeader>
                                <CardContent className="px-6 pb-8">
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div className="flex flex-col p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100">
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-400 mb-1">Active Groups</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-indigo-700">{branch.groups_count}</span>
                                                <Library className="size-4 text-indigo-300" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col p-4 rounded-2xl bg-blue-50/30 border border-blue-100">
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-400 mb-1">Assigned Staff</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-blue-700">{branch.users_count}</span>
                                                <Users className="size-4 text-blue-300" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-start">
                                        <div className="flex -space-x-2">
                                            {[...Array(Math.min(branch.users_count, 3))].map((_, i) => (
                                                <div key={i} className="size-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                                    <Users className="size-3 text-slate-400" />
                                                </div>
                                            ))}
                                            {branch.users_count > 3 && (
                                                <div className="size-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    +{branch.users_count - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="ml-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {branch.users_count} total staff members
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}

                    {branches.length === 0 && (
                        <div className="col-span-full py-24 text-center border-4 border-dotted rounded-[2.5rem] border-slate-100 bg-slate-50/30">
                            <div className="size-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                                <Building2 className="size-10 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Expand Your Network</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">
                                No branches established yet. Ready to open your first physical or virtual academy location?
                            </p>
                            <Button
                                variant="outline"
                                className="mt-8 h-12 px-8 rounded-xl cursor-pointer border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold transition-all"
                                onClick={() => setIsCreateOpen(true)}
                            >
                                <Plus className="size-5 mr-2" /> Start First Branch
                            </Button>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                <Dialog open={!!editingBranch} onOpenChange={(open) => !open && setEditingBranch(null)}>
                    <DialogContent className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                        <div className="bg-slate-900 p-6 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Settings2 className="size-6 text-indigo-400" />
                                    Configure Branch
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Update administrative details for this location.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <form onSubmit={submitEdit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-slate-700 font-bold text-sm">Branch Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="h-11 rounded-lg border-slate-200 focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                                {editForm.errors.name && <p className="text-xs text-red-500 font-medium">{editForm.errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-location" className="text-slate-700 font-bold text-sm">Location Address</Label>
                                <Input
                                    id="edit-location"
                                    value={editForm.data.location}
                                    onChange={(e) => editForm.setData('location', e.target.value)}
                                    className="h-11 rounded-lg border-slate-200 focus:ring-2 focus:ring-indigo-500"
                                />
                                {editForm.errors.location && <p className="text-xs text-red-500 font-medium">{editForm.errors.location}</p>}
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="submit" disabled={editForm.processing} className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all active:scale-95 cursor-pointer">
                                    Apply Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
