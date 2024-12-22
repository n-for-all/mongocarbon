import * as React from "react";

import { cn } from "./lib/utils";
import { SearchIcon, XIcon } from "@primer/octicons-react";

type NativeInputProps = React.ComponentProps<"input"> & {
    invalid?: boolean;
    invalidClassName?: string;
};

const NativeInput = React.forwardRef<HTMLInputElement, NativeInputProps>(({ className, type, invalid, invalidClassName, ...props }, ref) => {
    let additionClassName = "";
    if (invalid) {
        additionClassName = invalidClassName || "border-red-500 bg-red-200";
    }
    return (
        <input
            type={type}
            className={cn(
                "flex h-9 w-full border-b border-black bg-white px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className,
                additionClassName
            )}
            ref={ref}
            {...props}
        />
    );
});

type InputProps = NativeInputProps & {
    labelText?: string;
    invalidText?: string;
    helperText?: string;
    containerClassName?: string;
    hideLabel?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ invalidText, helperText, hideLabel, labelText, containerClassName, ...props }, ref) => {
    return (
        <div className={cn("flex flex-col gap-1", containerClassName)}>
            {labelText && !hideLabel ? <label className="text-sm tracking-wide">{labelText}</label> : null}
            <NativeInput {...props} />
            {invalidText ? <small className="text-red-500">{invalidText}</small> : null}
            {helperText ? <small className="text-xs text-black opacity-50">{helperText}</small> : null}
        </div>
    );
});

type SearchInputProps = NativeInputProps & {
    onChange: (value: string) => void;
};
const SearchInput: React.FC<SearchInputProps> = ({ className, value, onChange, ...props }) => {
    return (
        <div className="relative flex items-center">
            <SearchIcon className="absolute left-3 text-muted-foreground" />
            <NativeInput type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cn("pl-10 pr-4 min-w-48", className)} {...props} />
            {value && value != "" && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        onChange("");
                    }}
                    className="absolute right-3 text-muted-foreground">
                    <XIcon />
                </button>
            )}
        </div>
    );
};

export { Input, NativeInput, SearchInput };
