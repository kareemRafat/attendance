import { Head } from '@inertiajs/react';
import { Building2, Layers, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Branch {
    id: number;
    name: string;
    groups_count: number;
    users_count: number;
}

interface Props {
    stats: {
        total_branches: number;
        total_groups: number;
        total_students: number;
    };
    branches: Branch[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, branches }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                <Building2 className="size-3.5" /> Total Branches
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-3xl font-black text-blue-900 dark:text-blue-200">{stats.total_branches}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-indigo-50/50 border-indigo-100 shadow-sm dark:bg-indigo-950/20 dark:border-indigo-900">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                <Layers className="size-3.5" /> Active Groups
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-3xl font-black text-indigo-900 dark:text-indigo-200">{stats.total_groups}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm dark:bg-emerald-950/20 dark:border-emerald-900">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                <Users className="size-3.5" /> Total Students
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-3xl font-black text-emerald-900 dark:text-emerald-200">{stats.total_students}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Branch Breakdown */}
                <Card className="border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                            <TrendingUp className="size-5 text-indigo-500" />
                            Branch Performance Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-slate-800">
                            {branches.map((branch) => (
                                <div key={branch.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <h3 className="font-black text-slate-900 dark:text-white mb-4">{branch.name}</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Groups</span>
                                            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                                                {branch.groups_count}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Staff</span>
                                            <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-sm">
                                                {branch.users_count}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
