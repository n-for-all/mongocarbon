import React, { useState, useEffect } from "react";
import { Input } from "~/ui/input";
import { Button } from "~/ui/button";
import { PlusIcon } from "lucide-react";
import LocaleProvider from "../LocalProvider";
import { Select, SelectTrigger, SelectContent, SelectItem } from "~/ui/select";

type FieldInputProps = {
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    [key: string]: any;
};

export default function FieldInput(props: FieldInputProps) {
    const { value, onChange, ...rest } = props;
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInternalValue(e.target.value);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && onChange && internalValue !== value) {
            onChange(e as any);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (onChange && internalValue !== value) {
            onChange(e as any);
        }
    };

    return <Input {...rest} value={internalValue} onChange={handleChange} onKeyUp={handleKeyUp} onBlur={handleBlur} />;
}
