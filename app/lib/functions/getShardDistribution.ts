import { FunctionSpec } from "~/types/index";

const getShardDistributionSpec: FunctionSpec = {
    on: "collection",
    name: "getShardDistribution",
    label: "Get Shard Distribution",
    description: "Returns information about the distribution of data across shards for a sharded collection.",
    parameters: [
        // No parameters required for getShardDistribution
    ],
};

export default getShardDistributionSpec;
