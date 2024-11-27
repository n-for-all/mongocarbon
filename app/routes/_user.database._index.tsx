import {
	Grid,
	Column,
	Table,
	TableCell,
	TableRow,
	TableBody,
	Button,
	AccordionItem,
	Accordion,
	Select,
	SelectItem,
	Pagination,
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	ButtonSkeleton,
	InlineNotification,
	Search,
} from "@carbon/react";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import db, { ConnectionData } from "~/lib/db";
import { getUserSession } from "~/utils/session.server";
import { SyntheticEvent, useState } from "react";
import { convertBytes, isValidCollectionName, isValidDatabaseName, numberWithCommas } from "~/utils/functions";
import Title from "~/components/title";
import { ArrowRight, DataTable, SortAscending, SortDescending, TrashCan } from "@carbon/icons-react";
import { convertMongoTimestamp } from "~/utils/functions.server";
import { ListDatabasesResult, Timestamp } from "mongodb";
import { Database } from "~/lib/data/database";
import config from "~/config";
import { DatabaseDeleteModal } from "~/components/database";
export const loader: LoaderFunction = async ({ request, params }) => {
	const session = await getUserSession(request);
	const connection = session.get("connection");

	let mongo: ConnectionData;

	try {
		mongo = await db(connection);
		const databases: ListDatabasesResult & {
			operationTime?: Timestamp | any;
		} = await mongo.getDatabasesWithDetails();

		if (databases) {
			databases.operationTime = databases.operationTime ? convertMongoTimestamp(databases.operationTime) : null;
		}

		return Response.json(
			{ status: "success", stats: databases },
			{
				headers: {
					"Cache-Control": "no-store",
				},
			}
		);
	} catch (error: any) {
		return Response.json({ status: "error", error: error.message }, { status: 500 });
	}
};

const validate = ({ dbName, collectionName }) => {
	const errors = {};

	if (!dbName || dbName.trim() == "" || !isValidDatabaseName(dbName)) {
		errors["dbName"] = "The database name is invalid";
	}

	if (!collectionName || collectionName.trim() == "" || !isValidCollectionName(collectionName)) {
		errors["collectionName"] = "The collection name is invalid";
	}
	return errors;
};
export const action: ActionFunction = async ({ request }) => {
	try {
		const jsonQuery = await request.json();

		if (!jsonQuery) {
			return Response.json({ status: "error", message: "Invalid submission" }, { status: 500 });
		}

		if (jsonQuery.create) {
			const errors = validate(jsonQuery.create);
			if (Object.keys(errors).length > 0) {
				return Response.json({ status: "error", message: "Please specify a valid name for the database and the collection to be created", errors }, { status: 500 });
			}

			const { dbName, collectionName } = jsonQuery.create;

			const session = await getUserSession(request);
			const connection = session.get("connection");

			let mongo: ConnectionData;

			mongo = await db(connection);

			const database = new Database(mongo, config);
			await database.createDatabase(dbName, collectionName);

			return Response.json({ status: "success", message: "Database is created" }, { status: 200 });
		} else if (jsonQuery.delete) {
			const { name } = jsonQuery.delete;

			if (!name || typeof name != "string" || !isValidDatabaseName(name)) {
				return Response.json({ status: "error", message: "Invalid database" }, { status: 500 });
			}

			const session = await getUserSession(request);
			const connection = session.get("connection");

			let mongo: ConnectionData;

			mongo = await db(connection);

			const database = new Database(mongo, config);
			await database.deleteDatabase(name);
			return Response.json({ status: "success", message: "Database is deleted" }, { status: 200 });
		}
	} catch (e: any) {
		return Response.json({ status: "error", message: e.message }, { status: 500 });
	}
};

export default function DatabasePage() {
	const loaderData = useLoaderData<typeof loader>();
	// const matches = useMatches();
	const [sort, setSort] = useState("");
	const [direction, setDirection] = useState("asc");
	const [isDelete, setIsDelete] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const navigate = useNavigate();
	const stats = loaderData?.stats;
	if (loaderData?.error) {
		return <InlineNotification title="Error" subtitle={loaderData.error} hideCloseButton={true} />;
	}
	if (!stats) {
		return <div>Loading...</div>;
	}

	switch (sort) {
		case "name":
			if (direction == "desc") {
				stats.databases.sort((a, b) => b.name.localeCompare(a.name));
			} else {
				stats.databases.sort((a, b) => a.name.localeCompare(b.name));
			}
			break;
		case "sizeOnDisk":
			if (direction == "desc") {
				stats.databases.sort((b, a) => a.sizeOnDisk - b.sizeOnDisk);
			} else {
				stats.databases.sort((a, b) => a.sizeOnDisk - b.sizeOnDisk);
			}
			break;
		case "empty":
			if (direction == "desc") {
				stats.databases.sort((b, a) => a.empty - b.empty);
			} else {
				stats.databases.sort((a, b) => a.empty - b.empty);
			}
			break;
		default:
			break;
	}
	return (
		<>
			<Grid className="database-page" fullWidth>
				<Column lg={16} md={8} sm={4}>
					<div className="flex items-center justify-between pb-4">
						<div>
							<Title title={stats.databases.length}>
								<span className="font-normal opacity-50">Databases:</span> {stats.databases.length}
							</Title>
							<p className="text-sm">Total Size: {convertBytes(stats.totalSize)}</p>
						</div>
						<div className="flex items-center justify-end gap-2">
							<Search
								placeholder="Find a database"
								labelText="Search"
								closeButtonLabelText="Clear search input"
								id="search-database"
								onChange={(e) => {
									setSearch(e.target.value);
								}}
							/>
							<span className="text-sm">Sort:</span>
							<Select
								hideLabel={true}
								id="sort"
								onChange={(e: SyntheticEvent<HTMLSelectElement>) => {
									setSort((e.target as HTMLSelectElement).value);
								}}>
								<SelectItem value="" text="---" />
								<SelectItem value="name" text="By Name" />
								<SelectItem value="sizeOnDisk" text="By Size on Disk" />
								<SelectItem value="empty" text="By Empty" />
							</Select>
							<Button
								hasIconOnly
								size="md"
								kind="ghost"
								renderIcon={direction == "asc" ? SortAscending : SortDescending}
								iconDescription="Sort Direction"
								onClick={(e: SyntheticEvent) => {
									e.preventDefault();
									setDirection(direction == "asc" ? "desc" : "asc");
								}}></Button>
						</div>
					</div>
					{stats.databases.map((database: any, index: number) => {
						if (search && search.trim() != "" && !(database.name.toLowerCase().indexOf(search.toLowerCase()) == 0)) {
							return null;
						}
						return (
							<div key={index} className="mb-3 bg-neutral-100">
								<div className="flex items-center justify-between px-4 py-2 text-base border-b border-solid border-neutral-200">
									<span className="flex items-center gap-1">
										<DataTable /> <strong>{database.name}</strong>
									</span>
									<div className="flex flex-wrap items-center gap-2">
										<Button
											kind="danger--tertiary"
											renderIcon={TrashCan}
											size="sm"
											onClick={(e: SyntheticEvent) => {
												e.preventDefault();
												setIsDelete(database.name);
											}}>
											Drop Database
										</Button>
										<Button kind="tertiary" renderIcon={ArrowRight} size="sm" href={`/database/${database.name}`}>
											View
										</Button>
									</div>
								</div>
								<div className="grid grid-cols-5 px-4 py-2">
									<div className="flex flex-col text-sm">
										<span className="block mb-1 font-bold">Size on Disk:</span>
										<span className="font-normal">{convertBytes(database.sizeOnDisk)}</span>
									</div>
									<div className="flex flex-col text-sm">
										<span className="block mb-1 font-bold">Empty:</span>
										<span className="font-normal">{database.empty ? "Yes" : "No"}</span>
									</div>
								</div>
							</div>
						);
					})}
				</Column>
			</Grid>
			<DatabaseDeleteModal
				open={!(isDelete == null || isDelete == "")}
				onClose={() => {
					setIsDelete(null);
				}}
				onSuccess={() => {
					setIsDelete(null);
					navigate(`/database`, { replace: true });
				}}
				name={isDelete || ""}
			/>
		</>
	);
}
