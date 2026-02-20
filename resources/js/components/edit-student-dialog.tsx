import { useForm } from '@inertiajs/react';
import { Pencil, Loader2 } from 'lucide-react';
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
import { useEffect } from 'react';

interface Student {
    id: number;
    name: string;
    track: string;
}

interface Props {
    student: Student | null;
    isOpen: boolean;
    onClose: () => void;
    courseTypes: { name: string; value: string }[];
}

export function EditStudentDialog({ student, isOpen, onClose, courseTypes }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        track: '',
    });

    useEffect(() => {
        if (student) {
            setData({
                name: student.name,
                track: student.track || '',
            });
        }
    }, [student]);

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
                        <DialogTitle>Edit Student</DialogTitle>
                    </div>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                            id="edit-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-track">Track</Label>
                        <Select
                            value={data.track}
                            onValueChange={(val) => setData('track', val)}
                        >
                            <SelectTrigger id="edit-track">
                                <SelectValue placeholder="Select track" />
                            </SelectTrigger>
                            <SelectContent>
                                {courseTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.track && <p className="text-xs text-destructive">{errors.track}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={processing} className="w-full cursor-pointer">
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Student'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
