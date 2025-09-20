export type FunctionParameter = {
    type: string;
    description: string;
    name: string;
    value: any;
    label: string;
    options?: {
        type: string;
        values?: Record<string, any>;
    };
    default?: any;
    parse?: (value: any, urlParams: Record<string, any>) => any;
};

export type FunctionSpec = {
    on: "collection" | "database" | "server";
    name: string;
    label: string;
    description: string;
    parameters: FunctionParameter[];
    confirmation?: {
        required: boolean;
        message: string;
    };
};
