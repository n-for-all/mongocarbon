import { FunctionSpec } from "~/types/index";

const totalIndexSizeSpec: FunctionSpec = {
    on: "collection",
    name: "totalIndexSize",
    label: "Total Index Size",
    description: "Returns the total size in bytes of all indexes for the collection. This is a shortcut for the stats command's totalIndexSize field.",
    parameters: [
        // No parameters required for totalIndexSize
    ],
};

export default totalIndexSizeSpec;
