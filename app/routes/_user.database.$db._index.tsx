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
	Dropdown,
	Select,
	SelectItem,
	ActionableNotification,
	InlineNotification,
	Modal,
	Search,
} from "@carbon/react";
import { Add, ArrowRight, DataTable, Delete, SortAscending, SortDescending, TrashCan } from "@carbon/icons-react";
import { ActionFunction, data, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useMatches, useNavigate, useParams } from "@remix-run/react";
import { useState, SyntheticEvent } from "react";
import { CollectionAddModal, CollectionDeleteModal } from "~/components/collection";
import { DatabaseDeleteModal } from "~/components/database";
import Title from "~/components/title";
import config from "~/config";
import { Collection } from "~/lib/data/collection";
import { Database } from "~/lib/data/database";
import db, { ConnectionData } from "~/lib/db";
import { convertBytes, isValidCollectionName, isValidDatabaseName, numberWithCommas } from "~/utils/functions";
import { getUserSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
	if (!params.db) {
		return Response.json({ status: "error", message: "No database specified" }, { status: 500 });
	}
	const session = await getUserSession(request);
	const connection = session.get("connection");

	let mongo: ConnectionData;

	try {
		mongo = await db(connection);

		const database = new Database(mongo, config);
		const stats = await database.getStats(params.db);

		return Response.json(
			{ status: "success", stats },
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

const validate = ({ collectionName }) => {
	const errors = {};

	if (!collectionName || collectionName.trim() == "" || !isValidCollectionName(collectionName)) {
		errors["collectionName"] = "The collection name is invalid";
	}
	return errors;
};

export const action: ActionFunction = async ({ request, params }) => {
	try {
		if (!params.db) {
			return Response.json({ status: "error", message: "No database specified" }, { status: 500 });
		}
		const dbName = params.db;
		const jsonQuery = await request.json();

		if (!jsonQuery) {
			return Response.json({ status: "error", message: "Invalid submission" }, { status: 500 });
		}

		if (jsonQuery.create) {
			const errors = validate(jsonQuery.create);
			if (Object.keys(errors).length > 0) {
				return Response.json({ status: "error", message: "Please specify a valid name for the collection to be created", errors }, { status: 500 });
			}

			const { collectionName } = jsonQuery.create;

			const session = await getUserSession(request);
			const connection = session.get("connection");

			let mongo: ConnectionData;

			mongo = await db(connection);

			const collection = new Collection(mongo, dbName, collectionName, config, connection.allowDiskUse);
			await collection.createCollection(collectionName);

			return Response.json({ status: "success", message: "Collection is created" }, { status: 200 });
		} else if (jsonQuery.delete) {
			const { collectionName } = jsonQuery.delete;

			if (!collectionName || typeof collectionName != "string" || !isValidCollectionName(collectionName)) {
				return Response.json({ status: "error", message: "Invalid collection" }, { status: 500 });
			}

			const session = await getUserSession(request);
			const connection = session.get("connection");

			let mongo: ConnectionData;

			mongo = await db(connection);

			const collection = new Collection(mongo, dbName, collectionName, config, connection.allowDiskUse);
			await collection.deleteCollection();

			return Response.json({ status: "success", message: "Collection is deleted" }, { status: 200 });
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
	const [isDelete, setIsDelete] = useState(false);
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [isAdd, setIsAdd] = useState(false);
	const [collectionDelete, setCollectionDelete] = useState<string | null>(null);

	const stats = loaderData?.stats;
	if (loaderData?.error) {
		return <InlineNotification title="Error" subtitle={loaderData.error} hideCloseButton={true} />;
	}
	if (!stats) {
		return <div>Loading...</div>;
	}

	let totalDocuments = 0;

	switch (sort) {
		case "name":
			if (direction == "desc") {
				stats.collectionList.sort((a, b) => b.name.localeCompare(a.name));
			} else {
				stats.collectionList.sort((a, b) => a.name.localeCompare(b.name));
			}
			break;
		case "documents":
			if (direction == "desc") {
				stats.collectionList.sort((a, b) => b.count - a.count);
			} else {
				stats.collectionList.sort((a, b) => a.count - b.count);
			}
			break;
		case "document-size":
			if (direction == "desc") {
				stats.collectionList.sort((b, a) => {
					const avgDocumentSizeA = a.stats.storageStats?.storageSize / a.count;
					const avgDocumentSizeB = b.stats.storageStats?.storageSize / b.count;
					return avgDocumentSizeA - avgDocumentSizeB;
				});
			} else {
				stats.collectionList.sort((a, b) => {
					const avgDocumentSizeA = a.stats.storageStats?.storageSize / a.count;
					const avgDocumentSizeB = b.stats.storageStats?.storageSize / b.count;
					return avgDocumentSizeA - avgDocumentSizeB;
				});
			}
			break;
		case "storage-size":
			if (direction == "desc") {
				stats.collectionList.sort((b, a) => a.stats.storageStats?.storageSize - b.stats.storageStats?.storageSize);
			} else {
				stats.collectionList.sort((a, b) => a.stats.storageStats?.storageSize - b.stats.storageStats?.storageSize);
			}
			break;
		case "indexes":
			if (direction == "desc") {
				stats.collectionList.sort((b, a) => a.indexes.length - b.indexes.length);
			} else {
				stats.collectionList.sort((a, b) => b.indexes.length - a.indexes.length);
			}
			break;
		case "index-size":
			if (direction == "desc") {
				stats.collectionList.sort((b, a) => a.stats.storageStats?.totalIndexSize - b.stats.storageStats?.totalIndexSize);
			} else {
				stats.collectionList.sort((a, b) => a.stats.storageStats?.totalIndexSize - b.stats.storageStats?.totalIndexSize);
			}
			break;
		default:
			break;
	}
	return (
		<>
			<Grid className="database-page" fullWidth>
				<Column lg={16} md={8} sm={4}>
					<div className="flex flex-wrap items-center justify-between gap-2 pb-4 lg:flex-nowrap">
						<div>
							<Title title={stats.name}>
								<span className="font-normal opacity-50">Database:</span> {stats.name}
							</Title>
							<p className="mb-4 text-sm">
								Collections: {stats.collections}, Documents: {totalDocuments}
							</p>
							<div className="flex flex-wrap items-center gap-2">
								<Button
									size="sm"
									kind="tertiary"
									renderIcon={Add}
									iconDescription="Create Collection"
									onClick={(e: SyntheticEvent) => {
										e.preventDefault();
										setIsAdd(true);
									}}>
									Create Collection
								</Button>
								<Button
									size="sm"
									kind="danger--tertiary"
									renderIcon={TrashCan}
									iconDescription="Delete Database"
									onClick={(e: SyntheticEvent) => {
										e.preventDefault();
										setIsDelete(true);
									}}>
									Drop Database
								</Button>
							</div>
						</div>
						<div className="flex items-center justify-end gap-2">
							<Search
								placeholder="Find a collection"
								labelText="Search"
								closeButtonLabelText="Clear search input"
								id="search-collection"
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
								<SelectItem value="documents" text="By Documents" />
								<SelectItem value="document-size" text="By Avg. Document Size" />
								<SelectItem value="storage-size" text="By Storage Size" />
								<SelectItem value="indexes" text="By Indexes" />
								<SelectItem value="index-size" text="By Total Index Size" />
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
					{stats.collectionList.map((collection: any, index: number) => {
						if (search && search.trim() != "" && !(collection.name.toLowerCase().indexOf(search.toLowerCase()) == 0)) {
							return null;
						}
						const avgDocumentSize = collection.stats.storageStats?.storageSize / collection.count;
						return (
							<div key={index} className="mb-3 bg-neutral-100">
								<div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-base border-b border-solid border-neutral-200">
									<span className="flex items-center gap-1">
										<DataTable /> <strong>{collection.name}</strong>
									</span>
									<div className="flex flex-wrap items-center gap-2">
										<Button
											kind="danger--tertiary"
											renderIcon={TrashCan}
											size="sm"
											onClick={(e: SyntheticEvent) => {
												e.preventDefault();
												setCollectionDelete(collection.name);
											}}>
											Delete
										</Button>
										<Button kind="tertiary" renderIcon={ArrowRight} size="sm" href={`/database/${stats.name}/${collection.name}`}>
											View
										</Button>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-2 px-4 py-2 lg:grid-cols-5">
									<div className="flex flex-col text-sm">
										<span className="block mb-1 font-bold">Storage size:</span>
										<span className="font-normal">{convertBytes(collection.stats.storageStats?.storageSize)}</span>
									</div>
									<div className="flex flex-col text-sm">
										<span className="block mb-1 font-bold">Documents:</span>
										<span className="font-normal">{collection.count}</span>
									</div>
									<div className="flex flex-col text-sm">
										<span className="block mb-1 font-bold">Avg. document size:</span>
										<span className="font-normal">{convertBytes(avgDocumentSize)}</span>
									</div>
									<div className="flex flex-col text-sm">
										<span className="block mb-1 font-bold">Indexes:</span>
										<span className="font-normal">{collection.indexes.length}</span>
									</div>
									<div className="flex flex-col text-sm">
										<span className="block mb-1 font-bold">Total index size:</span>
										<span className="font-normal">{convertBytes(collection.stats.storageStats?.totalIndexSize)}</span>
									</div>
								</div>
								<Accordion>
									<AccordionItem title="More Details" className="pr-0 ">
										<div className="flex flex-col items-start w-full pb-4 lg:flex-row">
											<div className="flex-1 w-full">
												<Table>
													<TableBody>
														<TableRow>
															<TableCell className="font-bold">Namespace</TableCell>
															<TableCell>{collection.stats.ns}</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-bold">Host</TableCell>
															<TableCell>{collection.stats.host}</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-bold">Local Time</TableCell>
															<TableCell>{collection.stats.localTime}</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-bold">Reads Latency</TableCell>
															<TableCell>{numberWithCommas(collection.stats.latencyStats?.reads.latency)} ms</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-bold">Writes Latency</TableCell>
															<TableCell>{numberWithCommas(collection.stats.latencyStats?.writes.latency)} ms</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-bold">Commands Latency</TableCell>
															<TableCell>{numberWithCommas(collection.stats.latencyStats?.commands.latency)} ms</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-bold">Transactions Latency</TableCell>
															<TableCell>{numberWithCommas(collection.stats.latencyStats?.transactions.latency)} ms</TableCell>
														</TableRow>
													</TableBody>
												</Table>
											</div>
											<div className="flex-1 w-full">
												<Table className="mt-4 lg:mt-0">
													<TableBody>
														<TableRow>
															<TableCell className="font-bold">Storage Size</TableCell>
															<TableCell>{numberWithCommas(collection.stats.storageStats?.storageSize)} B</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-bold">Total Index Size</TableCell>
															<TableCell>{numberWithCommas(collection.stats.storageStats?.totalIndexSize)} B</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-bold">Total Size</TableCell>
															<TableCell>{numberWithCommas(collection.stats.storageStats?.totalSize)} B</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-bold">Count</TableCell>
															<TableCell>{collection.count}</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-bold">Collection Scans Total</TableCell>
															<TableCell>{numberWithCommas(collection.stats.queryExecStats?.collectionScans.total)}</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-bold">Collection Scans Non-Tailable</TableCell>
															<TableCell>{numberWithCommas(collection.stats.queryExecStats?.collectionScans.nonTailable)}</TableCell>
														</TableRow>
													</TableBody>
												</Table>
											</div>
										</div>
									</AccordionItem>
								</Accordion>
							</div>
						);
					})}
				</Column>
				<Column lg={16} md={8} sm={4} className="pb-10">
					<div className="flex items-center justify-between pb-4 mt-10">
						<div className="">
							<h4 className="text-xl font-medium">Details</h4>
							<p className="text-sm">Collections: {stats.collections}</p>
						</div>
					</div>
					<Table size="lg" useZebraStyles={false}>
						<TableBody>
							<TableRow>
								<TableCell>
									<strong>Collections </strong>
									<small className="block">(incl. system.namespaces)</small>
								</TableCell>
								<TableCell>{stats.collections}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<strong>Data Size</strong>
								</TableCell>
								<TableCell>{stats.dataSize}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<strong>Storage Size</strong>
								</TableCell>
								<TableCell>{stats.storageSize}</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>
									<strong>Views</strong>
								</TableCell>
								<TableCell>{stats.views}</TableCell>
							</TableRow>

							{/* <TableRow>
							<TableCell>
								<strong>File Size (on disk)</strong>
							</TableCell>
							<TableCell>{stats.fileSize}</TableCell>
						</TableRow> */}

							<TableRow>
								<TableCell>
									<strong>Avg Obj Size</strong>
								</TableCell>
								<TableCell>{stats.avgObjSize}</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>
									<strong>Objects</strong>
								</TableCell>
								<TableCell>{stats.objects}</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>
									<strong>Operation Time</strong>
								</TableCell>
								<TableCell>{stats.operationTime}</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>
									<strong>Cluster Time</strong>
								</TableCell>
								<TableCell>{stats.clusterTime}</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>
									<strong>Extents</strong>
								</TableCell>
								<TableCell>{stats.numExtents}</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>
									<strong>Extents Free List</strong>
								</TableCell>
								<TableCell>{stats.extentFreeListNum}</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>
									<strong>Indexes</strong>
								</TableCell>
								<TableCell>{stats.indexes}</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>
									<strong>Index Size</strong>
								</TableCell>
								<TableCell>{stats.indexSize}</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>
									<strong>Data File Version</strong>
								</TableCell>
								<TableCell>{stats.dataFileVersion}</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>
									<strong>File System Used Size</strong>
								</TableCell>
								<TableCell>{convertBytes(stats.fsUsedSize)}</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>
									<strong>File System Total Size</strong>
								</TableCell>
								<TableCell>{convertBytes(stats.fsTotalSize)}</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Column>
			</Grid>
			<CollectionAddModal
				open={isAdd}
				onClose={() => {
					setIsAdd(false);
				}}
				onSuccess={(dbName, collectionName) => {
					navigate(`/database/${dbName}/${collectionName}`, { replace: true });
				}}
				dbName={stats.name}
			/>
			<CollectionDeleteModal
				open={collectionDelete !== null}
				onClose={() => {
					setCollectionDelete(null);
				}}
				collectionName={collectionDelete || ""}
				onSuccess={() => {
					setCollectionDelete(null);
					window.location.reload();
				}}
				dbName={stats.name}
			/>
			<DatabaseDeleteModal
				open={isDelete}
				onClose={() => {
					setIsDelete(false);
				}}
				onSuccess={() => {
					setIsDelete(false);
					navigate(`/database`, { replace: true });
				}}
				name={stats.name}
			/>
		</>
	);
}
