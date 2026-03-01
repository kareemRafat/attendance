import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ReasonTooltip({ reason }: { reason: string }) {
    const [open, setOpen] = useState(false);

    return (
        <Tooltip open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
                <span
                    className="cursor-help outline-none"
                    tabIndex={0}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen(!open);
                    }}
                >
                    {reason}
                </span>
            </TooltipTrigger>
            <TooltipContent
                className="max-w-xs text-sm whitespace-pre-wrap"
                onPointerDownOutside={() => setOpen(false)}
            >
                {reason}
            </TooltipContent>
        </Tooltip>
    );
}
