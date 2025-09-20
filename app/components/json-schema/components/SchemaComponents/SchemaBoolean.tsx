import { Select, SelectTrigger, SelectContent, SelectItem } from "~/ui/select";
import LocaleProvider from "../LocalProvider";
import { useSchemaContext } from "../../context/SchemaContext";

type SchemaBooleanProps = {
    data: any;
};

export default function SchemaBoolean({ data }: SchemaBooleanProps) {
    const { changeCustomValue } = useSchemaContext();
    const value = typeof data.default === "undefined" ? "" : data.default ? "true" : "false";

    const handleChange = (val: string) => {
        data.default = val === "true";
        changeCustomValue(data);
    };

    return (
        <div>
            <div className="default-setting">{LocaleProvider("base_setting")}</div>
            <table className="w-full">
                <tbody>
                    <tr>
                        <td className="w-32 other-label">{LocaleProvider("default")}: </td>
                        <td>
                            <Select value={value} onValueChange={handleChange}>
                                <SelectTrigger className="w-32 bg-white">{value === "true" ? "True" : value === "false" ? "False" : "Select"}</SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">true</SelectItem>
                                    <SelectItem value="false">false</SelectItem>
                                </SelectContent>
                            </Select>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
