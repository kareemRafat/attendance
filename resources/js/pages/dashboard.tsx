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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Dashboard Overview
                    </h1>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="border-blue-100 bg-blue-50/50 shadow-sm dark:border-blue-900 dark:bg-blue-950/20">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                                <Building2 className="size-3.5" /> Total
                                Branches
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-3xl font-black text-blue-900 dark:text-blue-200">
                                {stats.total_branches}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm dark:border-indigo-900 dark:bg-indigo-950/20">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                                <Layers className="size-3.5" /> Active Groups
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-3xl font-black text-indigo-900 dark:text-indigo-200">
                                {stats.total_groups}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/20">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                <Users className="size-3.5" /> Total Students
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-3xl font-black text-emerald-900 dark:text-emerald-200">
                                {stats.total_students}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Branch Breakdown */}
                <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-3 dark:border-slate-800 dark:bg-slate-800/30">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                            <TrendingUp className="size-5 text-indigo-500" />
                            Branch Performance Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 gap-0 divide-x divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0 lg:grid-cols-3 dark:divide-slate-800">
                            {branches.map((branch) => (
                                <div
                                    key={branch.id}
                                    className="p-6 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                >
                                    <h3 className="mb-4 font-black text-slate-900 dark:text-white">
                                        {branch.name}
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                                                Active Groups
                                            </span>
                                            <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                {branch.groups_count}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                                                Assigned Staff
                                            </span>
                                            <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
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
