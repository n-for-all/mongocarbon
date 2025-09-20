import { FunctionSpec } from "~/types/index";

const updateOneSpec: FunctionSpec = {
    on: "collection",
    name: "updateOne",
    label: "Update One",
    description: "Update a single document in the collection",
    confirmation: {
        required: true,
        message: "Are you sure you want to update the document matching the filter?, if the filter is empty the first document in the collection will be updated.",
    },
    parameters: [
        {
            type: "bson",
            name: "filter",
            label: "Filter",
            description: "The query filter to match the document to update",
            value: {},
            options: {
                type: "autocomplete",
            },
            default: {},
        },
        {
            type: "bson",
            name: "update",
            label: "Update",
            description: "The update operations to apply to the matched document",
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
            description: "Optional settings for the update operation",
            value: {},
            options: {
                type: "select",
                values: {
                    upsert: false, // Insert if not found (optional)
                    writeConcern: {}, // Write concern document (optional)
                    collation: {}, // Collation rules (optional)
                    arrayFilters: [], // Array filters for update (optional)
                    hint: {}, // Index hint (optional)
                    let: {}, // Variables for use in the update expression (optional)
                    sort: {}, // Sort order for the update (optional)
                },
            },
            default: {},
        },
    ],
};

export default updateOneSpec;