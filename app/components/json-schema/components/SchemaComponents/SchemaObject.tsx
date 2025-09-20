import SchemaItem from "./SchemaItem";

type SchemaObjectProps = {
    data: any;
    prefix: string;
    showAdv: (prefix: string[], value: any) => void;
};

export default function SchemaObject({ data, prefix, showAdv }: SchemaObjectProps) {
    // Optionally, you can use useMemo for optimization if needed
    // const items = useMemo(() => Object.keys(data.properties), [data.properties]);
    return Object.keys(data.properties).map((name, index) => <SchemaItem key={index} data={data} name={name} prefix={prefix} showAdv={showAdv} />);
}
