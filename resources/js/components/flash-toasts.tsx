import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function FlashToasts() {
    const { flash } = usePage<any>().props;

    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
        if (flash.info) {
            toast.info(flash.info);
        }
        if (flash.warning) {
            toast.warning(flash.warning);
        }
    }, [flash]);

    return null;
}
