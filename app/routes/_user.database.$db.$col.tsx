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
	Pagination,
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	ButtonSkeleton,
} from "@carbon/react";
import { ArrowRight, Copy, CopyFile, ListBoxes, TableSplit, TrashCan } from "@carbon/icons-react";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useState, SyntheticEvent, useEffect, useRef } from "react";
import config from "~/config";
import { Collection } from "~/lib/data/collection";
import db, { ConnectionData } from "~/lib/db";
import { numberWithCommas } from "~/utils/functions";

import Title from "~/components/title";
import { JsonTreeEditor } from "~/components/tree";
import { CsvTable } from "~/components/csv_table";
import { CodeiumEditor } from "@codeium/react-code-editor/dist/esm";
import { AlertMessage } from "~/components/alert";

import { BSON, EJSON, ObjectId } from "bson";
import { CopyTextButton } from "~/components/copy_text";
import { getUserSession } from "~/utils/session.server";
import { CollectionDeleteModal } from "~/components/collection";

export const IdeWithAutocomplete = ({ onChange }) => {
	return (
		<CodeiumEditor
			language="json"
			className="text-sm"
			theme="light"
			onChange={onChange}
			options={{
				fontSize: 12,
				padding: {
					top: 10,
				},
			}}
		/>
	);
};

const loadCollectionData = async ({ jsonQuery, request, params, withColumns = false }) => {
	const url = new URL(request.url);

	const session = await getUserSession(request);
	const connection = session.get("connection");

	const query = url.searchParams;
	if (!params.db) {
		return Response.json({ status: "error", message: "No database specified" }, { status: 500 });
	}
	if (!params.col) {
		return Response.json({ status: "error", message: "No collection specified" }, { status: 500 });
	}
	let mongo: ConnectionData;

	mongo = await db(connection);

	let sortKey = query.get("sort") || jsonQuery.sort || "";
	const pagination = {
		limit: query.get("limit") || jsonQuery.limit || 10,
		skip: query.get("skip") || jsonQuery.skip || 0,
	};

	if (sortKey != "") {
		pagination["sort"] = {};
		pagination["sort"][sortKey] = query.get("direction") || jsonQuery.direction || 0;
	}

	const collection = new Collection(mongo, params.db, params.col, config);
	const collectionData = await collection.viewCollection({ ...jsonQuery, ...pagination });
	let columns = null;
	if (withColumns) {
		columns = await collection.getColumns();
	}
	return { ...collectionData, documents: EJSON.stringify(collectionData.docs), params, pagination, columns };
};

export const action: ActionFunction = async ({ request, params }) => {
	try {
		const jsonQuery = await request.json();
		if (!jsonQuery || !jsonQuery.query) {
			return Response.json({ status: "error", message: "No query specified" }, { status: 500 });
		}

		jsonQuery.query = EJSON.parse(jsonQuery.query);
		if (!jsonQuery || !jsonQuery.query) {
			return Response.json({ status: "error", message: "No query specified" }, { status: 500 });
		}

		return Response.json({ status: "success", collection: await loadCollectionData({ jsonQuery, request, params }) }, { status: 200 });
	} catch (e: any) {
		return Response.json({ status: "error", message: e.message }, { status: 500 });
	}
};
export const loader: LoaderFunction = async ({ request, params }) => {
	try {
		const data = await loadCollectionData({ jsonQuery: {}, request, params, withColumns: true });
		return Response.json(
			{ ...data },
			{
				headers: {
					"Cache-Control": "no-store",
				},
			}
		);
	} catch (e: any) {
		if (e instanceof Response) {
			return e;
		}
		return Response.json({ status: "error", message: e.message }, { status: 500 });
	}
};

const pageNavigate = (pathname, page, pageSize, sort, sortDirection, options = {}) => {
	const search: string[] = [];
	if (page > 1) {
		const skip = (page - 1) * pageSize;
		search.push(`skip=${skip}`);
	}

	if (pageSize != 10) {
		search.push(`limit=${pageSize}`);
	}

	if (sort && sort != "") {
		search.push(`sort=${sort}`);
		if (sortDirection) {
			search.push(`direction=${sortDirection}`);
		}
	}

	return {
		pathname,
		search: `?${search.join("&")}`,
		...options,
	};
};

export default function CollectionPage() {
	const loaderData = useLoaderData<typeof loader>();
	const [currentPage, setCurrenPage] = useState({
		page: 1,
		pageSize: 10,
	});
	const [sort, setSort] = useState({
		field: "",
		direction: 1,
	});

	const fetcher = useFetcher<{
		status: string;
		collection?: any;
		message?: string;
	}>();

	const initRef = useRef(false);

	const [view, setView] = useState("list");
	const [jsonQuery, setJsonQuery] = useState({});
	const [jsonQueryString, setJsonQueryString] = useState("");
	const [errorJsonQueryString, setErrorJsonQueryString] = useState("");
	const [isDelete, setIsDelete] = useState(false);
	const navigate = useNavigate();

	const { columns } = loaderData;
	const [data, setData] = useState<any>(loaderData);
	const { title, stats, count, documents: loaderDocuments, params, pagination } = data;

	const documents = EJSON.parse(loaderDocuments);

	useEffect(() => {
		if (!params || !initRef || !initRef.current) {
			initRef.current = true;
			return;
		}

		const paginationObj = {};
		if (currentPage.page > 1) {
			const skip = (currentPage.page - 1) * currentPage.pageSize;
			paginationObj["skip"] = skip;
		}

		if (currentPage.pageSize != 10) {
			paginationObj["limit"] = currentPage.pageSize;
		}

		fetcher.submit(
			{
				query: jsonQuery ? EJSON.stringify(jsonQuery) : {},
				...paginationObj,
				sort: sort.field,
				direction: sort.direction,
			},
			{
				method: "POST",
				encType: "application/json",
				action: `/database/${params.db}/${params.col}`,
			}
		);

		// navigate(pageNavigate(`/database/${params.db}/${params.col}`, currentPage.page, currentPage.pageSize, sort.field, sort.direction));
	}, [currentPage.page, currentPage.pageSize, sort.field, sort.direction]);

	useEffect(() => {
		if (fetcher.data && fetcher.data.status == "success") {
			setData(fetcher.data.collection);
		} else if (fetcher.data && fetcher.data.status == "error") {
			setErrorJsonQueryString(fetcher.data?.message || "");
		}
	}, [fetcher.data]);

	if (!stats) {
		return <div>Loading...</div>;
	}

	let items: any = null;
	if (view == "grid") {
		items = (
			<CsvTable
				sort={sort}
				onSort={(key) => {
					setSort((prevSort) => ({
						field: key,
						direction: prevSort.field == key ? prevSort.direction * -1 : 1,
					}));
					setCurrenPage({ ...currentPage, page: 1 });
				}}
				rows={documents}
			/>
		);
	} else {
		items = documents.map((doc: any, index: number) => {
			return (
				<div key={doc._id ? doc._id.toString() : `document-${index}`} className="w-full p-4 mb-3 overflow-auto bg-white border border-solid border-neutral-300">
					<JsonTreeEditor autocompleteItems={columns} isExpanded={false} data={doc} />
				</div>
			);
		});
	}
	return (
		<>
			<Grid className="database-page" fullWidth>
				<Column lg={16} md={8} sm={4}>
					<div className="flex items-center justify-between pb-4">
						<div>
							<Title title={title}>
								<span className="font-normal opacity-50">Collection:</span> {title}
							</Title>
							<p className="text-sm">Documents: {stats?.count}</p>
							<div className="flex items-center gap-2 mt-4">
								<Button
									size="sm"
									kind="danger--tertiary"
									renderIcon={TrashCan}
									iconDescription="Delete Database"
									onClick={(e: SyntheticEvent) => {
										e.preventDefault();
										setIsDelete(true);
									}}>
									Delete Collection
								</Button>
							</div>
						</div>
						<div className="flex items-center justify-end gap-1">
							<Button
								hasIconOnly
								size="md"
								kind="ghost"
								isSelected={view == "list"}
								renderIcon={ListBoxes}
								iconDescription="List View"
								onClick={(e: SyntheticEvent) => {
									e.preventDefault();
									setView("list");
								}}></Button>
							<Button
								hasIconOnly
								size="md"
								kind="ghost"
								isSelected={view == "grid"}
								renderIcon={TableSplit}
								iconDescription="Table View"
								onClick={(e: SyntheticEvent) => {
									e.preventDefault();
									setView("grid");
								}}></Button>
						</div>
					</div>
					<div className="mt-1 mb-1 border-t border-solid border-neutral-100">
						<div className="py-1">
							<span className="block text-base font-bold">Query</span>
							<span className="block mb-2 text-xs opacity-50">Please enter your query below</span>
						</div>
						<Tabs>
							<TabList aria-label="List of tabs" contained>
								<Tab>Json Editor</Tab>
								<Tab>Codeium (Raw)</Tab>
							</TabList>
							<TabPanels>
								<TabPanel>
									<div className="bg-white min-h-36">
										<JsonTreeEditor data={jsonQuery} autocompleteItems={columns} onChange={(data) => setJsonQuery(data)} />
									</div>
									<div className="flex flex-col gap-2 mt-2">
										<div className="flex items-center">
											{fetcher.state == "submitting" || fetcher.state == "loading" ? (
												<ButtonSkeleton size="sm" />
											) : (
												<Button
													size="sm"
													renderIcon={ArrowRight}
													onClick={(e: SyntheticEvent) => {
														e.preventDefault();
														setErrorJsonQueryString("");
														setCurrenPage({ ...currentPage, page: 1 });
														fetcher.submit(
															{
																query: EJSON.stringify(jsonQuery),
															},
															{
																method: "POST",
																encType: "application/json",
																action: `/database/${params.db}/${params.col}`,
															}
														);
													}}>
													Execute
												</Button>
											)}
											<CopyTextButton size="sm" className="ml-2" kind="ghost" text={EJSON.stringify(jsonQuery)}>
												Copy as BSON
											</CopyTextButton>
										</div>
										{errorJsonQueryString != "" && <AlertMessage message={errorJsonQueryString} onClose={() => setErrorJsonQueryString("")} />}
									</div>
								</TabPanel>
								<TabPanel>
									<IdeWithAutocomplete
										onChange={(data) => {
											setJsonQueryString(data);
											try {
												setJsonQuery(EJSON.parse(data));
												setErrorJsonQueryString("");
											} catch (e: any) {
												setErrorJsonQueryString(e.message);
											}
										}}
									/>
									<div className="flex items-center gap-2 mt-2">
										{fetcher.state == "submitting" || fetcher.state == "loading" ? (
											<ButtonSkeleton size="sm" />
										) : (
											<Button
												size="sm"
												renderIcon={ArrowRight}
												onClick={(e: SyntheticEvent) => {
													e.preventDefault();
													let jsonOutput = null;
													try {
														jsonOutput = EJSON.parse(jsonQueryString);
													} catch (e: any) {
														setErrorJsonQueryString(e.message);
														return;
													}

													setErrorJsonQueryString("");
													setCurrenPage({ ...currentPage, page: 1 });
													fetcher.submit(
														{
															query: jsonQueryString,
														},
														{
															method: "POST",
															encType: "application/json",
															action: `/database/${params.db}/${params.col}`,
														}
													);
												}}>
												Execute
											</Button>
										)}
										{errorJsonQueryString != "" && <AlertMessage message={errorJsonQueryString} onClose={() => setErrorJsonQueryString("")} />}
									</div>
								</TabPanel>
							</TabPanels>
						</Tabs>
					</div>

					<div className="mb-3 bg-neutral-100">
						<Accordion>
							<AccordionItem title="Statistics" className="pr-0 ">
								<div className="flex flex-col items-start w-full pb-4 lg:flex-row">
									<div className="flex-1 w-full">
										<Table>
											<TableBody>
												<TableRow>
													<TableCell className="font-bold">Namespace</TableCell>
													<TableCell>{stats.ns}</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-bold">Host</TableCell>
													<TableCell>{stats.host}</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-bold">Local Time</TableCell>
													<TableCell>{stats.localTime}</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-bold">Reads Latency</TableCell>
													<TableCell>{numberWithCommas(stats.latencyStats?.reads.latency)} ms</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-bold">Writes Latency</TableCell>
													<TableCell>{numberWithCommas(stats.latencyStats?.writes.latency)} ms</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-bold">Commands Latency</TableCell>
													<TableCell>{numberWithCommas(stats.latencyStats?.commands.latency)} ms</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-bold">Transactions Latency</TableCell>
													<TableCell>{numberWithCommas(stats.latencyStats?.transactions.latency)} ms</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</div>
									<div className="flex-1 w-full">
										<Table className="mt-4 lg:mt-0">
											<TableBody>
												<TableRow>
													<TableCell className="font-bold">Storage Size</TableCell>
													<TableCell>{numberWithCommas(stats.storageStats?.storageSize)} B</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-bold">Total Index Size</TableCell>
													<TableCell>{numberWithCommas(stats.storageStats?.totalIndexSize)} B</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-bold">Total Size</TableCell>
													<TableCell>{numberWithCommas(stats.storageStats?.totalSize)} B</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-bold">Count</TableCell>
													<TableCell>{stats.storageStats?.count}</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-bold">Collection Scans Total</TableCell>
													<TableCell>{numberWithCommas(stats.queryExecStats?.collectionScans.total)}</TableCell>
												</TableRow>
												<TableRow>
													<TableCell className="font-bold">Collection Scans Non-Tailable</TableCell>
													<TableCell>{numberWithCommas(stats.queryExecStats?.collectionScans.nonTailable)}</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</div>
								</div>
							</AccordionItem>
						</Accordion>
					</div>
					<div className="w-ful min-h-72">{items}</div>
				</Column>
			</Grid>
			<Pagination
				className="mt-3 mb-10"
				backwardText="Previous page"
				forwardText="Next page"
				itemsPerPageText="Items per page:"
				onChange={({ page, pageSize }) => {
					setCurrenPage({ page, pageSize });
				}}
				page={Math.floor(pagination.skip / pagination.limit) + 1}
				pageSize={Number(pagination.limit)}
				pageSizes={[10, 20, 30, 40, 50, 100, 500]}
				size="md"
				totalItems={count}
			/>
			<CollectionDeleteModal
				open={isDelete}
				onClose={() => setIsDelete(false)}
				collectionName={title}
				dbName={params.db}
				onSuccess={() => {
					setIsDelete(false);
					navigate(`/database/${params.db}`);
				}}
			/>
		</>
	);
}
