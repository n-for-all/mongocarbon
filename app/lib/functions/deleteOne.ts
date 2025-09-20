import { FunctionSpec } from "~/types/index";

const deleteOneSpec: FunctionSpec = {
    on: "collection",
    name: "deleteOne",
    label: "Delete One",
    description: "Delete a single document from the collection",
    confirmation: {
        required: true,
        message: "Are you sure you want to delete the document matching the filter?, if the filter is empty the first document in the collection will be deleted.",
    },
    parameters: [
        {
            type: "bson",
            name: "filter",
            label: "Filter",
            description: "The query filter to match the document to delete",
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
            description: "Optional settings for the delete operation",
            value: {},
            options: {
                type: "select",
                values: {
                    writeConcern: {}, // Write concern document (optional)
                    collation: {}, // Collation rules (optional)
                    hint: {}, // Index hint (optional, document or string)
                },
            },
            default: {},
        },
    ],
};

export default deleteOneSpec;