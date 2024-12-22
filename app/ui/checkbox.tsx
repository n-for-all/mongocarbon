

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "./lib/utils";

const CheckboxNative = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(
    ({ className, ...props }, ref) => (
        <CheckboxPrimitive.Root
            ref={ref}
            className={cn(
                "peer h-4 w-4 shrink-0  border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                className
            )}
            {...props}>
            <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
                <Check className="w-4 h-4" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )
);

type ExcludedAttributes = "id" | "onChange" | "onClick" | "type";


export interface CheckboxProps extends Omit<CheckboxPrimitive.CheckboxProps, ExcludedAttributes> {
    /**
     * Provide a label to provide a description of the Checkbox input that you are
     * exposing to the user
     */
    labelText: NonNullable<React.ReactNode>;

    /**
     * Specify whether the underlying input should be checked by default
     */
    defaultChecked?: boolean;

    /**
     * Specify whether the Checkbox should be disabled
     */
    disabled?: boolean;

    /**
     * Provide text for the form group for additional help
     */
    helperText?: React.ReactNode;

    /**
     * Specify whether the label should be hidden, or not
     */
    hideLabel?: boolean;

    /**
     * Specify whether the Checkbox is currently rad only
     */
    readOnly?: boolean;

    /**
     * Specify whether the Checkbox is currently invalid
     */
    invalid?: boolean;

    /**
     * Provide the text that is displayed when the Checkbox is in an invalid state
     */
    invalidText?: React.ReactNode;

    /**
     * Specify whether the Checkbox is currently invalid
     */
    warn?: boolean;

    /**
     * Provide the text that is displayed when the Checkbox is in an invalid state
     */
    warnText?: React.ReactNode;

    /**
     * Provide an optional handler that is called when the internal state of
     * Checkbox changes. This handler is called with event and state info.
     * `(checked) => void`
     */
    onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef(
    ({ className, helperText, labelText, onChange, invalid, invalidText, hideLabel, readOnly, title = "", warn, warnText, ...other }: CheckboxProps, ref) => {
        const showWarning = !readOnly && !invalid && warn;
        const showHelper = !invalid && !warn;

        const helper = helperText ? <div className={`text-xs text-black opacity-50`}>{helperText}</div> : null;

        return (
            <div className={"flex items-start gap-2"}>
                <CheckboxNative
                    {...other}
                    data-invalid={invalid ? true : undefined}
                    className={"mt-0.5" + (invalid ? " border-red-500" : "")}
                    onCheckedChange={(checked) => {
                        if (!readOnly && onChange) {
                            onChange(!!checked);
                        }
                    }}
                    ref={(el) => {
                        if (typeof ref === "function") {
                            ref(el);
                        } else if (ref && "current" in ref) {
                            ref.current = el;
                        }
                    }}
                    aria-readonly={readOnly}
                />
                <div className={`flex flex-col`}>
                    <label className={`text-sm tracking-wide`} title={title}>
                        {labelText}
                    </label>
                    <div className={`flex items-start gap-2`}>
                        {!readOnly && invalid && (
                            <>
                                <div className={`text-red-500 `}>{invalidText}</div>
                            </>
                        )}
                        {showWarning && (
                            <>
                                <div className={`text-yellow-500 `}>{warnText}</div>
                            </>
                        )}
                    </div>
                    {showHelper && helper}
                </div>
            </div>
        );
    }
);

export { Checkbox };
