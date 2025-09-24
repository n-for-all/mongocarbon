import React, { useState, useEffect } from "react";
import { Input } from "~/ui/input";
import { Textarea } from "~/ui/textarea";
import { Checkbox } from "~/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem } from "~/ui/select";
import { useSchemaContext } from "../../context/SchemaContext";
import LocaleProvider from "../LocalProvider";
import { format } from "../../utils";

type SchemaStringProps = {
    data: any;
};

export default function SchemaString({ data }: SchemaStringProps) {
    const { changeCustomValue } = useSchemaContext();
    const [checked, setChecked] = useState(Array.isArray(data.enum));

    useEffect(() => {
        setChecked(Array.isArray(data.enum));
    }, [data.enum]);

    const handleChange = (value: any, name: string) => {
        data[name] = value;
        changeCustomValue(data);
    };

    const handleEnumChange = (value: string) => {
        const arr = value.split("\n");
        if (arr.length === 0 || (arr.length === 1 && !arr[0])) {
            delete data.enum;
            changeCustomValue(data);
        } else {
            data.enum = arr;
            changeCustomValue(data);
        }
    };

    const handleEnumDescChange = (value: string) => {
        data.enumDesc = value;
        changeCustomValue(data);
    };

    const handleCheckBox = (checkedValue: boolean) => {
        setChecked(checkedValue);
        if (!checkedValue) {
            delete data.enum;
            changeCustomValue(data);
        }
    };

    const formatLabel = data.format ? format.find((f) => f.name === data.format)?.label || data.format : "Select a format";

    return (
        <div>
            <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center flex-1 w-32 gap-1">
                    <div className="whitespace-nowrap">Pattern:</div>
                    <div className="flex-1">
                        <Input value={data.pattern || ""} placeholder="Pattern" onChange={(e) => handleChange(e.target.value, "pattern")} />
                    </div>
                </div>
                <Input value={data.default || ""} placeholder={LocaleProvider("default")} onChange={(e) => handleChange(e.target.value, "default")} />
                <Select value={data.format || ""} onValueChange={(value) => handleChange(value, "format")}>
                    <SelectTrigger className="w-40 bg-white">{formatLabel}</SelectTrigger>
                    <SelectContent>
                        {format.map((item) => (
                            <SelectItem key={item.name} value={item.name}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex flex-shrink-0 gap-4">
                    <div className="flex items-center flex-1 flex-shrink-0 gap-1">
                        <span className="whitespace-nowrap">{LocaleProvider("minLength")}: </span>
                        <Input type="number" value={data.minLength ?? ""} placeholder="Min length" onChange={(e) => handleChange(Number(e.target.value), "minLength")} />
                    </div>
                    <div className="flex items-center flex-1 flex-shrink-0 gap-1">
                        <span className="whitespace-nowrap">{LocaleProvider("maxLength")}: </span>
                        <Input type="number" value={data.maxLength ?? ""} placeholder="Max length" onChange={(e) => handleChange(Number(e.target.value), "maxLength")} />
                    </div>
                </div>
            </div>
            <div className="flex items-center mb-2">
                <div className="flex items-center whitespace-nowrap">
                    {LocaleProvider("enum")}
                    <Checkbox labelText="" checked={checked} onCheckedChange={handleCheckBox} className="ml-2" />:
                </div>
                <div className="flex-1">
                    <Textarea
                        value={data.enum && data.enum.length ? data.enum.join("\n") : ""}
                        disabled={!checked}
                        placeholder={LocaleProvider("enum_msg")}
                        rows={3}
                        onChange={(e) => handleEnumChange(e.target.value)}
                    />
                </div>
            </div>
            {checked && (
                <div className="flex items-center gap-1 mb-2">
                    <div className="whitespace-nowrap">{LocaleProvider("enum_desc")}</div>
                    <div className="flex-1">
                        <Textarea
                            value={data.enumDesc || ""}
                            disabled={!checked}
                            placeholder={LocaleProvider("enum_desc_msg")}
                            rows={2}
                            onChange={(e) => handleEnumDescChange(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
