import SchemaJsonComponent from "./components/SchemaComponents/SchemaJson";
import { SchemaProvider } from "./context/SchemaContext";

export const SchemaJson = ({
    data,
    showAdv,
}: {
    data: any;
    showAdv: (prefix: string[], value: any) => void;
}) => {
    return (
        <SchemaProvider data={data}>
            <SchemaJsonComponent showAdv={showAdv} />
        </SchemaProvider>
    );
};
