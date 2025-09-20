import { FunctionSpec } from "~/types/index";

const distinctSpec: FunctionSpec = {
    on: "collection",
    name: "distinct",
    label: "Distinct",
    description: "Finds the distinct values for a specified field across a single collection or view and returns the unique results in an array.",
    parameters: [
        {
            type: "string",
            name: "field",
            label: "Field",
            description: "The field for which to return distinct values.",
            value: "",
            options: {
                type: "autocomplete",
            },
            default: "",
        },
        {
            type: "bson",
            name: "query",
            label: "Query",
            description: "A query that specifies the documents from which to retrieve the distinct values.",
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
            description: "Optional settings for the distinct operation.",
            value: {},
            options: {
                type: "select",
                values: {
                    collation: {}, // Collation rules
                    maxTimeMS: 5000, // Maximum time to allow the query to run
                    readConcern: "local", // Read concern level
                },
            },
            default: {},
        },
    ],
};

export default distinctSpec;
