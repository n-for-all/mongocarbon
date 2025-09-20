import { ArrowRightIcon, ListUnorderedIcon, ServerIcon, TrashIcon } from "@primer/octicons-react";
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

import { BSON, Document, EJSON, ObjectId } from "bson";
import { CopyTextButton } from "~/components/copy_text";
import { getUserSession } from "~/utils/session.server";
import { CollectionDeleteModal } from "~/components/collection";
import { Button, ButtonSkeleton } from "~/ui/button";
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from "~/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "~/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/tabs";
import { Pagination } from "~/ui/pagination";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "~/ui/select";
import * as specs from "~/lib/functions/index";
import { isCursor } from "~/utils/functions.server";
import { Textarea } from "~/ui/textarea";
import Modal from "~/ui/modal";
import { toast } from "~/ui/hooks/use-toast";
import { SortDirection } from "mongodb";
import LatencyHistograms from "~/components/histogram";
import { ChartColumn, ChartNoAxesColumn } from "lucide-react";

type loaderCollectionData = {
    title: string;
    stats:
        | {
              count: number;
              size: number;
              storageSize: number;
              totalIndexSize: number;
              ns: string;
              host: string;
              localTime: string;
              latencyStats: {
                  reads: {
                      latency: string;
                  };
                  writes: {
                      latency: string;
                  };
                  commands: {
                      latency: string;
                  };
                  transactions: {
                      latency: string;
                  };
                  storageStats: {
                      latency: string;
                  };
              };
              storageStats: {
                  storageSize: number;
                  totalIndexSize: number;
                  totalSize: number;
                  count: number;
              };
              queryExecStats: {
                  collectionScans: {
                      total: number;
                      nonTailable: number;
                  };
              };
          }
        | null
        | Document;
    count: number;
    documents: string;
    raw?: any;
    params: { db: string; col: string };
    columns?: any;
    skip?: number;
    limit?: number;
    sort?: { [key: string]: SortDirection };
};

const functionSpecs = {};
Object.keys(specs).forEach((spec) => {
    if (typeof specs[spec].default === "object" && specs[spec].default?.name) {
        if (specs[spec].default.on !== "collection") {
            return;
        }
        functionSpecs[specs[spec].default.name] = specs[spec].default;
    } else {
        console.error("Unknown spec, you must export default on the function to work", spec.toString());
    }
});

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

const loadConnection = async (request: Request): Promise<ConnectionData> => {
    const session = await getUserSession(request);
    const connection = session.get("connection");

    return await db(connection);
};

const loadCollectionData = async ({ jsonQuery, request, params, withColumns = false }): Promise<loaderCollectionData> => {
    const url = new URL(request.url);
    const query = url.searchParams;
    if (!params.db) {
        throw new Error("No database specified");
    }
    if (!params.col) {
        throw new Error("No collection specified");
    }

    let sortKey = query.get("sort") || jsonQuery.sort || "";
    const pagination = {
        limit: query.get("limit") || jsonQuery.limit || 10,
        skip: query.get("skip") || jsonQuery.skip || 0,
    };

    if (sortKey != "") {
        pagination["sort"] = {};
        pagination["sort"][sortKey] = query.get("direction") || jsonQuery.direction || 0;
    }

    const mongo = await loadConnection(request);
    const collection = new Collection(mongo, params.db, params.col, config);
    const collectionData = await collection.viewCollection({ ...jsonQuery, ...pagination });
    let columns = {};
    if (withColumns) {
        let parsedColumns = await collection.getColumns();
        parsedColumns.map((col) => {
            columns[col] = "";
        });
    }
    return { ...collectionData, documents: EJSON.stringify(collectionData.docs), params, ...pagination, columns };
};

const executeCollectionFunctionByName = async (request: Request, params: any, functionName: string, jsonQuery: Record<string, any>): Promise<loaderCollectionData> => {
    const functionSpec = functionSpecs[functionName];
    if (!functionSpec) {
        throw new Error(`Function ${functionName} not found`);
    }

    if (!params.db) {
        throw new Error("No database specified");
    }
    if (!params.col) {
        throw new Error("No collection specified");
    }

    let sortKey = jsonQuery.sort || "";
    const pagination: {
        [key: string]: any;
    } = {
        ...(jsonQuery.limit ? { limit: Number(jsonQuery.limit) } : {}),
        ...(jsonQuery.skip ? { skip: Number(jsonQuery.skip) } : {}),
    };
    console.log("pagination", pagination);
    if (sortKey != "") {
        pagination["sort"] = {};
        pagination["sort"][sortKey] = jsonQuery.direction || 0;
    }

    const mongo = await loadConnection(request);
    const collection = new Collection(mongo, params.db, params.col, config);

    const functionParams = EJSON.parse(jsonQuery.query || "{}");
    // Build args in order defined by parameters array
    const args = functionSpec.parameters.map((param) => {
        const value = functionParams[param.name];
        let outputValue = { ...(param.default ? param.default : {}), ...(param.parse ? param.parse(value, { ...pagination }) : {}) };
        if (outputValue["limit"]) {
            pagination.limit = outputValue["limit"];
        }
        if (outputValue["skip"]) {
            pagination.skip = outputValue["skip"];
        }

        if (outputValue["sort"]) {
            pagination.sort = outputValue["sort"];
        }

        return outputValue;
    });

    let cursor = await collection.callFunction(functionName, ...args);
    let raw = null;
    if (!isCursor(cursor)) {
        raw = cursor;
    }

    // Call the function using spread args
    return {
        ...(await loadCollectionData({
            jsonQuery: {
                ...pagination,
            },
            request,
            params,
            withColumns: false,
        })),
        raw,
        ...pagination,
    };
};

export const action: ActionFunction = async ({ request, params }) => {
    try {
        const jsonQuery = await request.json();
        if (!jsonQuery) {
            return Response.json({ status: "error", message: "No query specified" }, { status: 500 });
        }

        let output: { documents?: string; raw?: string | null; skip?: number; limit?: number } | null = null;

        if (jsonQuery.function) {
            try {
                output = await executeCollectionFunctionByName(request, params, jsonQuery.function, jsonQuery);
            } catch (e: any) {
                return Response.json({ status: "error", message: e.message + `:\n Function: ${jsonQuery.function}` }, { status: 500 });
            }
        } else {
            return Response.json({ status: "error", message: "No function specified" }, { status: 500 });
        }

        return Response.json({ status: "success", ...output }, { status: 200 });
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

export default function CollectionPage() {
    const loaderData = useLoaderData<typeof loader>();
    const [currentPage, setCurrentPage] = useState({
        page: 1,
        pageSize: 10,
    });
    const [sort, setSort] = useState({
        field: "",
        direction: 0,
    });

    const fetcher = useFetcher<
        {
            status: string;
            message?: string;
        } & loaderCollectionData
    >();

    const pageFetcher = useFetcher<
        {
            status: string;
            message?: string;
        } & loaderCollectionData
    >();

    const initRef = useRef(false);

    const [view, setView] = useState("list");
    const [jsonQuery, setJsonQuery] = useState({});
    const [jsonQueryString, setJsonQueryString] = useState("");
    const [errorJsonQueryString, setErrorJsonQueryString] = useState("");
    const [isDelete, setIsDelete] = useState(false);
    const [selectedFunction, setSelectedFunction] = useState<string>("find");
    const navigate = useNavigate();

    const { columns } = loaderData;
    const [data, setData] = useState<loaderCollectionData>(loaderData);
    const { title, stats, count, documents: loaderDocuments, raw, params } = data;

    const documents = EJSON.parse(loaderDocuments) || [];
    const loading = fetcher.state == "submitting" || fetcher.state == "loading";
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

    const executeFunction = (confirmed?: boolean) => {
        if (!selectedFunction || selectedFunction == "" || !functionSpecs[selectedFunction]) {
            setErrorJsonQueryString("Please select a function");
            return;
        }

        if (!confirmed && functionSpecs[selectedFunction].confirmation?.required) {
            // Show confirmation dialog
            setShowConfirmation(true);
            return;
        }

        setErrorJsonQueryString("");
        setCurrentPage({ ...currentPage, page: 1 });
        fetcher.submit(
            {
                function: selectedFunction,
                query: EJSON.stringify(jsonQuery),
            },
            {
                method: "POST",
                encType: "application/json",
                action: `/database/${params.db}/${params.col}`,
            }
        );
    };

    useEffect(() => {
        if (!initRef.current) {
            initRef.current = true;
            return; // Skip effect on first render
        }

        if (!params) {
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

        if (!selectedFunction || selectedFunction == "" || !functionSpecs[selectedFunction]) {
            return;
        }

        pageFetcher.submit(
            {
                function: selectedFunction,
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
            setData({
                ...data,
                ...fetcher.data,
            });
            setCurrentPage({
                ...currentPage,
                page: fetcher.data.skip ? Math.floor((fetcher.data.skip || 0) / (fetcher.data.limit || 10)) + 1 : 1,
                pageSize: fetcher.data.limit || 10,
            });

            toast({
                title: "Success",
                variant: "success",
                description: "Executed",
            });
        } else if (fetcher.data && fetcher.data.status == "error") {
            setErrorJsonQueryString(fetcher.data?.message || "");
        }
        setShowConfirmation(false);
    }, [fetcher.data]);

    useEffect(() => {
        if (pageFetcher.data && pageFetcher.data.status == "success") {
            setData({
                ...data,
                ...pageFetcher.data,
            });
            setCurrentPage({
                ...currentPage,
                page: pageFetcher.data.skip ? Math.floor((pageFetcher.data.skip || 0) / (pageFetcher.data.limit || 10)) + 1 : 1,
                pageSize: pageFetcher.data.limit || 10,
            });
        } else if (pageFetcher.data && pageFetcher.data.status == "error") {
            setErrorJsonQueryString(pageFetcher.data?.message || "");
        }
    }, [pageFetcher.data]);

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
                    setCurrentPage({ ...currentPage, page: 1 });
                }}
                rows={documents || []}
            />
        );
    } else {
        items = documents?.map((doc: any, index: number) => {
            return (
                <div key={doc._id ? doc._id.toString() : `document-${index}`} className="w-full p-4 mb-3 overflow-auto bg-white border border-solid border-neutral-300">
                    <JsonTreeEditor autocompleteItems={columns} isExpanded={false} data={doc} />
                </div>
            );
        });
    }

    const canBeViewedAsJson = (typeof raw === "object" || Array.isArray(raw)) && typeof raw !== "undefined" && raw !== null;
    const rawOutput = (raw == "" || typeof raw === "object" || Array.isArray(raw)) && typeof raw !== "undefined" ? raw : EJSON.stringify(raw);
    console.log("stats", stats);

    return (
        <>
            <div className="database-page">
                <div className="flex items-center justify-between pb-4">
                    <div>
                        <Title title={title}>
                            <span className="font-normal opacity-50">Collection:</span>
                            <span className="ml-1">{title}</span>
                        </Title>
                        <p className="text-sm">Documents: {stats?.count}</p>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                        <Button
                            size="sm"
                            variant="danger"
                            icon={<TrashIcon />}
                            tooltip="Delete Collection"
                            onClick={(e: SyntheticEvent) => {
                                e.preventDefault();
                                setIsDelete(true);
                            }}>
                            Delete Collection
                        </Button>
                        <Button
                            hasIconOnly
                            size="md"
                            variant="ghost"
                            className={view == "list" ? "bg-neutral-100" : ""}
                            icon={<ListUnorderedIcon />}
                            tooltip="List View"
                            onClick={(e: SyntheticEvent) => {
                                e.preventDefault();
                                setView("list");
                            }}></Button>
                        <Button
                            hasIconOnly
                            size="md"
                            variant="ghost"
                            className={view == "grid" ? "bg-neutral-100" : ""}
                            icon={<ServerIcon />}
                            tooltip="Table View"
                            onClick={(e: SyntheticEvent) => {
                                e.preventDefault();
                                setView("grid");
                            }}></Button>
                    </div>
                </div>
                <div className="p-4 mt-1 mb-1 border border-solid border-neutral-300">
                    <div className="py-1">
                        <span className="block text-base font-bold">Query</span>
                        <span className="block mb-2 text-xs opacity-50">Please enter your query below</span>
                    </div>
                    <Tabs defaultValue="json">
                        <TabsList className="bg-neutral-100" aria-label="List of tabs">
                            <TabsTrigger value="json">Json Editor</TabsTrigger>
                            {/* <TabsTrigger value="editor">Codeium (Raw)</TabsTrigger> */}
                        </TabsList>
                        <TabsContent value="json">
                            <div className="flex bg-white divide-x divide-neutral-200 min-h-36">
                                {selectedFunction && functionSpecs[selectedFunction] && functionSpecs[selectedFunction].parameters.length > 0
                                    ? functionSpecs[selectedFunction].parameters.map((param, index) => {
                                          return (
                                              <div key={param.name + index} className={"flex-1 pr-10" + (index == 0 ? " pl-0" : " pl-6")}>
                                                  <div className="flex flex-col mb-2">
                                                      <label className="block text-sm font-medium">{param.label}</label>
                                                      <p className="text-xs text-neutral-500">{param.description}</p>
                                                  </div>
                                                  <JsonTreeEditor
                                                      data={jsonQuery[param.name]}
                                                      autocompleteItems={param.options && param.options.type == "autocomplete" ? columns : param.options.values || {}}
                                                      autocompleteType={param.options && param.options.type == "autocomplete" ? "search" : param.options.type || "search"}
                                                      onChange={(data) => setJsonQuery({ ...jsonQuery, [param.name]: data })}
                                                  />
                                              </div>
                                          );
                                      })
                                    : null}
                                <div
                                    className={
                                        "flex-1 overflow-auto" +
                                        (selectedFunction && functionSpecs[selectedFunction] && functionSpecs[selectedFunction].parameters.length > 0 ? " pl-10 pr-10" : "")
                                    }>
                                    <div className="flex flex-col mb-2">
                                        <label className="block text-sm font-medium">Raw Response</label>
                                        <p className="text-xs text-neutral-500">Raw response from the server</p>
                                    </div>
                                    {canBeViewedAsJson ? (
                                        <JsonTreeEditor autocompleteItems={columns} isExpanded={true} data={rawOutput} />
                                    ) : (
                                        <Textarea readOnly value={rawOutput || ""}></Textarea>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-1 gap-2">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Select
                                                disabled={loading}
                                                value={selectedFunction}
                                                onValueChange={(value) => {
                                                    setData({
                                                        ...data,
                                                        raw: "",
                                                    });
                                                    setSelectedFunction(value);
                                                }}>
                                                <SelectTrigger id="function-select" className="px-2 py-1 text-sm bg-white border border-neutral-300">
                                                    <SelectValue placeholder="Select a function" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(functionSpecs).map((fn) => (
                                                        <SelectItem key={fn} value={fn}>
                                                            {functionSpecs[fn].label || fn}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            size="sm"
                                            disabled={!selectedFunction || selectedFunction == ""}
                                            icon={<ArrowRightIcon />}
                                            loading={loading}
                                            onClick={() => {
                                                executeFunction();
                                            }}>
                                            Execute
                                        </Button>
                                    </div>

                                    <CopyTextButton size="sm" className="ml-2" variant="ghost" text={EJSON.stringify(jsonQuery)}>
                                        Copy as BSON
                                    </CopyTextButton>
                                </div>
                                {errorJsonQueryString != "" && <AlertMessage message={errorJsonQueryString} onClose={() => setErrorJsonQueryString("")} />}
                            </div>
                        </TabsContent>
                        <TabsContent value="editor">
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
                            {/* <div className="flex items-center gap-2 mt-2">
                                {fetcher.state == "submitting" || fetcher.state == "loading" ? (
                                    <ButtonSkeleton size="sm" />
                                ) : (
                                    <Button
                                        size="sm"
                                        icon={<ArrowRightIcon />}
                                        disabled={!selectedFunction || selectedFunction == ""}
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
                                            setCurrentPage({ ...currentPage, page: 1 });
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
                            </div> */}
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="mb-3 bg-neutral-100">
                    <Accordion type="multiple">
                        <AccordionItem value="statistics" className="pr-0 ">
                            <AccordionTrigger className="px-4 border-t border-solid border-neutral-200">
                                <span className="flex items-center font-medium">
                                    <ChartNoAxesColumn className="w-4 h-4 mr-2" /> Statistics
                                </span>
                            </AccordionTrigger>

                            <AccordionContent className="px-0">
                                <LatencyHistograms className="px-4 py-4 mb-4 text-xs bg-neutral-100" stats={stats.latencyStats} />
                                <div className="flex flex-col items-start w-full pb-4 lg:flex-row">
                                    <div className="flex-1 w-full">
                                        <Table className="text-md">
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
                                        <Table className="mt-4 text-md lg:mt-0">
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
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                <div className="w-full min-h-72">{items}</div>
            </div>
            <Pagination
                className="mt-3 mb-10 text-sm"
                backwardText="Previous page"
                forwardText="Next page"
                itemsPerPageText="Items per page:"
                onChange={({ page, pageSize }) => {
                    setCurrentPage({ page, pageSize });
                }}
                page={currentPage.page}
                pageSize={currentPage.pageSize}
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
            <Modal
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onPrimaryClick={() => {
                    executeFunction(true);
                    // setShowConfirmation(false);
                }}
                loading={loading}
                danger
                loadingDescription={"Executing..."}
                modalHeading={functionSpecs[selectedFunction]?.confirmation?.message || "Are you sure you want to execute this function?"}
                modalLabel="Confirm Action"
                primaryButtonText={"Confirm"}
                secondaryButtonText={"Cancel"}
            />
        </>
    );
}
