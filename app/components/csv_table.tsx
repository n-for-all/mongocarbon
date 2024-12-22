import { JsonTreeEditor } from "./tree";
import { CopyText } from "./copy_text";
import { EJSON, ObjectId } from "bson";
import { SortAscIcon, SortDescIcon } from "@primer/octicons-react";

interface CsvTableProps {
    sort: { field: string; direction: number };
    rows: any[];
    allowEdit?: boolean;
    onSort: (field: string) => void;
}

export const CsvTable = ({ sort, rows, allowEdit = false, onSort }: CsvTableProps) => {
    const headers: string[] = [];
    if (rows.length > 0) {
        rows.forEach((row) => {
            Object.keys(row).forEach((key: string) => {
                if (!headers.includes(key)) headers.push(key);
            });
        });
    }
    return (
        <div className="w-full max-w-full overflow-auto">
            <table border={1} className="bg-neutral-50">
                <thead>
                    <tr>
                        {headers.map((header, index) => {
                            return (
                                <th
                                    className="px-4 py-2 text-left cursor-pointer text-md bg-neutral-100 group"
                                    onClick={() => {
                                        onSort(header);
                                    }}
                                    id={`${header}-${index}`}
                                    key={header}>
                                    <div className="flex items-center justify-between gap-2">
                                        {header}
                                        <span className={sort.field == header ? "opacity-60 group-hover:opacity-100" : " opacity-0 group-hover:opacity-40"}>
                                            {sort.field == header && sort.direction > 0 ? <SortAscIcon /> : <SortDescIcon />}
                                        </span>
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={row._id} className={"opacity-80 hover:opacity-100 border-b " + (rowIndex % 2 == 0 ? "bg-white" : "")}>
                            {Object.keys(row).map((key) => {
                                if ((Array.isArray(row[key]) || row[key] instanceof Object) && !(row[key] instanceof ObjectId || row[key] instanceof Date)) {
                                    return (
                                        <td className="px-4 py-2" key={key}>
                                            <div className="flex items-start gap-2 group/item">
                                                <JsonTreeEditor autocompleteItems={[]} allowEdit={allowEdit} data={row[key]} />
                                                <CopyText className="p-1 ml-auto opacity-0 group-hover/item:opacity-100 hover:bg-white" text={EJSON.stringify(row[key])} />
                                            </div>
                                        </td>
                                    );
                                }

                                let output = "";
                                if (row[key] instanceof ObjectId) {
                                    output = `ObjectId("${row[key].toHexString()}")`;
                                } else if (row[key] instanceof Date) {
                                    output = row[key].toISOString();
                                } else {
                                    output = EJSON.stringify(row[key]);
                                }
                                return (
                                    <td className="px-4 py-2" key={key}>
                                        <div className="flex items-center gap-1 px-1 text-md group hover:bg-white">
                                            {EJSON.stringify(row[key])}
                                            <CopyText className="p-1 ml-auto opacity-0 group-hover:opacity-100 hover:bg-neutral-200" text={output} />
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
