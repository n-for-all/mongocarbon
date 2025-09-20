import { PlusIcon, ArrowRightIcon, TrashIcon, SortAscIcon, SortDescIcon, DatabaseIcon } from "@primer/octicons-react";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useState, SyntheticEvent, useEffect } from "react";
import { CollectionAddModal, CollectionDeleteModal } from "~/components/collection";
import { DatabaseDeleteModal } from "~/components/database";
import Title from "~/components/title";
import config from "~/config";
import { Collection } from "~/lib/data/collection";
import { Database } from "~/lib/data/database";
import db, { ConnectionData } from "~/lib/db";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
import { NativeInput, SearchInput } from "~/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/ui/select";
import { Table, TableBody, TableCell, TableRow } from "~/ui/table";
import { convertBytes, isValidCollectionName, numberWithCommas } from "~/utils/functions";
import { getUserSession } from "~/utils/session.server";
import jwt from "jsonwebtoken";
import { createJWTToken, generateApiKey } from "~/utils/functions.server";
import { toast } from "~/ui/hooks/use-toast";
import { Key } from "lucide-react";
import Modal from "~/ui/modal";
import Endpoints from "~/components/endpoints";

type LoaderData = {
    status: string;
    name: string;
    stats: any;
    mcAppsDocuments?: any[];
    message?: string;
};

export const loader: LoaderFunction = async ({ request, params }): Promise<Response> => {
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
        const mcAppsDocuments = await database.getDocuments(params.db, "mc.apps");

        return Response.json(
            { status: "success", stats, mcAppsDocuments },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error: any) {
        return Response.json({ status: "error", message: error.message }, { status: 500 });
    }
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
        const _action = jsonQuery._action;
        if (_action === "createApiKey") {
            try {
                const session = await getUserSession(request);
                const connection = session.get("connection");
                const mongo = await db(connection);
                const database = new Database(mongo, config);

                const payload = { db: dbName };
                const token = await generateApiKey(payload);

                if (!token) {
                    throw new Error("Could not create API key token, Please check if the API_KEY_SECRET is set in the .env file");
                }
                const document = await database.createDocument(dbName, "mc.apps", { ...payload, token });

                return Response.json(
                    {
                        status: "success",
                        message: "API key created and stored in mc.apps collection.",
                        document: document,
                        token: token,
                    },
                    { status: 200 }
                );
            } catch (e: any) {
                return Response.json({ status: "error", message: e.message }, { status: 500 });
            }
        } else if (_action === "deleteApiKey") {
            try {
                const apiKeyId = jsonQuery.id;
                if (!apiKeyId) {
                    throw new Error("No API Key ID provided");
                }

                const session = await getUserSession(request);
                const connection = session.get("connection");
                const mongo = await db(connection);
                const database = new Database(mongo, config);

                const result = await database.deleteDocument(dbName, "mc.apps", apiKeyId);

                if (!result || result.deletedCount === 0) {
                    return Response.json({ status: "error", message: "API Key not found or could not be deleted." }, { status: 404 });
                }

                return Response.json({ status: "success", message: "API Key deleted successfully." }, { status: 200 });
            } catch (e: any) {
                return Response.json({ status: "error", message: e.message }, { status: 500 });
            }
        } else {
            throw new Error("Invalid action: " + _action);
        }
    } catch (e: any) {
        return Response.json({ status: "error", message: e.message }, { status: 500 });
    }
};

enum sortingSelect {
    name = "Name",
    documents = "Documents",
    "document-size" = "Avg. Document Size",
    "storage-size" = "Storage Size",
    indexes = "Indexes",
    "index-size" = "Total Index Size",
}

export default function DatabasePage() {
    const params = useParams();
    const [data, setData] = useState<LoaderData | null>(null);
    const [sort, setSort] = useState("");
    const [direction, setDirection] = useState("asc");
    const [search, setSearch] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedApiKeyId, setSelectedApiKeyId] = useState<string | null>(null);

    const apiKeyFetcher = useFetcher<{
        token?: string;
        status: string;
        message?: string;
        document?: object;
    }>();

    const fetcher = useFetcher<LoaderData>();
    const apiKeyDeleteFetcher = useFetcher<{ status: string; message?: string }>();

    const [apiKeyData, setApiKeyData] = useState<{
        token?: string;
    }>({});

    const createApiKey = () => {
        apiKeyFetcher.submit({ _action: "createApiKey" }, { method: "post", encType: "application/json", action: `/apps/${params.db}` });
    };

    const refreshData = () => {
        fetcher.load(`/apps/${params.db}`);
    };

    useEffect(() => {
        if (apiKeyDeleteFetcher.data && apiKeyDeleteFetcher.data.status == "success") {
            toast({
                title: "Success",
                variant: "success",
                description: apiKeyDeleteFetcher.data.message || "API Key deleted successfully",
            });
            refreshData();
        } else if (apiKeyDeleteFetcher.data && apiKeyDeleteFetcher.data.status == "error") {
            toast({
                title: "Error",
                variant: "error",
                description: apiKeyDeleteFetcher.data.message,
            });
        }
    }, [apiKeyDeleteFetcher.data]);

    useEffect(() => {
        if (apiKeyFetcher.data && apiKeyFetcher.data.status == "success") {
            setApiKeyData({
                ...apiKeyFetcher.data,
            });

            toast({
                title: "Success",
                variant: "success",
                description: apiKeyFetcher.data.message || "API Key created successfully",
            });
        } else if (apiKeyFetcher.data && apiKeyFetcher.data.status == "error") {
            toast({
                title: "Error",
                variant: "error",
                description: apiKeyFetcher.data.message,
            });
        }
    }, [apiKeyFetcher.data]);

    useEffect(() => {
        if (fetcher.data && fetcher.data.status == "success") {
            setData(fetcher.data);
        } else if (fetcher.data && fetcher.data.status == "error") {
            toast({
                title: "Error",
                variant: "error",
                description: fetcher.data.message,
            });
        }
    }, [fetcher.data]);

    useEffect(() => {
        refreshData();
    }, [params.db]);

    if (fetcher.data?.status == "error") {
        return (
            <Alert>
                <AlertTitle>An error occurred while fetching the data.</AlertTitle>
                <AlertDescription>{fetcher.data.message}</AlertDescription>
            </Alert>
        );
    }
    if (!data) {
        return <div>Loading...</div>;
    }

    let totalDocuments = 0;

    switch (sort) {
        case "name":
            if (direction == "desc") {
                data.stats.collectionList.sort((a, b) => b.name.localeCompare(a.name));
            } else {
                data.stats.collectionList.sort((a, b) => a.name.localeCompare(b.name));
            }
            break;
        case "documents":
            if (direction == "desc") {
                data.stats.collectionList.sort((a, b) => b.count - a.count);
            } else {
                data.stats.collectionList.sort((a, b) => a.count - b.count);
            }
            break;
        case "document-size":
            if (direction == "desc") {
                data.stats.collectionList.sort((b, a) => {
                    const avgDocumentSizeA = a.stats.storageStats?.storageSize / a.count;
                    const avgDocumentSizeB = b.stats.storageStats?.storageSize / b.count;
                    return avgDocumentSizeA - avgDocumentSizeB;
                });
            } else {
                data.stats.collectionList.sort((a, b) => {
                    const avgDocumentSizeA = a.stats.storageStats?.storageSize / a.count;
                    const avgDocumentSizeB = b.stats.storageStats?.storageSize / b.count;
                    return avgDocumentSizeA - avgDocumentSizeB;
                });
            }
            break;
        case "storage-size":
            if (direction == "desc") {
                data.stats.collectionList.sort((b, a) => a.stats.storageStats?.storageSize - b.stats.storageStats?.storageSize);
            } else {
                data.stats.collectionList.sort((a, b) => a.stats.storageStats?.storageSize - b.stats.storageStats?.storageSize);
            }
            break;
        case "indexes":
            if (direction == "desc") {
                data.stats.collectionList.sort((b, a) => a.indexes.length - b.indexes.length);
            } else {
                data.stats.collectionList.sort((a, b) => b.indexes.length - a.indexes.length);
            }
            break;
        case "index-size":
            if (direction == "desc") {
                data.stats.collectionList.sort((b, a) => a.stats.storageStats?.totalIndexSize - b.stats.storageStats?.totalIndexSize);
            } else {
                data.stats.collectionList.sort((a, b) => a.stats.storageStats?.totalIndexSize - b.stats.storageStats?.totalIndexSize);
            }
            break;
        default:
            break;
    }
    return (
        <>
            <div className="database-page">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 lg:flex-nowrap">
                    <div>
                        <Title title={data.stats.name}>
                            <span className="font-normal opacity-50">Database:</span> {data.stats.name}
                        </Title>
                        <p className="mb-4 text-sm">
                            Collections: {data.stats.collections}, Documents: {totalDocuments}
                        </p>
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button size="sm" variant={"outline"} iconPosition="right" icon={<PlusIcon />} href={`/database/${data.stats.name}/`}>
                                Manage Database
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <SearchInput
                            placeholder="Find a collection"
                            id="search-collection"
                            value={search}
                            className="w-32 min-w-md bg-neutral-100"
                            onChange={(value) => {
                                setSearch(value);
                            }}
                        />
                        <span className="text-sm">Sort:</span>
                        <Select
                            onValueChange={(value) => {
                                setSort(value);
                            }}>
                            <SelectTrigger>
                                <span className="text-sm">{sort == "" ? "---" : sortingSelect[sort]}</span>
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {Object.keys(sortingSelect).map((key) => {
                                    return (
                                        <SelectItem key={key} value={key}>
                                            {sortingSelect[key]}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <Button
                            hasIconOnly
                            variant={"ghost"}
                            tooltip="Sort Direction"
                            icon={direction == "asc" ? <SortAscIcon /> : <SortDescIcon />}
                            onClick={(e: SyntheticEvent) => {
                                e.preventDefault();
                                setDirection(direction == "asc" ? "desc" : "asc");
                            }}></Button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 lg:flex-nowrap">
                    <div className="flex items-center gap-2 mb-4">
                        <NativeInput name="apiKeyName" placeholder="API Key Name" value={apiKeyData.token || ""} readOnly className="w-64" required />
                        <Button type="submit" size="sm" loading={apiKeyFetcher.state === "submitting"} onClick={createApiKey} icon={<Key />}>
                            Create API Key
                        </Button>
                        {apiKeyFetcher.data?.status == "error" && <span className="ml-2 text-sm text-red-600">{apiKeyFetcher.data.message}</span>}
                    </div>
                </div>
                {data.mcAppsDocuments && data.mcAppsDocuments.length > 0 && (
                    <Accordion type="multiple" className="mb-6">
                        <AccordionItem value="mcapps" title="API Keys" className="pr-0">
                            <AccordionTrigger className="px-4 border-t border-solid border-neutral-200">
                                <span className="font-medium">API Keys ({data.mcAppsDocuments.length})</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-0">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-bold">ID</TableCell>
                                            <TableCell className="font-bold">Token</TableCell>
                                            <TableCell className="font-bold">Date Created</TableCell>
                                            <TableCell className="font-bold">Key Name</TableCell>
                                            <TableCell className="font-bold"></TableCell>
                                        </TableRow>
                                        {data.mcAppsDocuments.map((doc: any) => (
                                            <TableRow key={doc._id}>
                                                <TableCell>{doc._id}</TableCell>
                                                <TableCell className="max-w-xs truncate">{doc.token}</TableCell>
                                                <TableCell>{doc.dateCreated ? new Date(doc.dateCreated).toLocaleString() : "-"}</TableCell>
                                                <TableCell>{doc.keyName || "-"}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        hasIconOnly
                                                        icon={<TrashIcon />}
                                                        loading={apiKeyDeleteFetcher.state === "submitting"}
                                                        onClick={() => {
                                                            setSelectedApiKeyId(doc._id);
                                                            setDeleteDialogOpen(true);
                                                        }}></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
                {data.stats.collectionList.map((collection: any, index: number) => {
                    if (search && search.trim() != "" && !(collection.name.toLowerCase().indexOf(search.toLowerCase()) == 0)) {
                        return null;
                    }
                    return (
                        <div key={index} className="mb-3 bg-neutral-100">
                            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-base border-b border-solid border-neutral-200">
                                <span className="flex items-center gap-1">
                                    <DatabaseIcon /> <strong>{collection.name}</strong>
                                </span>
                                <div className="flex flex-wrap items-center gap-1 text-sm">
                                    <span className="font-bold">({collection.count})</span>
                                    <span className="block ">Documents</span>
                                </div>
                            </div>
                            <Accordion type="multiple">
                                <AccordionItem value="stats" title="Endpoints" className="pr-0 ">
                                    <AccordionTrigger className="px-4 border-t border-solid border-neutral-200">
                                        <span className="font-medium">Endpoints</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-0">
                                        <Endpoints
                                            collection={collection.name}
                                            endpoints={[]}
                                            onChange={(dbName, newEndpoints) => console.log("Changed endpoints for", dbName, newEndpoints)}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    );
                })}
            </div>
            <Modal
                open={deleteDialogOpen}
                danger={true}
                loading={apiKeyDeleteFetcher.state === "submitting"}
                loadingDescription="Deleting API Key..."
                modalHeading="Delete API Key"
                modalLabel="API Key"
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                onClose={() => setDeleteDialogOpen(false)}
                onPrimaryClick={() => {
                    if (selectedApiKeyId) {
                        apiKeyDeleteFetcher.submit(
                            { _action: "deleteApiKey", id: selectedApiKeyId },
                            {
                                method: "post",
                                encType: "application/json",
                                action: `/apps/${params.db}`,
                            }
                        );
                        setDeleteDialogOpen(false);
                        setSelectedApiKeyId(null);
                    }
                }}
                onSecondaryClick={() => setDeleteDialogOpen(false)}>
                <h3>Are you sure you want to delete this API key?</h3>
            </Modal>
        </>
    );
}
