import { FunctionSpec } from "~/types/index";

const replaceOneSpec: FunctionSpec = {
    on: "collection",
    name: "replaceOne",
    label: "Replace One",
    description: "Replaces a single document that matches the filter with the replacement document.",
    confirmation: {
        required: true,
        message: "Are you sure you want to replace the document matching the filter?, if the filter is empty the first document in the collection will be replaced.",
    },
    parameters: [
        {
            type: "bson",
            name: "filter",
            label: "Filter",
            description: "The query filter to match the document to replace.",
            value: {},
            options: {
                type: "autocomplete",
            },
            default: {},
        },
        {
            type: "bson",
            name: "replacement",
            label: "Replacement",
            description: "The replacement document.",
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
            description: "Optional settings for the replace operation.",
            value: {},
            options: {
                type: "select",
                values: {
                    upsert: false, // Insert if not found
                    writeConcern: {}, // Write concern document
                    collation: {}, // Collation rules
                    hint: "", // Index hint (document or string)
                    sort: {}, // Sort order for the replacement
                },
            },
            default: {},
        },
    ],
};

export default replaceOneSpec;