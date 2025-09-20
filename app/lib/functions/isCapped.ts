import { FunctionSpec } from "~/types/index";

const isCappedSpec: FunctionSpec = {
    on: "collection",
    name: "isCapped",
    label: "Is Capped",
    description: "Returns a boolean indicating whether the collection is a capped collection.",
    parameters: [
        // No parameters required for isCapped
    ],
};

export default isCappedSpec;
