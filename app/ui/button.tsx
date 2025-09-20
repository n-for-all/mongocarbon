import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./lib/utils";
import { Tooltip } from "./tooltip";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap hover:cursor-pointer text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                danger: "bg-error text-error-foreground hover:bg-error/90",
                error: "bg-error text-error-foreground hover:bg-error/90",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                dark: "bg-neutral-700 text-white hover:bg-neutral-800",
                ghost: "hover:bg-neutral-100 hover:text-neutral-800",
                link: "text-primary underline-offset-4 hover:underline",
                none: "",
            },
            size: {
                default: "h-9 px-4 py-2 text-sm",
                sm: "h-9  px-3 text-sm",
                md: "h-10  px-4",
                xs: "h-8  px-3 text-xs",
                lg: "h-10  px-8",
                icon: "h-9 w-9",
            },
            iconPosition: {
                left: "flex-row",
                right: "flex-row-reverse",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    icon?: React.ReactNode | React.ReactElement;
    iconPosition?: "left" | "right";
    hasIconOnly?: boolean;
}

export interface AnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    icon?: React.ReactNode | React.ReactElement;
    iconPosition?: "left" | "right";
    href?: string;
    to?: string;
    hasIconOnly?: boolean;
    loading?: boolean;
    tooltip?: string;
    tooltipPosition?: "top" | "bottom" | "left" | "right";
    tooltipAlignment?: "start" | "center" | "end";
    as?: "a" | "button";
}

type ButtonAnchorProps = ButtonProps & AnchorProps;

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonAnchorProps>(
    (
        { className, hasIconOnly, tooltipAlignment, tooltipPosition, iconPosition, as, to, href, variant, icon, size, asChild = false, tooltip, loading, children, ...props },
        ref
    ) => {
        const Comp = asChild ? Slot : href || to || as == "a" ? "a" : "button";
        let loader: any = null;
        if (loading) {
            let loaderSize = "";
            switch (size) {
                case "sm":
                    loaderSize = "h-4 w-4";
                    break;
                case "lg":
                    loaderSize = "h-6 w-6";
                    break;
                default:
                    loaderSize = "h-5 w-5";
            }
            loader = <Loader2 className={"animate-spin " + loaderSize}></Loader2>;
        } else {
            loader = icon ? <span className={hasIconOnly ? "" : iconPosition == "right" ? "ml-4" : "mr-4"}>{icon}</span> : null;
        }

        const linkTo = href || to;
        return (
            <Tooltip content={tooltip} side={tooltipPosition} align={tooltipAlignment} open={!!tooltip}>
                <Comp className={cn(buttonVariants({ variant, size, className, iconPosition }))} ref={ref as any} {...props} href={linkTo}>
                    {loader}
                    {children}
                </Comp>
            </Tooltip>
        );
    }
);
Button.displayName = "Button";

interface ButtonSkeletonProps {
    variant?: "default" | "dark" | "error" | "outline" | "secondary" | "ghost" | "link" | "none" | null | undefined;
    size?: "default" | "sm" | "xs" | "lg" | "icon" | null | undefined;
    className?: string;
}

const ButtonSkeleton: React.FC<ButtonSkeletonProps> = ({ variant = "default", size = "default", className }: ButtonSkeletonProps) => {
    return <div className={cn("inline-block w-32 h-10 bg-gray-300  animate-pulse", buttonVariants({ variant, size, className }))}></div>;
};

export { Button, ButtonSkeleton, buttonVariants };
