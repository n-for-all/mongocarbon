export const JSONPATH_JOIN_CHAR = ".";
export const lang = "en_US";
export const format = [
    { name: "date-time", label: "Date Time" },
    { name: "date", label: "Date" },
    { name: "email", label: "Email" },
    { name: "hostname", label: "Host Name" },
    { name: "ipv4", label: "IPv4" },
    { name: "ipv6", label: "IPv6" },
    { name: "uri", label: "URI" },
];
export const SCHEMA_TYPE = { string: "String", number: "Number", array: "Array", object: "Object", boolean: "Boolean", integer: "Integer", datetime: "DateTime", custom: "Custom" };
export const defaultSchema = {
    string: {
        type: "string",
    },
    number: {
        type: "number",
    },
    array: {
        type: "array",
        items: {
            type: "string",
        },
    },
    object: {
        type: "object",
        properties: {},
    },
    boolean: {
        type: "boolean",
    },
    integer: {
        type: "integer",
    },
};

export function debounce(func: Function, wait: number) {
    let timeout: any;
    return function (this: any, ...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function getData(state: any, keys: string[]) {
    let curState = state;
    for (let i = 0; i < keys.length; i++) {
        curState = curState[keys[i]];
    }
    return curState;
}

export function setData(state: any, keys: string[], value: any) {
    let curState = state;
    for (let i = 0; i < keys.length - 1; i++) {
        curState = curState[keys[i]];
    }
    curState[keys[keys.length - 1]] = value;
}

export function loadRef(state: any, keys: string[]) {
    let curState = state;
    let curState2 = state;
    for (let i = 0; i < keys.length - 1; i++) {
        curState = curState[keys[i]];
    }
    for (let i = 0; i < keys.length - 2; i++) {
        curState2 = curState2[keys[i]];
    }
    const ref = curState.$ref.replace("#/definitions/", "");
    const definition = state.definitions[ref];
    delete curState.$ref;
    curState.type = definition.type;
    curState.properties = definition.properties;
    curState.required = definition.required;
    curState.description = definition.description;
    // console.log('~~~~~~~~~~~~~~~~')
    // console.log({
    //   curState: JSON.stringify(curState),
    //   curState2: JSON.stringify(curState2),
    //   definition: JSON.stringify(definition),
    // })
    // console.log('~~~~~~~~~~~~~~~~')
}

export function deleteData(state: any, keys: string[]) {
    let curState = state;
    for (let i = 0; i < keys.length - 1; i++) {
        curState = curState[keys[i]];
    }
    delete curState[keys[keys.length - 1]];
}

export function getParentKeys(keys: string[]) {
    if (keys.length === 1) return [];
    let arr = ([] as string[]).concat(keys);
    arr.splice(keys.length - 1, 1);
    return arr;
}

export function clearSomeFields(keys: string[], data: any) {
    const newData = Object.assign({}, data);
    keys.forEach((key) => {
        delete newData[key];
    });
    return newData;
}

function getFieldsTitle(data: any) {
    const requiredTitle: string[] = [];
    Object.keys(data).map((title) => {
        requiredTitle.push(title);
    });
    return requiredTitle;
}

export function handleSchemaRequired(schema: any, checked: boolean) {
    if (schema.type === "object") {
        let requiredTitle = getFieldsTitle(schema.properties);
        if (checked) {
            schema.required = ([] as string[]).concat(requiredTitle);
        } else {
            delete schema.required;
        }
        handleObject(schema.properties, checked);
    } else if (schema.type === "array") {
        handleSchemaRequired(schema.items, checked);
    } else {
        return schema;
    }
}

function handleObject(properties: any, checked: boolean) {
    for (var key in properties) {
        if (properties[key].type === "array" || properties[key].type === "object") handleSchemaRequired(properties[key], checked);
    }
}

export function cloneObject(obj: any): any {
    if (typeof obj === "object") {
        if (Array.isArray(obj)) {
            var newArr: any[] = [];
            obj.forEach(function (item, index) {
                newArr[index] = cloneObject(item);
            });
            return newArr;
        } else {
            var newObj: any = {};
            for (var key in obj) {
                newObj[key] = cloneObject(obj[key]);
            }
            return newObj;
        }
    } else {
        return obj;
    }
}
