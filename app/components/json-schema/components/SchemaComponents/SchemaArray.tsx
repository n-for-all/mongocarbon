import React from "react";
import { useMemo } from "react";
import { SCHEMA_TYPE, JSONPATH_JOIN_CHAR } from "../../utils";
import LocaleProvider from "../LocalProvider";
import { Mapper } from "./Mapper";
import { useSchemaContext } from "../../context/SchemaContext";
import { Input } from "~/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/ui/select";
import { Plus, Settings } from "lucide-react";
import { Button } from "~/ui/button";

type SchemaArrayProps = {
    data: any;
    prefix: string;
    showAdv: (prefix: string[], value: any) => void;
};

export default function SchemaArray({ data, prefix, showAdv }: SchemaArrayProps) {
    const items = data.items;
    const length = useMemo(() => prefix.split(".").filter((name) => name !== "properties").length, [prefix]);
    const tagPaddingLeftStyle = { paddingLeft: `${20 * (length + 1)}px` };

    const context = useSchemaContext();
    const getPrefix = () => [prefix, "items"];

    const handleChangeType = (value: string) => {
        const key = [...getPrefix(), "type"];
        context.changeTypeAction(key, value);
    };

    const handleChangeDesc = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const key = [...getPrefix(), "description"];
        context.changeValueAction(key, value);
    };

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const key = [...getPrefix(), "title"];
        context.changeValueAction(key, value);
    };

    const handleAddChildField = () => {
        const keyArr = [...getPrefix(), "properties"];
        context.addChildFieldAction(keyArr);
        context.setOpenValueAction(keyArr, true);
    };

    const handleClickIcon = () => {
        const keyArr = [...getPrefix(), "properties"];
        context.setOpenValueAction(keyArr);
    };

    const handleShowAdv = () => {
        context.setOpen(getPrefix().join("."), !context.isOpen(getPrefix().join(".")));
    };

    const prefixArray = [prefix, "items"];
    const showIcon = "▶";

    if (typeof data.items === "undefined") return null;

    return (
        <div className="array-type">
            <table className="array-item-type" style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        <td>
                            <div className="flex items-center">
                                {items.type === "object" ? (
                                    <span style={{ cursor: "pointer" }} onClick={handleClickIcon}>
                                        {showIcon ? "▼" : "▶"}
                                    </span>
                                ) : null}
                                <span className="ml-4" >Items</span>
                            </div>
                        </td>
                        <td>
                            <Select value={items.type || "custom"} onValueChange={handleChangeType}>
                                <SelectTrigger className="w-32 bg-white">{items.type ? SCHEMA_TYPE[items.type] : items.type ? items.type : "Custom"}</SelectTrigger>
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
                            <Input placeholder={LocaleProvider("title")} value={items.title || ""} onChange={handleChangeTitle} style={{ minWidth: 120 }} />
                        </td>
                        <td>
                            <Input placeholder={LocaleProvider("description")} value={items.description || ""} onChange={handleChangeDesc} style={{ minWidth: 120 }} />
                        </td>
                        <td>
                            <Button variant={"ghost"} onClick={handleShowAdv}>
                                <Settings className="w-4 h-4" />
                            </Button>
                            {items.type === "object" ? (
                                <Button variant={"ghost"} onClick={handleAddChildField}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            ) : null}
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="option-formStyle">
                <Mapper prefix={prefixArray.join(".")} data={items} showAdv={showAdv} />
            </div>
        </div>
    );
}
