import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Calendar, BookOpen } from 'lucide-react';

interface Group {
    id: number;
    name: string;
    course_type: string;
    pattern: string;
    start_date: string;
    is_active: boolean;
    students_count?: number;
    branch?: {
        name: string;
    };
}

interface Props {
    groups: Group[];
    canManageEverything: boolean;
}

export default function GroupsIndex({ groups, canManageEverything }: Props) {
    const breadcrumbs = [{ title: 'Groups', href: '/groups' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Groups" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Groups Management</h1>
                    <Button className="gap-2">
                        <Plus className="size-4" /> New Group
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <Card key={group.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">
                                        {group.name}
                                    </CardTitle>
                                    <Badge
                                        variant={
                                            group.is_active
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {group.is_active ? 'Active' : 'Ended'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    {group.branch?.name}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <BookOpen className="size-4" />
                                        <span className="capitalize">
                                            {group.course_type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="size-4" />
                                        <span>{group.pattern}</span>
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
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        asChild
                                    >
                                        <Link href={`/groups/${group.id}`}>
                                            Edit
                                        </Link>
                                    </Button>
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
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {groups.length === 0 && (
                        <div className="col-span-full rounded-xl border bg-muted/20 py-24 text-center">
                            <p className="text-muted-foreground">
                                No groups found.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
