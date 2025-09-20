import { FunctionSpec } from "~/types/index";

const aggregateSpec: FunctionSpec = {
    on: "collection",
    name: "aggregate",
    label: "Aggregate",
    description: "Calculates aggregate values for the data in a collection or a view using a sequence of aggregation pipeline stages.",
    parameters: [
        {
            type: "array",
            name: "pipeline",
            label: "Pipeline",
            description: "A sequence of data aggregation operations or stages.",
            value: [],
            options: {
                type: "autocomplete",
            },
            default: [],
        },
        {
            type: "bson",
            name: "options",
            label: "Options",
            description: "Optional settings for the aggregation operation.",
            value: {},
            options: {
                type: "select",
                values: {
                    allowDiskUse: false, // Enables writing to temporary files
                    batchSize: 1000, // Number of documents to return per batch
                    collation: {}, // Collation rules
                    maxTimeMS: 5000, // Max time in ms for the aggregation
                    hint: {}, // Index hint
                    comment: "", // Optional comment
                    explain: false, // Return details on processing
                },
            },
            default: {},
        },
    ],
};

export default aggregateSpec;