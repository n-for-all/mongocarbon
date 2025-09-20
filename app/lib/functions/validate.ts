import { FunctionSpec } from "~/types/index";

const validateSpec: FunctionSpec = {
    on: "collection",
    name: "validate",
    label: "Validate",
    description: "Validates a collection and its indexes for correctness. Can optionally repair inconsistencies and check BSON conformance.",
    parameters: [
        {
            type: "bson",
            name: "options",
            label: "Options",
            description: "Optional settings for the validate operation",
            value: {},
            options: {
                type: "select",
                values: {
                    full: false, // Scan the entire collection (optional)
                    repair: false, // Attempt to fix inconsistencies (optional, MongoDB 5.0+)
                    checkBSONConformance: false, // Check BSON conformance (optional, MongoDB 6.2+)
                },
            },
            default: {},
        },
    ],
};

export default validateSpec;