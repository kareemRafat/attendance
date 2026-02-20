import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarCheck,
    LayoutGrid,
    Layers,
    Users,
    UserCheck,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import attendance from '@/routes/attendance';
import branches from '@/routes/branches';
import employees from '@/routes/employees';
import groups from '@/routes/groups';
import students from '@/routes/students';
import type { NavItem, User } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;
    const isAdmin = user.role === 'admin';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard.url(),
            icon: LayoutGrid,
        },
        {
            title: 'Attendance',
            href: attendance.index.url(),
            icon: CalendarCheck,
        },
        {
            title: 'Students',
            href: students.index.url(),
            icon: Users,
        },
        {
            title: 'Groups',
            href: groups.index.url(),
            icon: Layers,
        },
        ...(isAdmin
            ? [
                  {
                      title: 'Employees',
                      href: employees.index.url(),
                      icon: UserCheck,
                  },
                  {
                      title: 'Branches',
                      href: branches.index.url(),
                      icon: Building2,
                  },
              ]
            : []),
    ];

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
