import { FunctionSpec } from "~/types/index";

const getIndexesSpec: FunctionSpec = {
    on: "collection",
    name: "indexes",
    label: "Get Indexes",
    description: "Returns an array of documents describing the existing indexes on the collection, including hidden indexes and indexes currently being built.",
    parameters: [
        // No parameters required for getIndexes
    ],
};

export default getIndexesSpec;