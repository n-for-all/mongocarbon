import { FunctionSpec } from "~/types/index";

const statsSpec: FunctionSpec = {
    on: "collection",
    name: "stats",
    label: "Stats",
    description: "Returns statistics about the collection, such as storage size, document count, and index details.",
    parameters: [
        {
            type: "bson",
            name: "options",
            label: "Options",
            description: "Optional settings for the stats operation.",
            value: {},
            options: {
                type: "select",
                values: {
                    scale: 1, // Scale factor for sizes
                    indexDetails: false, // Include index details
                    indexDetailsKey: {}, // Filter index details by key
                    indexDetailsName: "", // Filter index details by name
                },
            },
            default: {},
        },
    ],
};

export default statsSpec;