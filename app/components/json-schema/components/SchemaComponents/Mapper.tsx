import { useSchemaContext } from "../../context/SchemaContext";
import SchemaArray from "./SchemaArray";
import SchemaBoolean from "./SchemaBoolean";
import SchemaCustom from "./SchemaCustom";
import SchemaNumber from "./SchemaNumber";
import SchemaObject from "./SchemaObject";
import SchemaString from "./SchemaString";

//px-10 px-12 px-14 px-16 px-20 px-24 px-28 px-32

export const Mapper = ({ prefix, data, showAdv }: { prefix: string; data: any; showAdv: (prefix: string[], value: any) => void }) => {
    const context = useSchemaContext();
    switch (data.type) {
        case "array":
            return (
                <div className={`my-2 py-2 border rounded border-neutral-300 schema-${data.type} px-2 ${context.isOpen(prefix) ? "" : "hidden"}`}>
                    <SchemaArray prefix={prefix} data={data} showAdv={showAdv} />
                </div>
            );
        case "object":
            let nameArray: any = [prefix, "properties"].filter(Boolean);
            return (
                <div
                    className={`my-2 py-2 border rounded border-neutral-300 schema-${data.type} px-2 ${context.isOpen(nameArray.join(".")) ? "" : "hidden"}`}
                    data-prefix={nameArray.join(".")}
                    data-open={context.open}>
                    <SchemaObject prefix={nameArray.join(".")} data={data} showAdv={showAdv} />
                </div>
            );
        case "integer":
        case "number":
            return (
                <div className={`my-2 py-2 border rounded border-neutral-300 schema-${data.type} px-2 ${context.isOpen(prefix) ? "" : "hidden"}`}>
                    <SchemaNumber data={data} />
                </div>
            );
        case "string":
            return (
                <div
                    className={`my-2 py-2 border rounded border-neutral-300 schema-${data.type} px-2 ${context.isOpen(prefix) ? "" : "hidden"}`}
                    data-prefix={prefix}>
                    <SchemaString data={data} />
                </div>
            );
        case "boolean":
            return (
                <div className={`my-2 py-2 border rounded border-neutral-300 schema-${data.type} px-2 ${context.isOpen(prefix) ? "" : "hidden"}`}>
                    <SchemaBoolean data={data} />
                </div>
            );
        default:
            return (
                <div className={`my-2 py-2 border rounded border-neutral-300 schema-${data.type} px-2 ${context.isOpen(prefix) ? "" : "hidden"}`}>
                    <SchemaCustom data={data} />
                </div>
            );
    }
};
