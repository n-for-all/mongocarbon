import { FunctionSpec } from "~/types/index";

const totalSizeSpec: FunctionSpec = {
    on: "collection",
    name: "totalSize",
    label: "Total Size",
    description: "Returns the total size in bytes for the collection, including all data and indexes. This is a shortcut for the stats command's totalSize field.",
    parameters: [
        // No parameters required for totalSize
    ],
};

export default totalSizeSpec;