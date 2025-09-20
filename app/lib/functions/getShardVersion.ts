import { FunctionSpec } from "~/types/index";

const getShardVersionSpec: FunctionSpec = {
    on: "collection",
    name: "getShardVersion",
    label: "Get Shard Version",
    description: "Returns information about the shard version for a sharded collection.",
    parameters: [
        // No parameters required for getShardVersion
    ],
};

export default getShardVersionSpec;
