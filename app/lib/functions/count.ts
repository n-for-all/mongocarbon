import { FunctionSpec } from "~/types/index";

const countSpec: FunctionSpec = {
    on: "collection",
    name: "count",
    label: "Count",
    description: "Returns the count of documents that would match a find() query for the collection or view.",
    parameters: [
        {
            type: "bson",
            name: "query",
            label: "Query",
            description: "The query selection criteria.",
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
            description: "Optional settings for the count operation.",
            value: {},
            options: {
                type: "select",
                values: {
                    limit: 0, // Maximum number of documents to count
                    skip: 0, // Number of documents to skip before counting
                    hint: "", // Index name or specification
                    maxTimeMS: 5000, // Maximum time to allow the query to run
                    readConcern: "local", // Read concern level
                    collation: {}, // Collation rules
                },
            },
            default: {},
        },
    ],
};

export default countSpec;
