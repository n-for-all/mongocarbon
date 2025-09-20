"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva } from "class-variance-authority";

import { cn } from "./lib/utils";

const switchVariants = cva(
    "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-200",
    {
        variants: {
            size: {
                default: "h-6 w-11",
                sm: "h-4.5 w-8",
                xs: "h-4 w-6",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & { size?: "default" | "sm" | "xs" }>(
    ({ size = "default", ...props }, ref) => {
        let notchSize = "size-5";
        let notchPosition = "data-[state=checked]:translate-x-5";
        switch (size) {
            case "default":
                notchSize = "size-5";
                notchPosition = "data-[state=checked]:translate-x-5";
                break;
            case "sm":
                notchSize = "size-4";
                notchPosition = "data-[state=checked]:translate-x-3";
                break;
            case "xs":
                notchSize = "size-3";
                notchPosition = "data-[state=checked]:translate-x-2";
                break;
        }
        return (
            <SwitchPrimitives.Root {...props} className={cn(switchVariants({ size }), props.className)}  ref={ref}>
                <SwitchPrimitives.Thumb
                    className={cn(
                        "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
                        notchSize,
                        notchPosition
                    )}
                />
            </SwitchPrimitives.Root>
        );
    }
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
