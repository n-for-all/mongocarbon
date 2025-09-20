import "./schemaJson.css";
import { Mapper } from "./Mapper";
import { useSchemaContext } from "../../context/SchemaContext";

const SchemaJson = ({ showAdv }: { showAdv: (prefix: string[], value: any) => void }) => {
    const context = useSchemaContext();
    return (
        <div className="schema-content">
            <Mapper prefix={""} data={context.data} showAdv={showAdv} />
        </div>
    );
};

export default SchemaJson;
