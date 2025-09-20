import { FunctionSpec } from "~/types/index";

const dropIndexSpec: FunctionSpec = {
    on: "collection",
    name: "dropIndex",
    label: "Drop Index",
    description: "Drops or removes the specified index from a collection. You can specify the index by name or by index specification document. Cannot drop the default _id index.",
    confirmation: {
        required: true,
        message: "Are you sure you want to drop the index matching the name or specification?",
    },
    parameters: [
        {
            type: "stringOrBson",
            name: "index",
            label: "Index",
            description: "Required. The index to drop, specified by name or index specification document.",
            value: "",
            options: {
                type: "autocomplete",
            },
            default: "",
        },
    ],
};

export default dropIndexSpec;