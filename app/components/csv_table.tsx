import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@carbon/react";
import { JsonTreeEditor } from "./tree";
import { CopyText } from "./copy_text";
import { EJSON, ObjectId } from "bson";

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
		<Table isSortable={true} size="md" useZebraStyles={false}>
			<TableHead>
				<TableRow>
					{headers.map((header, index) => {
						return (
							<TableHeader
								className="bg-neutral-200"
								sortDirection={sort.field == header ? (sort.direction > 0 ? "ASC" : "DESC") : "NONE"}
								isSortHeader={sort.field == header}
								isSortable={true}
								onClick={() => {
									onSort(header);
								}}
								id={`${header}-${index}`}
								key={header}>
								{header}
							</TableHeader>
						);
					})}
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.map((row) => (
					<TableRow key={row._id}>
						{Object.keys(row).map((key) => {
							if ((Array.isArray(row[key]) || row[key] instanceof Object) && !(row[key] instanceof ObjectId || row[key] instanceof Date)) {
								
								return (
									<TableCell key={key}>
										<div className="flex items-start gap-2 group/item">
											<JsonTreeEditor autocompleteItems={[]} allowEdit={allowEdit} data={row[key]} />
											<CopyText className="p-1 ml-auto opacity-0 group-hover/item:opacity-100 hover:bg-white" text={EJSON.stringify(row[key])} />
										</div>
									</TableCell>
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
								<TableCell key={key}>
									<div className="flex items-center gap-1 px-1 group hover:bg-white">
										{EJSON.stringify(row[key])}
										<CopyText className="p-1 ml-auto opacity-0 group-hover:opacity-100 hover:bg-neutral-200" text={output} />
									</div>
								</TableCell>
							);
						})}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
