

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "./lib/utils";

type Side = "top" | "right" | "bottom" | "left";
interface TooltipProps {
    children: React.ReactNode;
    delayDuration?: number;
    content?: React.ReactNode | string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: Side;
    sideOffset?: number;
    align?: "start" | "center" | "end";
    alignOffset?: number;
    avoidCollisions?: boolean;
    collisionBoundary?: Element | null | Array<Element | null>;
    collisionPadding?: number | Partial<Record<Side, number>>;
    sticky?: "partial" | "always";
    hideWhenDetached?: boolean;
    className?: string;
    "aria-label"?: string;
    "data-state"?: "closed" | "delayed-open" | "instant-open";
    onEscapeKeyDown?: (event: React.KeyboardEvent) => void;
    onPointerDownOutside?: (event: React.PointerEvent) => void;
    forceMount?: boolean;
    showArrow?: boolean;
}

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = ({ children, content, delayDuration, open, defaultOpen, showArrow, "data-state": dataState, onOpenChange, className, ...props }: TooltipProps) => {
    if (!content) {
        return <>{children}</>;
    }
    return (
        <TooltipProvider>
            <TooltipPrimitive.Root delayDuration={delayDuration} data-state={dataState || "instant-open"} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
                <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
                <TooltipPrimitive.Content
                    className={cn(
                        "z-50 overflow-hidden  bg-tooltip px-3 py-1.5 text-xs text-tooltip-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                        className
                    )}
                    {...props}>
                    {content}
                    {showArrow && <TooltipPrimitive.Arrow width={11} height={5} />}
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Root>
        </TooltipProvider>
    );
};

export { Tooltip, TooltipProvider };
