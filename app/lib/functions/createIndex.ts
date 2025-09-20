import { FunctionSpec } from "~/types/index";

const createIndexSpec: FunctionSpec = {
    on: "collection",
    name: "createIndex",
    label: "Create Index",
    description: "Creates an index on a collection. Specify the keys, options, and optionally the commit quorum.",
    parameters: [
        {
            type: "bson",
            name: "keys",
            label: "Keys",
            description: "A document containing field and value pairs for the index keys. Use 1 for ascending, -1 for descending, or specify index types (e.g., 'text', 'hashed').",
            value: {},
            options: {
                type: "autocomplete",
            },
            default: {},
        },
        {
            type: "bson",
            name: "options",
            label: "Options",
            description: "Optional settings for index creation (e.g., unique, sparse, name, expireAfterSeconds, etc.).",
            value: {},
            options: {
                type: "select",
                values: {
                    unique: false,
                    sparse: false,
                    name: "",
                    expireAfterSeconds: 0,
                    background: false,
                    partialFilterExpression: {},
                    collation: {},
                },
            },
            default: {},
        },
        {
            type: "stringOrNumber",
            name: "commitQuorum",
            label: "Commit Quorum",
            description:
                "Optional. The minimum number of voting replica set members required for index build completion. Can be an integer or string (e.g., 'majority', 'votingMembers').",
            value: "",
            options: {
                type: "select",
                values: {
                    majority: "majority",
                    votingMembers: "votingMembers",
                },
            },
            default: "",
        },
    ],
};

export default createIndexSpec;
