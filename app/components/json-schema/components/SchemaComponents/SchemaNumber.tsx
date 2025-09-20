import React, { useState, useEffect } from "react";
import { Input } from "~/ui/input";
import { Textarea } from "~/ui/textarea";
import { Checkbox } from "~/ui/checkbox";
import { Switch } from "~/ui/switch";
import LocaleProvider from "../LocalProvider";
import { useSchemaContext } from "../../context/SchemaContext";

type SchemaNumberProps = {
    data: any;
};

export default function SchemaNumber({ data }: SchemaNumberProps) {
    const { changeCustomValue } = useSchemaContext();
    const [checked, setChecked] = useState(Array.isArray(data.enum));
    const [enumValue, setEnumValue] = useState(Array.isArray(data.enum) ? data.enum.join("\n") : "");

    useEffect(() => {
        setChecked(Array.isArray(data.enum));
        setEnumValue(Array.isArray(data.enum) ? data.enum.join("\n") : "");
    }, [data.enum]);

    const handleChange = (value: any, name: string) => {
        data[name] = value;
        changeCustomValue(data);
    };

    const handleSwitch = (value: boolean, name: string) => {
        data[name] = value;
        changeCustomValue(data);
    };

    const handleEnumCheck = (checkedValue: boolean) => {
        setChecked(checkedValue);
        if (!checkedValue) {
            delete data.enum;
            setEnumValue("");
            changeCustomValue(data);
        }
    };

    const handleEnumChange = (value: string) => {
        setEnumValue(value);
        const arr = value.split("\n");
        if (arr.length === 0 || (arr.length === 1 && !arr[0])) {
            delete data.enum;
            changeCustomValue(data);
        } else {
            data.enum = arr.map((item) => +item);
            changeCustomValue(data);
        }
    };

    const handleEnumDescChange = (value: string) => {
        data.enumDesc = value;
        changeCustomValue(data);
    };

    return (
        <div>
            <div className="default-setting">{LocaleProvider("base_setting")}</div>
            <table className="w-full">
                <tbody>
                    <tr>
                        <td className="w-32 other-label">{LocaleProvider("default")}: </td>
                        <td>
                            <Input value={data.default ?? ""} placeholder={LocaleProvider("default")} onChange={(e) => handleChange(e.target.value, "default")} />
                        </td>
                    </tr>
                    <tr>
                        <td className="w-32 other-label">
                            <span>
                                exclusiveMinimum&nbsp;
                                {/* Tooltip can be added here if needed */}:
                            </span>
                        </td>
                        <td>
                            <Switch checked={!!data.exclusiveMinimum} onCheckedChange={(value) => handleSwitch(value, "exclusiveMinimum")} />
                        </td>
                    </tr>
                    <tr>
                        <td className="w-32 other-label">
                            <span>
                                exclusiveMaximum&nbsp;
                                {/* Tooltip can be added here if needed */}:
                            </span>
                        </td>
                        <td>
                            <Switch checked={!!data.exclusiveMaximum} onCheckedChange={(value) => handleSwitch(value, "exclusiveMaximum")} />
                        </td>
                    </tr>
                    <tr>
                        <td className="w-32 other-label">{LocaleProvider("minimum")}: </td>
                        <td>
                            <Input
                                type="number"
                                value={data.minimum ?? ""}
                                placeholder={LocaleProvider("minimum")}
                                onChange={(e) => handleChange(Number(e.target.value), "minimum")}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="w-32 other-label">{LocaleProvider("maximum")}: </td>
                        <td>
                            <Input
                                type="number"
                                value={data.maximum ?? ""}
                                placeholder={LocaleProvider("maximum")}
                                onChange={(e) => handleChange(Number(e.target.value), "maximum")}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="w-32 other-label">
                            <span>
                                {LocaleProvider("enum")}
                                <Checkbox labelText="" checked={checked} onCheckedChange={handleEnumCheck} className="ml-2" /> :
                            </span>
                        </td>
                        <td>
                            <Textarea className="bg-white" value={enumValue} disabled={!checked} placeholder={LocaleProvider("enum_msg")} rows={3} onChange={(e) => handleEnumChange(e.target.value)} />
                        </td>
                    </tr>
                    {checked && (
                        <tr>
                            <td className="w-32 other-label">
                                <span>{LocaleProvider("enum_desc")} : </span>
                            </td>
                            <td>
                                <Textarea
                                    value={data.enumDesc ?? ""}
                                    disabled={!checked}
                                    placeholder={LocaleProvider("enum_desc_msg")}
                                    rows={2}
                                    onChange={(e) => handleEnumDescChange(e.target.value)}
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
