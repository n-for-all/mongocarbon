import { FunctionSpec } from "~/types/index";

const findOneAndUpdateSpec: FunctionSpec = {
    on: "collection",
    name: "findOneAndUpdate",
    label: "Find One And Update",
    description: "Updates a single document based on the filter and sort criteria, returning the updated document.",
    confirmation: {
        required: true,
        message: "Are you sure you want to update the document matching the filter?, if the filter is empty the first document in the collection will be updated.",
    },
    parameters: [
        {
            type: "bson",
            name: "filter",
            label: "Filter",
            description: "The selection criteria for the update. Specify an empty document to match the first document in the collection.",
            value: {},
            options: {
                type: "autocomplete",
            },
            default: {},
        },
        {
            type: "bsonOrArray",
            name: "update",
            label: "Update",
            description: "The update document or aggregation pipeline.",
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
            description: "Optional settings for the findOneAndUpdate operation.",
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
                    arrayFilters: [], // Array filters for update
                },
            },
            default: {},
        },
    ],
};

export default findOneAndUpdateSpec;
