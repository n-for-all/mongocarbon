import { FunctionSpec } from "~/types/index";

const estimatedDocumentCountSpec: FunctionSpec = {
    on: "collection",
    name: "estimatedDocumentCount",
    label: "Estimated Document Count",
    description: "Returns the count of all documents in a collection or view using collection metadata.",
    parameters: [
        {
            type: "bson",
            name: "options",
            label: "Options",
            description: "Optional settings that affect the count behavior.",
            value: {},
            options: {
                type: "select",
                values: {
                    maxTimeMS: 5000, // Maximum time to allow the count to run
                },
            },
            default: {},
        },
    ],
};

export default estimatedDocumentCountSpec;