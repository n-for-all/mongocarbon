import { FunctionSpec } from "~/types/index";

export default {
    on: "collection",
    name: "find",
    label: "Find",
    description: "Find documents in a collection",
    parameters: [
        {
            type: "bson",
            description: "The query filter document (empty means match all)",
            name: "filter",
            value: {}, // The query filter document (empty means match all)
            label: "Filter",
            options: {
                type: "autocomplete",
            },
            default: {}, // this will be passed to the function if value is not set or parameter is omitted
        },
        {
            name: "options",
            type: "bson",
            value: {},
            options: {
                type: "select",
                values: {
                    projection: {}, // Fields to include or exclude (optional)
                    sort: {}, // Sort order, e.g. {"age": 1} for ascending (optional)
                    skip: 0, // Number of documents to skip (optional)
                    limit: 10, // Maximum number of documents to return (optional)
                    collation: {}, // Collation rules (optional)
                    hint: {}, // Index hint (optional)
                    maxTimeMS: 5000, // Max time in ms for the query (optional)
                },
            },
            parse: (value, urlParams) => {
                let newValue: {
                    [x: string]: any;
                } = {};
                if (typeof value == "object") {
                    newValue = { ...value };
                }
                if (urlParams.sort) {
                    newValue.sort = {};
                    newValue.sort[urlParams.sort] = Number(urlParams.direction || 0);
                }
                if (urlParams.skip) {
                    newValue.skip = Number(urlParams.skip);
                }
                if (urlParams.limit) {
                    newValue.limit = Number(urlParams.limit);
                }
                return newValue;
            },
            label: "Options",
            description: "Optional settings for the query (e.g., sort, limit, skip)",
            default: {
                skip: 0,
                limit: 10,
            }, // this will be passed to the function if value is not set or parameter is omitted
        },
    ],
} as FunctionSpec;
