import { useForm, usePage } from '@inertiajs/react';
import { Pencil, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
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

interface Student {
    id: number;
    name: string;
    track: string;
    branch_id?: number;
}

interface Branch {
    id: number;
    name: string;
}

interface Props {
    student: Student | null;
    isOpen: boolean;
    onClose: () => void;
    courseTypes: { name: string; value: string }[];
    availableBranches?: Branch[];
}

export function EditStudentDialog({
    student,
    isOpen,
    onClose,
    courseTypes,
    availableBranches = [],
}: Props) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth.user.role === 'admin';

    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        track: '',
        branch_id: '',
    });

    useEffect(() => {
        if (student) {
            setData({
                name: student.name,
                track: student.track || '',
                branch_id: student.branch_id?.toString() || '',
            });
        }
    }, [student, setData]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;

        put(`/students/${student.id}`, {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Pencil className="size-5 text-muted-foreground" />
                        <DialogTitle>تعديل بيانات الطالب</DialogTitle>
                    </div>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-6 pt-4">
                    {isAdmin && (
                        <div className="space-y-3">
                            <Label htmlFor="edit-branch">الفرع</Label>
                            <Select
                                value={data.branch_id}
                                onValueChange={(val) =>
                                    setData('branch_id', val)
                                }
                            >
                                <SelectTrigger id="edit-branch">
                                    <SelectValue placeholder="اختر الفرع" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableBranches.map((branch) => (
                                        <SelectItem
                                            key={branch.id}
                                            value={branch.id.toString()}
                                        >
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.branch_id && (
                                <p className="text-xs text-destructive">
                                    {errors.branch_id}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="space-y-3">
                        <Label htmlFor="edit-name">الاسم</Label>
                        <Input
                            id="edit-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="edit-track">المسار</Label>
                        <Select
                            value={data.track}
                            onValueChange={(val) => setData('track', val)}
                        >
                            <SelectTrigger id="edit-track">
                                <SelectValue placeholder="اختر المسار" />
                            </SelectTrigger>
                            <SelectContent>
                                {courseTypes.map((type) => (
                                    <SelectItem
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.track && (
                            <p className="text-xs text-destructive">
                                {errors.track}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="ms-2 size-4 animate-spin" />
                                    جاري التحديث...
                                </>
                            ) : (
                                'تحديث بيانات الطالب'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
