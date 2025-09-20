import { PlusIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon, XIcon, PencilIcon, TrashIcon } from "@primer/octicons-react";
import React, { useRef, useState } from "react";
import { CopyText } from "../copy_text";
import AutocompleteTextField from "../autocomplete/textarea";
import { mongodbOperators } from "~/utils/functions";
import { EJSON, ObjectId } from "bson";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/ui/select";
import { CircleX } from "lucide-react";

const typeOptions = ["Auto", "String", "Number", "Boolean", "ObjectId", "Date", "Null", "Array", "Object"] as const;

interface TreeNodeProps {
    data: any;
    path: string[];
    autocompleteItems: Record<string, any>;
    autocompleteType?: "search" | "select";
    expanded?: boolean;
    allowEdit: boolean;
    onUpdate?: (path: string[], value: any) => void;
    onDelete?: (path: string[]) => void;
    onAdd?: (path: string[], key: string, value: any) => void;
}

type OptionsType = (typeof typeOptions)[number];

const getValueType = (value: any): OptionsType => {
    if (typeof value === "string") {
        return "String";
    } else if (typeof value === "number") {
        return "Number";
    } else if (typeof value === "boolean") {
        return "Boolean";
    } else if (value === null) {
        return "Null";
    } else if (value instanceof Date) {
        return "Date";
    } else if (Array.isArray(value)) {
        return "Array";
    } else if (typeof value === "object") {
        return "Object";
    } else {
        return "Auto";
    }
};

const IconButton = ({ children, ...props }) => {
    return (
        <button {...props} className={"px-1 py-1 hover:bg-neutral-200" + (props.className ? " " + props.className : "")}>
            {children}
        </button>
    );
};

export const TreeNode: React.FC<TreeNodeProps> = ({ expanded, allowEdit, data, path, autocompleteItems, autocompleteType, onUpdate, onDelete, onAdd }) => {
    const [isExpanded, setIsExpanded] = useState(expanded);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [selectedType, setSelectedType] = useState<OptionsType>("String");

    const [error, setError] = useState<string | null>(null);

    const ref = useRef(null);

    const handleToggle = () => setIsExpanded(!isExpanded);

    const handleEdit = () => {
        setEditValue(EJSON.stringify(data));
        setIsEditing(true);
    };

    const handleSave = () => {
        setError(null);
        parseValue(editValue)
            .then((parsedValue) => {
                onUpdate?.(path, parsedValue);
                setIsEditing(false);
                setError(null);
                setIsExpanded(true);
            })
            .catch((err) => {
                setError(err.message);
            });
    };

    const parseValue = (editValue): Promise<any> => {
        return new Promise((resolve, reject) => {
            switch (selectedType) {
                case "Number":
                    const num = Number(editValue);
                    if (isNaN(num)) {
                        reject(new Error("Invalid number"));
                        return;
                    }
                    resolve(num);
                    break;
                case "Boolean":
                    if (editValue == "1" || editValue.toLowerCase() === "true") {
                        resolve(true);
                    } else if (editValue == "0" || editValue.toLowerCase() === "false") {
                        resolve(false);
                    } else {
                        reject(new Error("Invalid boolean"));
                        return;
                    }
                    break;
                case "Null":
                    if (editValue.trim().toLowerCase() !== "null" && editValue.trim() !== "") {
                        reject(new Error('For "Null" type, the value must be "null" or empty'));
                        return;
                    }
                    resolve(null);
                    break;
                case "Date":
                    const date = new Date(editValue);
                    if (isNaN(date.getTime())) {
                        reject(new Error("Invalid date"));
                        return;
                    }
                    resolve(date);
                    break;
                case "Array":
                    try {
                        const arr = EJSON.parse(editValue);
                        if (!Array.isArray(arr)) {
                            reject(new Error("Value is not an array"));
                            return;
                        }
                        resolve(arr);
                    } catch (error: any) {
                        reject(new Error(error.message));
                        return;
                    }
                    break;
                case "ObjectId":
                    const objId = new ObjectId(editValue);
                    if (!ObjectId.isValid(objId)) {
                        reject(new Error("Invalid ObjectId"));
                        return;
                    }
                    resolve(objId);
                    break;
                case "Object":
                    try {
                        const obj = EJSON.parse(editValue);
                        if (typeof obj !== "object" || Array.isArray(obj) || obj === null) {
                            reject(new Error("Value is not an object"));
                            return;
                        }
                        resolve(obj);
                    } catch (error: any) {
                        reject(new Error(error.message));
                        return;
                    }
                    break;
                case "String":
                    resolve(editValue);
                    setIsEditing(false);
                    break;
                default:
                    try {
                        const parsedValue = EJSON.parse(editValue);
                        resolve(parsedValue);
                        setIsEditing(false);
                        return;
                    } catch (error: any) {
                        reject(new Error(error.message));
                        return;
                    }
            }
        });
    };

    const handleAdd = () => {
        setError(null);
        parseValue(newValue)
            .then((parsedValue) => {
                onAdd?.(path, newKey, parsedValue);
                setNewKey(() => "");
                setNewValue(() => "");
                setIsAddingNew(false);
            })
            .catch((err) => {
                setError(err.message);
            });
        setIsExpanded(true);
    };

    const renderValue = () => {
        if (isEditing && allowEdit) {
            let style = {};
            if (ref.current) {
                style = { minWidth: (ref.current as HTMLSpanElement).clientWidth + 5 + "px" };
            }
            return (
                <div className="flex flex-col">
                    <div className="flex items-start gap-2">
                        <div className="flex flex-col gap-1">
                            <textarea
                                className="w-32 h-6 px-1 pt-0.5 text-xs leading-5 font-medium border border-solid  border-neutral-300"
                                placeholder="Value (JSON or String or Number ...)"
                                style={{ resize: "both", ...style }}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                            />
                        </div>
                        <Select
                            value={selectedType}
                            onValueChange={(value) => {
                                setSelectedType(value as OptionsType);
                            }}>
                            <SelectTrigger className="w-12 h-6 px-1 py-1 text-xs bg-white min-w-24">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map((type) => (
                                    <SelectItem key={type} value={type} className="text-xs">
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <IconButton onClick={handleSave} className="">
                            <CheckIcon className="w-3 h-3" />
                        </IconButton>
                        <IconButton onClick={() => setIsEditing(false)} className="">
                            <XIcon className="w-3 h-3" />
                        </IconButton>
                    </div>
                    {error && (
                        <div className="flex items-center px-1 mt-1 text-xs text-red-600 bg-red-100">
                            <CircleX className="w-3 h-3 mr-1" />
                            {error}
                        </div>
                    )}
                </div>
            );
        }

        if (typeof data !== "object" || data === null || data instanceof ObjectId || data instanceof Date) {
            let output = data;
            if (data instanceof ObjectId) {
                output = `ObjectId("${data.toHexString()}")`;
            } else if (data instanceof Date) {
                output = data.toISOString();
            } else {
                output = EJSON.stringify(data);
            }

            return (
                <span
                    ref={ref}
                    className={[
                        "px-1 min-h-5 flex items-center rounded",
                        typeof data === "string" && "text-green-600",
                        typeof data === "number" && "text-blue-600",
                        data instanceof ObjectId && "text-red-600 font-medium",
                        data instanceof Date && "text-yellow-600 font-medium",
                        typeof data === "boolean" && "text-purple-600",
                        data === null && "text-neutral-600",
                    ]
                        .filter(Boolean)
                        .join(" ")}>
                    {output}
                </span>
            );
        }

        return null;
    };

    const renderAddNew = () => {
        if (!isAddingNew) return null;

        return (
            <div className="flex flex-col">
                <div className="flex items-start gap-1 mt-1 mb-1 ml-4">
                    {autocompleteType === "select" ? (
                        <Select
                            value={newKey}
                            onValueChange={(value) => {
                                const valueType = getValueType(autocompleteItems[value]);
                                setSelectedType(valueType);
                                setNewValue(JSON.stringify(autocompleteItems[value]));

                                setNewKey(value);
                            }}>
                            <SelectTrigger className="w-32 h-6 px-1 text-xs bg-white min-w-24">
                                <SelectValue placeholder="Key" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(autocompleteItems).map((key) => (
                                    <SelectItem key={key} value={key} className="text-xs">
                                        {key}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <AutocompleteTextField
                            className="w-32 h-6 px-1 text-xs font-medium border border-solid border-neutral-300"
                            trigger={["$"].concat(Object.keys(autocompleteItems).map((e) => e.substring(0, 1)))}
                            options={mongodbOperators.concat(Object.keys(autocompleteItems))}
                            attributes={{ placeholder: "Key" }}
                            value={newKey}
                            Component={"input"}
                            onChange={(value) => setNewKey(value)}
                        />
                    )}
                    <span className="flex items-center h-6 text-xs">:</span>
                    <textarea
                        className="w-32 h-6 px-1 pt-0 text-xs font-medium leading-5 border border-solid border-neutral-300"
                        placeholder="Value (JSON or String or Number ...)"
                        style={{ resize: "both" }}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                    />
                    <Select value={selectedType} onValueChange={(value) => setSelectedType(value as OptionsType)}>
                        <SelectTrigger className="w-12 h-6 px-1 py-1 text-xs bg-white min-w-24">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {typeOptions.map((type) => (
                                <SelectItem key={type} value={type} className="text-xs">
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <IconButton onClick={handleAdd} disabled={!newKey.trim()}>
                        <CheckIcon className="w-3 h-3" />
                    </IconButton>
                    <IconButton
                        onClick={() => {
                            setNewKey(() => "");
                            setNewValue(() => "");
                            setIsAddingNew(false);
                        }}>
                        <XIcon className="w-3 h-3" />
                    </IconButton>
                </div>
                {error && (
                    <div className="flex items-center px-1 mt-1 text-xs text-red-600 bg-red-100">
                        <CircleX className="w-3 h-3 mr-1" />
                        {error}
                    </div>
                )}
            </div>
        );
    };

    if (typeof data !== "object" || data === null || data instanceof ObjectId || data instanceof Date) {
        return (
            <div className="relative flex items-start gap-1 py-0.5 text-sm hover:bg-neutral-100 group">
                <div className="flex-shrink-0 w-3" />
                <span className="flex items-center mr-1 min-h-5">
                    <span className="font-medium text-center text-right">{path[path.length - 1]}</span>
                    <span className="font-medium text-center">:</span>
                </span>
                {renderValue()}
                <div className="flex items-center h-5 gap-1 ml-10 opacity-0 group-hover:opacity-100 left-full">
                    {!isEditing && allowEdit && (
                        <>
                            <IconButton onClick={handleEdit} title="Edit">
                                <PencilIcon className="w-3 h-3" />
                            </IconButton>
                            <IconButton onClick={() => onDelete?.(path)} className="px-1 py-1 text-red-600 hover:bg-neutral-200">
                                <TrashIcon className="w-3 h-3" />
                            </IconButton>
                        </>
                    )}
                    <IconButton className="px-1 py-1 hover:bg-neutral-200">
                        <CopyText iconClassName="w-3 h-3" text={EJSON.stringify(data)} />
                    </IconButton>
                </div>
            </div>
        );
    }

    let label: any = null;
    let isRoot = false;
    if (path.length) {
        label = `${path[path.length - 1]}:`;
    } else {
        isRoot = true;
        label = <span>{Array.isArray(data) && data && data["_id"] ? ` #${String(data["_id"])}:` : data && data._id ? ` #${String(data._id)}:` : null}</span>;
    }

    return (
        <div>
            <div className={"relative flex items-center gap-1 py-0.5 text-sm group" + (isRoot ? " mb-1" : "")}>
                <button onClick={handleToggle} className="w-3 h-3">
                    {isExpanded ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
                </button>
                <span className="flex items-center gap-1">
                    <span className="flex font-medium">{label}</span>
                    <span className="text-xs text-neutral-400 whitespace-nowrap">
                        {Array.isArray(data) ? "Array" : "Object"} ({Array.isArray(data) ? data.length : Object.keys(data).length} items)
                    </span>
                </span>
                {!isEditing && allowEdit && (
                    <div className="flex items-center h-5 gap-1 ml-10 opacity-0 group-hover:opacity-100 left-full">
                        <IconButton onClick={() => setIsAddingNew(true)}>
                            <PlusIcon className="w-3 h-3" />
                        </IconButton>
                        <IconButton onClick={() => onDelete?.(path)} className="text-red-600">
                            <TrashIcon className="w-3 h-3" />
                        </IconButton>
                    </div>
                )}
            </div>

            {allowEdit && renderAddNew()}

            {isExpanded && (
                <div className="ml-4">
                    {Object.entries(data).map(([key, value]) => (
                        <TreeNode
                            autocompleteItems={autocompleteItems}
                            allowEdit={allowEdit}
                            key={key}
                            data={value}
                            path={[...path, key]}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onAdd={onAdd}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
