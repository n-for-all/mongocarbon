import { FunctionSpec } from "~/types/index";

const storageSizeSpec: FunctionSpec = {
    on: "collection",
    name: "storageSize",
    label: "Storage Size",
    description: "Returns the storage size in bytes for the collection. This is a shortcut for the stats command's storageSize field.",
    parameters: [
        // No parameters required for storageSize
    ],
};

export default storageSizeSpec;