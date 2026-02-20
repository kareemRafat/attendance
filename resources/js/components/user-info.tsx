import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({ user }: { user: User }) {
    const getInitials = useInitials();
    const isAdmin = user.role === 'admin';
    const subText = isAdmin ? 'Admin' : user.branch?.name || 'Employee';

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 overflow-hidden rounded-lg border dark:border-slate-800">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-slate-100 font-bold text-slate-900 dark:bg-slate-800 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-bold text-slate-900 dark:text-white">
                    {user.name}
                </span>
                <span className="truncate text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {subText}
                </span>
            </div>
        </div>
    );
}
