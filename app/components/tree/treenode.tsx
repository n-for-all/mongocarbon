import { PlusIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon, XIcon, PencilIcon, TrashIcon } from "@primer/octicons-react";
import React, { useRef, useState } from "react";
import { CopyText } from "../copy_text";
import AutocompleteTextField from "../autocomplete/textarea";
import { mongodbOperators } from "~/utils/functions";
import { EJSON, ObjectId } from "bson";

interface TreeNodeProps {
	data: any;
	path: string[];
	autocompleteItems: string[];
	expanded?: boolean;
	allowEdit: boolean;
	onUpdate?: (path: string[], value: any) => void;
	onDelete?: (path: string[]) => void;
	onAdd?: (path: string[], key: string, value: any) => void;
}

const IconButton = ({ children, ...props }) => {
	return (
		<button {...props} className={"px-1 py-1 hover:bg-neutral-200" + (props.className ? " " + props.className : "")}>
			{children}
		</button>
	);
};

export const TreeNode: React.FC<TreeNodeProps> = ({ expanded, allowEdit, data, path, autocompleteItems, onUpdate, onDelete, onAdd }) => {
	const [isExpanded, setIsExpanded] = useState(expanded);
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState("");
	const [newKey, setNewKey] = useState("");
	const [newValue, setNewValue] = useState("");
	const [isAddingNew, setIsAddingNew] = useState(false);
	const ref = useRef(null);

	const handleToggle = () => setIsExpanded(!isExpanded);

	const handleEdit = () => {
		setEditValue(EJSON.stringify(data));
		setIsEditing(true);
	};

	const handleSave = () => {
		try {
			const parsedValue = EJSON.parse(editValue);
			onUpdate?.(path, parsedValue);
			setIsEditing(false);
		} catch (error) {
			onUpdate?.(path, editValue);
			setIsEditing(false);
		}

		setIsExpanded(true);
	};

	const handleAdd = () => {
		try {
			const parsedValue = newValue.trim() === "" ? "" : EJSON.parse(newValue);
			onAdd?.(path, newKey, parsedValue);
			setNewKey(() => "");
			setNewValue(() => "");
			setIsAddingNew(false);
		} catch (error) {
			onAdd?.(path, newKey, newValue);
			setNewKey(() => "");
			setNewValue(() => "");
			setIsAddingNew(false);
		}

		setIsExpanded(true);
	};

	const renderValue = () => {
		if (isEditing && allowEdit) {
			let style = {};
			if (ref.current) {
				style = { minWidth: (ref.current as HTMLSpanElement).clientWidth + 5 + "px" };
			}
			return (
				<div className="flex items-center gap-2">
					<AutocompleteTextField
						className="w-32 h-6 px-1 pt-0.5 text-xs font-medium border border-solid  border-neutral-300"
						trigger={["$"].concat(autocompleteItems.map((e) => e.substring(0, 1)))}
						options={mongodbOperators.map((e) => e.substring(1)).concat(autocompleteItems)}
						attributes={{ placeholder: "Value (JSON or String or Number ...)", style: { resize: "both", ...style } }}
						value={editValue}
						Component={"textarea"}
						onChange={(value) => setEditValue(value)}
					/>
					<IconButton onClick={handleSave} className="">
						<CheckIcon className="w-4 h-4" />
					</IconButton>
					<IconButton onClick={() => setIsEditing(false)} className="">
						<XIcon className="w-4 h-4" />
					</IconButton>
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
						"px-1 rounded",
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
			<div className="flex items-center gap-1 mt-1 mb-1 ml-4">
				<AutocompleteTextField
					className="w-32 h-6 px-1 text-xs font-medium border border-solid  border-neutral-300"
					trigger={["$"].concat(autocompleteItems.map((e) => e.substring(0, 1)))}
					options={mongodbOperators.concat(autocompleteItems)}
					attributes={{ placeholder: "Key" }}
					value={newKey}
					Component={"input"}
					onChange={(value) => setNewKey(value)}
				/>
				<span className="text-xs">:</span>
				<AutocompleteTextField
					className="w-32 h-6 px-1 pt-0.5 text-xs font-medium border border-solid  border-neutral-300"
					trigger={["$"].concat(autocompleteItems.map((e) => e.substring(0, 1)))}
					options={mongodbOperators.map((e) => e.substring(1)).concat(autocompleteItems)}
					attributes={{ placeholder: "Value (JSON or String or Number ...)", style: { resize: "both" } }}
					value={newValue}
					Component={"textarea"}
					onChange={(value) => setNewValue(value)}
				/>
				<IconButton onClick={handleAdd} disabled={!newKey.trim()}>
					<CheckIcon className="w-4 h-4" />
				</IconButton>
				<IconButton
					onClick={() => {
						setNewKey(() => "");
						setNewValue(() => "");
						setIsAddingNew(false);
					}}>
					<XIcon className="w-4 h-4" />
				</IconButton>
			</div>
		);
	};

	if (typeof data !== "object" || data === null || data instanceof ObjectId || data instanceof Date) {
		return (
			<div className="relative flex items-center gap-1 py-0.5 text-sm hover:bg-neutral-100 group">
				<div className="w-4" />
				<span className="flex gap-1">
					<span className="font-medium text-center text-right min-w-4">{path[path.length - 1]}</span>
					<span className="font-medium text-center">:</span>
				</span>
				{renderValue()}
				<div className="flex items-center h-5 gap-1 ml-10 opacity-0 group-hover:opacity-100 left-full">
					{!isEditing && allowEdit && (
						<>
							<IconButton onClick={handleEdit} title="Edit">
								<PencilIcon className="w-4 h-4" />
							</IconButton>
							<IconButton onClick={() => onDelete?.(path)} className="px-1 py-1 text-red-600 hover:bg-neutral-200">
								<TrashIcon className="w-4 h-4" />
							</IconButton>
						</>
					)}
					<IconButton className="px-1 py-1 hover:bg-neutral-200">
						<CopyText text={EJSON.stringify(data)} />
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
				<button onClick={handleToggle} className="w-4 h-4">
					{isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
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
							<PlusIcon className="w-4 h-4" />
						</IconButton>
						<IconButton onClick={() => onDelete?.(path)} className="text-red-600">
							<TrashIcon className="w-4 h-4" />
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
