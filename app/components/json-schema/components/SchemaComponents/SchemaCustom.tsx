import { useSchemaContext } from "../../context/SchemaContext";
import { Textarea } from "~/ui/textarea";

type SchemaCustomProps = {
    data: any;
};

export default function SchemaCustom({ data }: SchemaCustomProps) {
    const { changeCustomValue } = useSchemaContext();

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        changeCustomValue(e.target.value);
    };

    return (
        <div>
            <Textarea className="mt-2 bg-white" onChange={handleChange} placeholder={"Enter custom JSON schema"} value={JSON.stringify(data, null, 2) || ""} />
        </div>
    );
}
