import React, { useMemo, useContext } from "react";
import FieldInput from "./FieldInput";
import LocaleProvider from "../LocalProvider";
import { JSONPATH_JOIN_CHAR, SCHEMA_TYPE } from "../../utils";
import { Mapper } from "./Mapper";
import { useSchemaContext } from "../../context/SchemaContext";
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/ui/select";
import { Edit, Plus, Settings, Trash } from "lucide-react";
import { Button } from "~/ui/button";
import { Input } from "~/ui/input";
import { Switch } from "~/ui/switch";

type SchemaItemProps = {
    name: string;
    data: any;
    prefix: string;
    showAdv: (prefix: string[], value: any) => void;
};

export default function SchemaItem({ name, data, prefix, showAdv }: SchemaItemProps) {
    const value = data.properties[name];
    const context = useSchemaContext();

    const tagPaddingLeftStyle = useMemo(() => {
        const length = prefix.split(".").filter((n) => n !== "properties").length;
        return { paddingLeft: `${20 * (length + 1)}px` };
    }, [prefix]);

    const getPrefix = () => [prefix, name];

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valueName = e.target.value;
        if (data.properties[valueName] && typeof data.properties[valueName] === "object") {
            alert(`The field "${valueName}" already exists.`);
            return;
        }
        context.changeNameAction(prefix, name, valueName);
    };

    const handleChangeDesc = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = [...getPrefix(), "description"];
        context.changeValueAction(key, e.target.value);
    };

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = [...getPrefix(), "title"];
        context.changeValueAction(key, e.target.value);
    };

    const handleChangeType = (value: string) => {
        const key = [...getPrefix(), "type"];
        console.log("handleChangeType", getPrefix());
        context.changeTypeAction(key, value);
    };

    const handleDeleteItem = () => {
        const nameArray = getPrefix();
        context.deleteItemAction(nameArray);
        context.enableRequireAction(prefix, name, false);
    };

    const handleShowAdv = () => {
        if (value.type === "object") {
            const key = [...getPrefix(), "properties"].join(".");
            context.setOpen(key, !context.isOpen(key));
        } else {
            const key = getPrefix().join(".");
            context.setOpen(key, !context.isOpen(key));
        }
    };

    const handleAddField = () => {
        context.addFieldAction(prefix, name);
    };

    const handleClickIcon = () => {
        const keyArr = [...getPrefix(), "properties"];
        context.setOpenValueAction(keyArr);
    };

    const handleEnableRequire = (checked) => {
        context.enableRequireAction(prefix, name, checked);
    };

    const prefixArray = [...prefix, name];
    const prefixStr = prefix;
    const prefixArrayStr = [...prefixArray, "properties"];
    const show = context.isOpen(prefix);
    const showIcon = context.isOpen(prefixArrayStr.join("."));

    if (!show && prefix.length > 0) {
        return null;
    }

    return (
        <div className="my-1 schema-item" data-prefix={getPrefix().join(".")}>
            <table style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        <td>
                            <div className="flex items-center">
                                {value.type === "object" ? (
                                    <span style={{ cursor: "pointer" }} onClick={handleClickIcon}>
                                        {showIcon ? "▼" : "▶"}
                                    </span>
                                ) : null}

                                <label className="flex items-center gap-1 mr-2">
                                    <Switch size="xs" onChange={handleEnableRequire} checked={typeof data.required === "undefined" ? false : data.required.indexOf(name) !== -1} />
                                    Required
                                </label>
                                <FieldInput onChange={handleChangeName} value={name} />
                            </div>
                        </td>
                        <td>
                            <Select value={value.type || "custom"} onValueChange={handleChangeType}>
                                <SelectTrigger className="w-32 bg-white">{value.type ? SCHEMA_TYPE[value.type] : value.type ? value.type : "Custom"}</SelectTrigger>
                                <SelectContent>
                                    {Object.keys(SCHEMA_TYPE).map((item, idx) => (
                                        <SelectItem value={item} key={idx}>
                                            {SCHEMA_TYPE[item]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </td>
                        <td>
                            <Input placeholder={LocaleProvider("title")} value={value.title || ""} onChange={handleChangeTitle} style={{ minWidth: 120 }} />
                        </td>
                        <td>
                            <Input placeholder={LocaleProvider("description")} value={value.description || ""} onChange={handleChangeDesc} style={{ minWidth: 120 }} />
                        </td>
                        <td>
                            <div className="flex justify-end flex-1 w-full">
                                <Button variant={"ghost"} onClick={handleShowAdv}>
                                    <Settings className="size-4" />
                                </Button>
                                <Button variant={"ghost"} onClick={handleDeleteItem}>
                                    <Trash className="size-4" />
                                </Button>
                                {value.type === "object" ? (
                                    <Button variant={"ghost"} onClick={handleAddField}>
                                        <Plus className="size-4" />
                                    </Button>
                                ) : (
                                    <Button variant={"ghost"} onClick={handleAddField}>
                                        <Plus className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="option-formStyle">
                <Mapper prefix={getPrefix().join(".")} data={value} showAdv={showAdv} />
            </div>
        </div>
    );
}
