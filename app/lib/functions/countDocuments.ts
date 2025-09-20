import { FunctionSpec } from "~/types/index";

const countDocumentsSpec: FunctionSpec = {
    on: "collection",
    name: "countDocuments",
    label: "Count Documents",
    description: "Returns the number of documents that match the query of the collection or view. Available for use in transactions.",
    parameters: [
        {
            type: "bson",
            name: "query",
            label: "Query",
            description: "The query selection criteria. To count all documents, specify an empty document.",
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
            description: "Optional settings that affect the count behavior.",
            value: {},
            options: {
                type: "select",
                values: {
                    limit: 0, // Maximum number of documents to count
                    skip: 0, // Number of documents to skip before counting
                    hint: "", // Index name or specification
                    maxTimeMS: 5000, // Maximum time to allow the count to run
                },
            },
            default: {},
        },
    ],
};

export default countDocumentsSpec;