import React, { createContext, useContext, useRef, useState } from "react";
import * as utils from "../utils";
import { handleSchema } from "../schema";

let fieldNum = 1;

type SchemaState = {
    message: string;
    data: any;
    open: string[];
};

type SchemaContextType = {
    message: string;
    data: any;
    open: string[];
    changeEditorSchemaAction: (value: any) => void;
    changeNameAction: (prefix: string[], name: string, value: string) => void;
    changeValueAction: (key: string[], value: any) => void;
    changeTypeAction: (key: string[], value: string) => void;
    enableRequireAction: (prefix: string[], name: string, required: boolean) => void;
    requireAllAction: (value: any, required: boolean) => void;
    deleteItemAction: (key: string[]) => void;
    addFieldAction: (prefix: string[], name?: string) => void;
    loadRefFieldsAction: (key: string[]) => void;
    addChildFieldAction: (key: string[]) => void;
    setOpenValueAction: (key: string[], value?: boolean) => void;
    changeCustomValue: (data: any) => void;
    setOpen: (prefix: string, value: boolean) => void;
    isOpen: (prefix: string) => boolean;
};

const defaultState = {
    message: "",
    data: {
        title: "",
        type: "object",
        properties: {},
        required: [],
    },
    open: ["properties"],
};

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

export function SchemaProvider({ children, data }: { children: React.ReactNode; data: any }) {
    const [state, setState] = useState<SchemaState>({ ...utils.cloneObject(defaultState), data });
    const changeEditorSchemaAction = (value: any) => {
        handleSchema(value);
        setState((prevState) => ({ ...prevState, data: value }));
    };

    const setOpen = (prefix: string, value: boolean) => {
        setState((prevState) => ({
            ...prevState,
            open: value ? [...prevState.open, prefix] : prevState.open.filter((item) => item !== prefix),
        }));
    };

    const isOpen = (prefix: string) => {
        return state.open.includes(prefix);
    };

    const changeNameAction = (prefix: string[], oldName: string, newName: string) => {
        // Clone the data to avoid mutating state directly
        let newData = utils.cloneObject(state.data);

        // Get the parent object containing the properties
        const parentKeys = [...prefix];
        const properties = utils.getData(newData, parentKeys);

        // If the new name already exists, do nothing
        if (properties[newName]) return;

        // Rename the key
        properties[newName] = properties[oldName];
        delete properties[oldName];

        // Update required array if present
        const requiredKeys = [...parentKeys.slice(0, -1), "required"];
        let required = utils.getData(newData, requiredKeys);
        if (Array.isArray(required)) {
            const idx = required.indexOf(oldName);
            if (idx !== -1) {
                required[idx] = newName;
                utils.setData(newData, requiredKeys, required);
            }
        }

        // Update the properties in the parent object
        utils.setData(newData, parentKeys, properties);

        setState((prevState) => ({ ...prevState, data: newData }));
    };

    const changeValueAction = (key: string[], value: any) => {
        if (value) {
            const newData = utils.cloneObject(state.data);
            utils.setData(newData, key, value);
            setState((prevState) => ({ ...prevState, data: newData }));
        } else {
            const newData = utils.cloneObject(state.data);
            utils.deleteData(newData, key);
            setState((prevState) => ({ ...prevState, data: newData }));
        }
    };

    const changeTypeAction = (key: string[], value: string) => {
        let parentKeys = utils.getParentKeys(key);
        let oldData = stateRef.current.data;
        console.log("changeTypeAction", key, value);

        let parentData = utils.getData(oldData, parentKeys);
        if (parentData.type === value) {
            return;
        }
        let newParentDataItem = utils.defaultSchema[value];
        let parentDataItem = parentData.description ? { description: parentData.description } : {};
        let newParentData = Object.assign({}, newParentDataItem, parentDataItem);
        let newKeys = ([] as string[]).concat(parentKeys);
        utils.setData(stateRef.current.data, newKeys, newParentData);
    };

    const enableRequireAction = (prefix: string[], name: string, required: boolean) => {
        let parentKeys = utils.getParentKeys(prefix);
        let oldData = stateRef.current.data;
        let parentData = utils.getData(oldData, parentKeys);
        let requiredData: string[] = [].concat(parentData.required || []);
        let index = requiredData.indexOf(name);

        if (!required && index >= 0) {
            requiredData.splice(index, 1);
            parentKeys.push("required");
            if (requiredData.length === 0) {
                utils.deleteData(stateRef.current.data, parentKeys);
            } else {
                utils.setData(stateRef.current.data, parentKeys, requiredData);
            }
        } else if (required && index === -1) {
            requiredData.push(name);
            parentKeys.push("required");
            utils.setData(stateRef.current.data, parentKeys, requiredData);
        }
    };

    const requireAllAction = (value: any, required: boolean) => {
        let data = utils.cloneObject(value);
        utils.handleSchemaRequired(data, required);
        stateRef.current.data = data;
    };

    const deleteItemAction = (key: string[]) => {
        let name = key[key.length - 1];
        let oldData = stateRef.current.data;
        let parentKeys = utils.getParentKeys(key);
        let parentData = utils.getData(oldData, parentKeys);
        let newParentData: Record<string, any> = {};
        for (let i in parentData) {
            if (i !== name) {
                newParentData[i] = parentData[i];
            }
        }
        utils.setData(stateRef.current.data, parentKeys, newParentData);
    };

    const addFieldAction = (prefix: string[], name?: string) => {
        let oldData = stateRef.current.data;
        let propertiesData = utils.getData(oldData, prefix);
        let newPropertiesData: Record<string, any> = {};
        let parentKeys = utils.getParentKeys(prefix);
        let parentData = utils.getData(oldData, parentKeys);
        let requiredData = ([] as string[]).concat(parentData.required || []);

        if (!name) {
            newPropertiesData = Object.assign({}, propertiesData);
            let ranName = "field_" + fieldNum++;
            newPropertiesData[ranName] = utils.defaultSchema.string;
            requiredData.push(ranName);
        } else {
            for (let i in propertiesData) {
                newPropertiesData[i] = propertiesData[i];
                if (i === name) {
                    let ranName = "field_" + fieldNum++;
                    newPropertiesData[ranName] = utils.defaultSchema.string;
                    requiredData.push(ranName);
                }
            }
        }
        utils.setData(stateRef.current.data, prefix, newPropertiesData);
        parentKeys.push("required");
        utils.setData(stateRef.current.data, parentKeys, requiredData);
    };

    const loadRefFieldsAction = (key: string[]) => {
        let oldData = stateRef.current.data;
        utils.loadRef(stateRef.current.data, key);
        let parentKeys = utils.getParentKeys(key);
        let parentData = utils.getData(oldData, parentKeys);
        let requiredData: string[] = [].concat(parentData.required || []);
        parentKeys.push("required");
        utils.setData(stateRef.current.data, parentKeys, requiredData);
    };

    const addChildFieldAction = (key: string[]) => {
        let oldData = stateRef.current.data;
        let propertiesData = utils.getData(oldData, key);
        let newPropertiesData = Object.assign({}, propertiesData);
        let ranName = "field_" + fieldNum++;
        newPropertiesData[ranName] = utils.defaultSchema.string;
        utils.setData(stateRef.current.data, key, newPropertiesData);

        let parentKeys = utils.getParentKeys(key);
        let parentData = utils.getData(oldData, parentKeys);
        let requiredData = ([] as string[]).concat(parentData.required || []);
        requiredData.push(ranName);
        parentKeys.push("required");
        utils.setData(stateRef.current.data, parentKeys, requiredData);
    };

    const setOpenValueAction = (key: string[], value?: boolean) => {
        const keys = key.join(utils.JSONPATH_JOIN_CHAR);
        let status;
        if (typeof value === "undefined") {
            status = utils.getData(stateRef.current.open, [keys]) ? false : true;
        } else {
            status = value;
        }
        utils.setData(stateRef.current.open, [keys], status);
    };

    const changeCustomValue = (data: any) => {
        console.log("changeCustomValue", data);
        // utils.setData(stateRef.current.data, [], data);
    };

    const contextValue: SchemaContextType = {
        message: state.message,
        data: state.data,
        open: state.open,
        changeEditorSchemaAction,
        changeNameAction,
        changeValueAction,
        changeTypeAction,
        enableRequireAction,
        requireAllAction,
        deleteItemAction,
        addFieldAction,
        loadRefFieldsAction,
        addChildFieldAction,
        setOpenValueAction,
        changeCustomValue,
        setOpen,
        isOpen,
    };

    return <SchemaContext.Provider value={contextValue}>{children}</SchemaContext.Provider>;
}

export function useSchemaContext() {
    const ctx = useContext(SchemaContext);
    if (!ctx) throw new Error("useSchemaContext must be used within a SchemaProvider");
    return ctx;
}
