import { FunctionSpec } from "~/types/index";

const configureQueryAnalyzerSpec: FunctionSpec = {
    on: "collection",
    name: "configureQueryAnalyzer",
    label: "Configure Query Analyzer",
    description: "Configures the query analyzer for a collection. Set the mode to 'full' or 'off', and optionally specify the number of samples per second.",
    parameters: [
        {
            type: "bson",
            name: "options",
            label: "Options",
            description: "Settings for the query analyzer",
            value: {},
            options: {
                type: "select",
                values: {
                    mode: "full", // Required: "full" or "off"
                    samplesPerSecond: 1, // Optional: double, 0-50 if mode is "full"
                },
            },
            default: {
                mode: "full",
            },
        },
    ],
};

export default configureQueryAnalyzerSpec;