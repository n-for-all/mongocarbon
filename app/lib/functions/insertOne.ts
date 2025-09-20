import { FunctionSpec } from "~/types/index";

const insertOneSpec: FunctionSpec = {
    on: "collection",
    name: "insertOne",
    label: "Insert One",
    description: "Insert a single document into the collection",
    parameters: [
        {
            type: "bson",
            name: "document",
            label: "Document",
            description: "The document to insert",
            value: {},
            options: {
                type: "autocomplete",
            },
            default: {},
        },
        {
            type: "bson",
            name: "options",
            label: "Options",
            description: "Optional settings for the insert operation (e.g., writeConcern)",
            value: {},
            options: {
                type: "select",
                values: {
                    writeConcern: {}, // Write concern document (optional)
                },
            },
            default: {},
        },
    ],
};

export default insertOneSpec;