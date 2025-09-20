import React, { useState } from "react";
import { TreeNode } from "./treenode";

interface JsonTreeEditorProps {
    data?: object;
    allowEdit?: boolean;
    isExpanded?: boolean;
    autocompleteItems: Record<string, any>;
    autocompleteType?: "search" | "select";
    onChange?: (data: object) => void;
}

export const JsonTreeEditor: React.FC<JsonTreeEditorProps> = ({ autocompleteItems, autocompleteType, isExpanded, allowEdit = true, data = {}, onChange }) => {
    const handleUpdate = (path: string[], value: any) => {
        const newData = { ...data };
        let current: any = newData;

        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }

        current[path[path.length - 1]] = value;

        onChange?.(newData);
    };

    const handleDelete = (path: string[]) => {
        if (path.length === 0) {
            onChange?.({});
            return;
        }

        const newData = { ...data };
        let current: any = newData;

        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }

        if (Array.isArray(current)) {
            current.splice(parseInt(path[path.length - 1]), 1);
        } else {
            delete current[path[path.length - 1]];
        }

        onChange?.(newData);
    };

    const handleAdd = (path: string[], key: string, value: any) => {
        const newData = { ...data };
        let current: any = newData;

        for (const segment of path) {
            current = current[segment];
        }

        if (Array.isArray(current)) {
            current.push(value);
        } else {
            current[key] = value;
        }

        onChange?.(newData);
    };

    return (
        <TreeNode
            autocompleteItems={autocompleteItems}
            autocompleteType={autocompleteType}
            allowEdit={!!(onChange && allowEdit)}
            expanded={isExpanded}
            data={data}
            path={[]}
            onUpdate={onChange ? handleUpdate : undefined}
            onDelete={onChange ? handleDelete : undefined}
            onAdd={onChange ? handleAdd : undefined}
        />
    );
};
