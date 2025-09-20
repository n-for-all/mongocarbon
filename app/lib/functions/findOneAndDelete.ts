import { FunctionSpec } from "~/types/index";

const findOneAndDeleteSpec: FunctionSpec = {
    on: "collection",
    name: "findOneAndDelete",
    label: "Find One And Delete",
    description: "Deletes a single document based on the filter and sort criteria, returning the deleted document.",
    confirmation: {
        required: true,
        message: "Are you sure you want to delete the document matching the filter?, if the filter is empty the first document in the collection will be deleted.",
    },

    parameters: [
        {
            type: "bson",
            name: "filter",
            label: "Filter",
            description: "The selection criteria for the deletion. Specify an empty document to delete the first document returned in the collection.",
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
            description: "Optional settings for the findOneAndDelete operation.",
            value: {},
            options: {
                type: "select",
                values: {
                    writeConcern: {}, // Write concern document
                    projection: {}, // Fields to return
                    sort: {}, // Sorting order for matched documents
                    maxTimeMS: 5000, // Time limit in milliseconds
                    collation: {}, // Collation rules
                },
            },
            default: {},
        },
    ],
};

export default findOneAndDeleteSpec;
