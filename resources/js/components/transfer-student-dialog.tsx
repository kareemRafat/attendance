import { useForm } from '@inertiajs/react';
import { ArrowRightLeft, Search, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
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

interface Group {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    track: string;
    groups: Group[];
}

interface Props {
    student: Student | null;
    isOpen: boolean;
    onClose: () => void;
    availableGroups: Group[];
    courseTypes: { name: string; value: string }[];
}

export function TransferStudentDialog({ student, isOpen, onClose, availableGroups, courseTypes }: Props) {
    const [transferTrack, setTransferTrack] = useState('');
    const [groupSearch, setGroupSearch] = useState('');
    
    const { data, setData, post, processing, reset } = useForm({
        from_group_id: '',
        to_group_id: '',
        effective_date: new Date().toISOString().split('T')[0],
        reason: '',
    });

    useEffect(() => {
        if (student) {
            setData('from_group_id', student.groups?.[0]?.id.toString() || '');
            setTransferTrack(student.track || '');
        }
    }, [student, setData]);

    const filteredAvailableGroups = useMemo(() => {
        return availableGroups
            .filter((g) => g.id.toString() !== data.from_group_id)
            .filter((g) => g.name.toLowerCase().includes(groupSearch.toLowerCase()));
    }, [availableGroups, data.from_group_id, groupSearch]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;
        
        post(`/students/${student.id}/transfer`, {
            onSuccess: () => {
                onClose();
                reset();
                setTransferTrack('');
                setGroupSearch('');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <ArrowRightLeft className="size-5 text-orange-500" />
                        <DialogTitle className="text-orange-900 font-bold">Transfer Student</DialogTitle>
                    </div>
                    <DialogDescription>
                        Move <span className="font-bold text-orange-600">{student?.name}</span> to a different group.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Choice Track</Label>
                        <Select value={transferTrack} onValueChange={setTransferTrack}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose Track" />
                            </SelectTrigger>
                            <SelectContent>
                                {courseTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="from_group_id" className="text-xs font-bold text-slate-500 uppercase">From Group</Label>
                            <Select value={data.from_group_id} onValueChange={(val) => setData('from_group_id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Current" />
                                </SelectTrigger>
                                <SelectContent>
                                    {student?.groups?.map((group) => (
                                        <SelectItem key={group.id} value={group.id.toString()}>{group.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="to_group_id" className="text-xs font-bold text-slate-500 uppercase">To Group</Label>
                            <Select value={data.to_group_id} onValueChange={(val) => setData('to_group_id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Target" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="px-2 py-2 border-b dark:border-slate-800">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                                            <Input 
                                                placeholder="Search group..." 
                                                value={groupSearch}
                                                onChange={(e) => setGroupSearch(e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                className="h-8 pl-7 text-xs border-none bg-slate-50 dark:bg-slate-900 focus-visible:ring-0"
                                            />
                                        </div>
                                    </div>
                                    {filteredAvailableGroups.length > 0 ? (
                                        filteredAvailableGroups.map((group) => (
                                            <SelectItem key={group.id} value={group.id.toString()}>{group.name}</SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-xs text-center text-slate-500 italic">No groups found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="effective_date" className="text-xs font-bold text-slate-500 uppercase">Effective Date</Label>
                        <Input
                            id="effective_date"
                            type="date"
                            value={data.effective_date}
                            onChange={(e) => setData('effective_date', e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-xs font-bold text-slate-500 uppercase">Reason</Label>
                        <Input
                            id="reason"
                            placeholder="Enter reason"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer shadow-sm transition-all active:scale-95"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Transferring...
                                </>
                            ) : (
                                'Complete Transfer'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
