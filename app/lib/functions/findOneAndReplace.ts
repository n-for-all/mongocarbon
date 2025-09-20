import { FunctionSpec } from "~/types/index";

const findOneAndReplaceSpec: FunctionSpec = {
    on: "collection",
    name: "findOneAndReplace",
    label: "Find One And Replace",
    description: "Replaces a single document based on the filter and sort criteria, returning the replaced document.",
    confirmation: {
        required: true,
        message: "Are you sure you want to replace the document matching the filter?, if the filter is empty the first document in the collection will be replaced.",
    },
    parameters: [
        {
            type: "bson",
            name: "filter",
            label: "Filter",
            description: "The selection criteria for the replacement. Specify an empty document to match the first document in the collection.",
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
            description: "Optional settings for the findOneAndReplace operation.",
            value: {},
            options: {
                type: "select",
                values: {
                    writeConcern: {}, // Write concern document
                    projection: {}, // Fields to return
                    sort: {}, // Sorting order for matched documents
                    maxTimeMS: 5000, // Time limit in milliseconds
                    upsert: false, // Insert if not found
                    returnDocument: "before", // "before" or "after"
                    returnNewDocument: false, // Deprecated, use returnDocument
                    collation: {}, // Collation rules
                },
            },
            default: {},
        },
    ],
};

export default findOneAndReplaceSpec;
