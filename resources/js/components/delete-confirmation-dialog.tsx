import { ReactNode } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: ReactNode;
    processing?: boolean;
    confirmText?: string;
    confirmVariant?:
        | 'default'
        | 'destructive'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | 'link';
    confirmSize?: 'default' | 'sm' | 'lg' | 'icon';
}

export function DeleteConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    processing = false,
    confirmText = 'حذف',
    confirmVariant = 'destructive',
    confirmSize = 'default',
}: DeleteConfirmationDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div
                        className={cn(
                            'mb-2 flex items-center gap-2',
                            confirmVariant === 'destructive'
                                ? 'text-red-600'
                                : 'text-primary',
                        )}
                    >
                        <AlertTriangle className="size-5" />
                        <DialogTitle
                            className={cn(
                                confirmVariant === 'destructive' &&
                                    'text-red-600',
                            )}
                        >
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription asChild>
                        <div>{description}</div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={processing}
                        className="cursor-pointer"
                        size={confirmSize}
                    >
                        إلغاء
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        disabled={processing}
                        className="cursor-pointer"
                        size={confirmSize}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="ms-2 size-4 animate-spin" />
                                {confirmVariant === 'destructive'
                                    ? 'جاري الحذف...'
                                    : 'جاري المعالجة...'}
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
