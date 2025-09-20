import { FunctionSpec } from "~/types/index";

const renameCollectionSpec: FunctionSpec = {
    on: "collection",
    name: "renameCollection",
    label: "Rename Collection",
    description: "Renames a collection to the specified target name. Optionally drops the target collection if it exists.",
    parameters: [
        {
            type: "string",
            name: "target",
            label: "Target Name",
            description: "The new name of the collection.",
            value: "",
            options: {
                type: "autocomplete",
            },
            default: "",
        },
        {
            type: "boolean",
            name: "dropTarget",
            label: "Drop Target",
            description: "If true, drops the target collection before renaming. Default is false.",
            value: false,
            options: {
                type: "select",
                values: {
                    true: true,
                    false: false,
                },
            },
            default: false,
        },
    ],
};

export default renameCollectionSpec;