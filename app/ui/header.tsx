import React, { ComponentPropsWithoutRef, ElementType, ForwardedRef, HTMLAttributes, PropsWithChildren, ReactNode, type ComponentProps } from "react";
import { cn } from "./lib/utils";
import { Button } from "./button";

type PolymorphicAsProp<E extends ElementType> = {
    as?: E;
};

type PolymorphicProps<E extends ElementType> = PropsWithChildren<ComponentPropsWithoutRef<E> & PolymorphicAsProp<E>>;

const defaultElement = "a";

type HeaderNameProps<E extends ElementType = typeof defaultElement> = PolymorphicProps<E> & {
    name?: string;
    to?: string;
    children?: React.ReactNode;
    className?: string;
};

const HeaderName: React.FC<HeaderNameProps> = ({ as, className, name, to = "/", children, ...rest }) => {
    const Component = as ?? defaultElement;
    if (to) {
        rest.href = to;
    }
    return (
        <Component {...rest} className={cn("text-xl font-bold", className)}>
            {children ? children : <h1>{name}</h1>}
        </Component>
    );
};

interface HeaderActionsProps {
    className?: string;
    children?: React.ReactNode | any;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ className, children }) => {
    return <div className={cn("flex items-center gap-4", className)}>{children}</div>;
};

interface HeaderActionProps {
    "aria-label"?: string;
    "aria-labelledby"?: string;
    children: React.ReactNode;
    className?: string;
    isActive?: boolean;
    onClick?: () => void;
    tooltipAlignment?: "start" | "center" | "end";
    hasIconOnly?: boolean;
}

const HeaderAction: React.FC<HeaderActionProps> = React.forwardRef(function HeaderAction(
    { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, children, className: customClassName, onClick, isActive, tooltipAlignment, hasIconOnly = true, ...rest },
    ref
) {
    const className = cn("flex items-center gap-4", customClassName);
    const accessibilityLabel = {
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
    };
    return (
        <Button
            {...rest}
            {...accessibilityLabel}
            variant={"none"}
            size={hasIconOnly ? "icon" : "sm"}
            className={className}
            onClick={onClick}
            type="button"
            hasIconOnly={hasIconOnly}
            tooltip={ariaLabel}
            tooltipPosition="bottom"
            tooltipAlignment={tooltipAlignment}
            ref={ref as any}>
            {children}
        </Button>
    );
});

interface HeaderProps {
    className?: string;
    children?: React.ReactNode;
    "aria-label"?: string;
    "aria-labelledby"?: string;
}

const Header: React.FC<HeaderProps> = ({ className, children, ...rest }) => {
    return (
        <header {...rest} className={cn("flex absolute left-0 w-full items-center justify-between gap-4 px-4 py-2", className)}>
            {children}
        </header>
    );
};

export type HeaderNavigationProps = ComponentProps<"nav"> & {
    containerClassName?: string;
};

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    children,
    className: customClassName,
    containerClassName: customContainerClassName,
    ...rest
}: HeaderNavigationProps) => {
    const className = cn("flex gap-2", customClassName);
    const containerClassName = cn("", customContainerClassName);
    return (
        <nav {...rest} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} className={containerClassName}>
            <ul className={className}>{children}</ul>
        </nav>
    );
};

const menuItemDefaultElement = Button;
export type HeaderMenuItemProps<E extends ElementType> = PolymorphicProps<E> &
    HTMLAttributes<typeof menuItemDefaultElement> & {
        className?: string | undefined;
        isActive?: boolean | undefined;
        isCurrentPage?: boolean | undefined;
        "aria-current"?: string | undefined;
        children?: ReactNode;
        role?: ComponentProps<"li">["role"];
        tabIndex?: number | undefined;
        variant?: ComponentProps<typeof menuItemDefaultElement>["variant"];
    };

const HeaderMenuItem = React.forwardRef<HTMLElement, HeaderMenuItemProps<typeof menuItemDefaultElement | any>>(function HeaderMenuItemRenderFunction<E extends ElementType>(
    { as, className, variant, isActive, isCurrentPage, "aria-current": ariaCurrent, children, role, tabIndex = 0, ...rest }: HeaderMenuItemProps<E>,
    ref: ForwardedRef<HTMLElement>
) {
    if (isCurrentPage) {
        isActive = isCurrentPage;
    }
    const customClassName = cn("flex items-center gap-2", isActive && ariaCurrent !== "page" ? "bg-red-400" : "", className);
    const Component = as ?? menuItemDefaultElement;
    return (
        <Component className={customClassName} size="sm" variant={variant || "ghost"} role={role} aria-current={ariaCurrent} ref={ref as any} tabIndex={tabIndex} {...rest}>
            <span className={`text-ellipsis overflow-hidden`}>{children}</span>
        </Component>
    );
});

type HeaderMenuButtonBaseProps = Omit<ComponentProps<"button">, "title" | "type">;

export interface HeaderMenuButtonProps extends HeaderMenuButtonBaseProps {
    "aria-label"?: string;
    "aria-labelledby"?: string;
    className?: string;
    renderMenuIcon: JSX.Element;
    renderCloseIcon: JSX.Element;
    isActive?: boolean;
    isCollapsible?: boolean;
}

const HeaderMenuButton = ({
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    className: customClassName,
    renderMenuIcon,
    renderCloseIcon,
    isActive,
    isCollapsible,
    ...rest
}: HeaderMenuButtonProps) => {
    const className = cn(isActive ? "active" : "", !isCollapsible ? "not-collapsible" : "", customClassName);
    const menuIcon = renderMenuIcon;
    const closeIcon = renderCloseIcon;

    return (
        <button {...rest} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} className={className} title={ariaLabel} type="button">
            {isActive ? closeIcon : menuIcon}
        </button>
    );
};

export { HeaderName, HeaderActions, HeaderAction, Header, HeaderNavigation, HeaderMenuItem, HeaderMenuButton };
