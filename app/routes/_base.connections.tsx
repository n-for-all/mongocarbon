import db from "~/lib/db";

import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import React, { useEffect } from "react";
import { ConnectionModal } from "~/components/connection";

import {
    addUserDbConnection,
    commitSession,
    getUserDbConnection,
    getUserDbConnections,
    getUserId,
    getUserSession,
    removeUserDbConnection,
    requireUser,
    updateUserDbConnection,
} from "~/utils/session.server";
import { isValidDatabaseName, validateMongoConnectionString } from "~/utils/functions";
import { DbConnection } from "@prisma/client";
import { Logo } from "~/components/logo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/ui/accordion";
import { Button } from "~/ui/button";
import ActionableNotification from "~/ui/actionable-notification";
import { PencilIcon, VersionsIcon } from "@primer/octicons-react";
import { toast } from "~/ui/hooks/use-toast";

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUser(request, "/login?redirect=/profile");
    const connections = await getUserDbConnections(user.id);
    const session = await getUserSession(request);
    const connection = session.get("connection");

    return Response.json(
        { current: connection, connections },
        {
            headers: {
                "Cache-Control": "no-store",
            },
        }
    );
};

const validate = ({
    allowDiskUse,
    name,
    connectionString,
    tls,
    tlsAllowInvalidCertificates,
    tlsCAFile,
    tlsCertificateKeyFile,
    tlsCertificateKeyFilePassword,
    maxPoolSize,
    whitelist,
    blacklist,
}) => {
    const errors = {};

    if (!name || name.trim() == "" || name.length < 3) {
        errors["name"] = "Name must be at least 3 characters long";
    }

    if (!connectionString || connectionString.trim() == "" || !validateMongoConnectionString(connectionString)) {
        errors["connectionString"] = "Invalid connection string";
    }

    if (tls) {
        if (!tlsCAFile || tlsCAFile.trim() == "") {
            errors["tlsCAFile"] = "CA file is required";
        }
        if (!tlsCertificateKeyFile || tlsCertificateKeyFile.trim() == "") {
            errors["tlsCertificateKeyFile"] = "Certificate key file is required";
        }
        if (!tlsCertificateKeyFilePassword || tlsCertificateKeyFilePassword.trim() == "") {
            errors["tlsCertificateKeyFilePassword"] = "Certificate key file password is required";
        }
    }

    if (maxPoolSize < 0 || maxPoolSize > 100) {
        errors["maxPoolSize"] = "Max pool size must be between 0 and 100";
    }

    if (whitelist.trim() != "") {
        const dbs = whitelist.split(",");
        for (const db of dbs) {
            if (db.trim() == "" || !isValidDatabaseName(db)) {
                errors["whitelist"] = "Invalid database name";
                break;
            }
        }
    }

    if (blacklist.trim() != "") {
        const dbs = blacklist.split(",");
        for (const db of dbs) {
            if (db.trim() == "" || !isValidDatabaseName(db)) {
                errors["blacklist"] = "Invalid database name";
                break;
            }
        }
    }

    return errors;
};

export const action: ActionFunction = async ({ request }) => {
    const jsonQuery = await request.json();

    if (jsonQuery.connect) {
        const { id } = jsonQuery.connect;
        if (!id || typeof id != "string") {
            return {
                status: "error",
                message: "Connection is invalid or doesn't exist",
            };
        }
        const userId = await getUserId(request);
        if (!userId || typeof userId != "string") {
            return {
                status: "error",
                message: "Your session expired, Please login again",
            };
        }

        try {
            const connection = await getUserDbConnection(userId, id);

            if (connection) {
                const mongo = await db(connection);
                await mongo.getDatabases();

                const session = await getUserSession(request);
                session.set("connection", connection);
                return Response.json(
                    {
                        status: "success",
                        redirect: "/",
                    },
                    {
                        headers: {
                            "Set-Cookie": await commitSession(session),
                        },
                    }
                );
            }
            return {
                status: "error",
                message: "Connection is invalid or doesn't exist",
            };
        } catch (e: any) {
            return {
                status: "error",
                message: e.message,
            };
        }
    } else if (jsonQuery.add) {
        const {
            allowDiskUse,
            name,
            connectionString,
            tls,
            tlsAllowInvalidCertificates,
            tlsCAFile,
            tlsCertificateKeyFile,
            tlsCertificateKeyFilePassword,
            maxPoolSize,
            whitelist,
            blacklist,
        } = jsonQuery.add;
        const errors = validate(jsonQuery.add);
        if (Object.keys(errors).length > 0) {
            return Response.json({
                status: "error",
                message: "Please fix the field errors and try again",
                errors: errors,
            });
        }

        const userId = await getUserId(request);
        if (!userId || typeof userId != "string") {
            return Response.json({
                status: "error",
                message: "Your session expired, Please login again",
            });
        }
        try {
            await db({
                name: "admin",
                connectionString,
                tls,
                tlsAllowInvalidCertificates,
                tlsCAFile,
                tlsCertificateKeyFile,
                tlsCertificateKeyFilePassword,
                maxPoolSize,
                whitelist,
                blacklist,
                allowDiskUse,
            });
            await addUserDbConnection(userId, {
                name,
                connectionString,
                tls,
                tlsAllowInvalidCertificates,
                tlsCAFile,
                tlsCertificateKeyFile,
                tlsCertificateKeyFilePassword,
                maxPoolSize,
                whitelist,
                blacklist,
                allowDiskUse,
            });

            return Response.json({
                status: "success",
                message: "Connection added successfully",
            });
        } catch (e: any) {
            return Response.json({
                status: "error",
                message: e.message,
            });
        }
    } else if (jsonQuery.delete) {
        const { id } = jsonQuery.delete;

        if (!id || typeof id != "string") {
            return Response.json({
                status: "error",
                message: "Connection is invalid or doesn't exist",
            });
        }

        const userId = await getUserId(request);
        if (!userId || typeof userId != "string") {
            return Response.json({
                status: "error",
                message: "Your session expired, Please login again",
            });
        }
        try {
            await removeUserDbConnection(userId, id);

            return Response.json({
                status: "success",
                message: "Connection delete successfully",
            });
        } catch (e: any) {
            return Response.json({
                status: "error",
                message: e.message,
            });
        }
    } else if (jsonQuery.edit) {
        const {
            id,
            allowDiskUse,
            name,
            connectionString,
            tls,
            tlsAllowInvalidCertificates,
            tlsCAFile,
            tlsCertificateKeyFile,
            tlsCertificateKeyFilePassword,
            maxPoolSize,
            whitelist,
            blacklist,
        } = jsonQuery.edit;

        if (!id || typeof id != "string") {
            return Response.json({
                status: "error",
                message: "Connection is invalid or doesn't exist",
            });
        }

        const errors = validate(jsonQuery.edit);
        if (Object.keys(errors).length > 0) {
            return Response.json({
                status: "error",
                message: "Please fix the field errors and try again",
                errors: errors,
            });
        }

        const userId = await getUserId(request);
        if (!userId || typeof userId != "string") {
            return Response.json({
                status: "error",
                message: "Your session expired, Please login again",
            });
        }
        try {
            await db({
                name,
                connectionString,
                tls,
                tlsAllowInvalidCertificates,
                tlsCAFile,
                tlsCertificateKeyFile,
                tlsCertificateKeyFilePassword,
                maxPoolSize,
                whitelist,
                blacklist,
                allowDiskUse,
            });
            await updateUserDbConnection(userId, id, {
                name,
                connectionString,
                tls,
                tlsAllowInvalidCertificates,
                tlsCAFile,
                tlsCertificateKeyFile,
                tlsCertificateKeyFilePassword,
                maxPoolSize,
                whitelist,
                blacklist,
                allowDiskUse,
            });

            return Response.json({
                status: "success",
                message: "Connection updated successfully",
            });
        } catch (e: any) {
            return Response.json({
                status: "error",
                message: e.message,
            });
        }
    }
    return Response.json({ status: "error", message: "Invalid submit" });
};

export default function Dashboard() {
    const loaderData = useLoaderData<typeof loader>();

    const { connections } = loaderData;
    const [error, setError] = React.useState<string | null>(null);
    const [current, setCurrent] = React.useState<DbConnection | null>(null);

    const fetcher = useFetcher<{
        status: string;
        errors?: any;
        message?: string;
        redirect?: string;
    }>();

    useEffect(() => {
        if (fetcher.state == "submitting") {
            toast({
                duration: 10000,
                type: "background",
                title: "Connecting, Please wait...",
                description: `Connecting to "${current?.name}"`,
                variant: "warning",
            });
        }
    }, [fetcher.state]);

    useEffect(() => {
        if (fetcher.data && fetcher.data.status == "success") {
            let redirectTo = fetcher.data.redirect || "/";
            setTimeout(() => {
                window.location.href = redirectTo;
            }, 1000);
            return;
        } else if (fetcher.data && fetcher.data.status == "error") {
            setError(fetcher.data.message || null);
        }

        setCurrent(null);
    }, [fetcher.data]);

    const [connectionModal, setConnectionModal] = React.useState<{
        mode: "add" | "edit";
        open: boolean;
        connection: DbConnection | null;
    }>({
        mode: "add",
        open: false,
        connection: null,
    });

    return (
        <>
            <div className="w-full max-w-md p-6 mx-auto my-16 mb-16 bg-white border border-solid border-neutral-200">
                <h2 className="mb-2 text-4xl font-bold">
                    <Logo className={"h-8"} />
                </h2>
                <p className="mb-10 text-sm">Welcome to MongoCarbon, Please select or create a new connection below:</p>
                <Accordion type="single" collapsible className="overflow-hidden ">
                    {connections.map((connection: DbConnection, index) => (
                        <AccordionItem key={`${connection.id}-${index}`} value={connection.id} title={connection.name} className="bg-neutral-100">
                            <AccordionTrigger className="px-4 border-t border-solid border-neutral-200">
                                <span className="font-medium">{connection.name}</span>
                            </AccordionTrigger>

                            <AccordionContent className="px-4">
                                <div className="flex flex-col gap-2 break-all">
                                    <div className="flex flex-col py-2 border-t border-b border-solid border-neutral-200">
                                        <span className="text-sm">Connection String:</span> <span className="font-medium">{connection.connectionString}</span>
                                    </div>
                                    <div className="flex py-2 text-sm border-b border-solid border-neutral-200">
                                        <span>Max Pool Size:</span> <span className="ml-2">{connection.maxPoolSize}</span>
                                    </div>
                                    <div className="flex py-2 text-sm border-b border-solid border-neutral-200">
                                        <span>Allow Disk Use:</span> <span className="ml-2">{connection.allowDiskUse ? "Yes" : "No"}</span>
                                    </div>
                                    <div className="flex flex-col py-2 text-sm border-b border-solid border-neutral-200">
                                        <span>Whitelist:</span> <span className="ml-2">{connection.whitelist}</span>
                                    </div>
                                    <div className="flex flex-col py-2 text-sm border-b border-solid border-neutral-200">
                                        <span>Blacklist:</span> <span className="ml-2">{connection.blacklist}</span>
                                    </div>
                                </div>

                                <div className="flex w-full gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        variant={"default"}
                                        loading={!!current && current.id == connection.id}
                                        icon={<VersionsIcon />}
                                        onClick={() => {
                                            setCurrent(connection);
                                            fetcher.submit(
                                                {
                                                    connect: connection,
                                                },
                                                {
                                                    method: "POST",
                                                    encType: "application/json",
                                                    action: `/connections`,
                                                }
                                            );
                                        }}>
                                        Connect
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        icon={<PencilIcon />}
                                        onClick={() => {
                                            setConnectionModal({ mode: "edit", open: true, connection });
                                        }}
                                        className="ml-auto">
                                        Edit
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <div className="mt-4">
                    <Button
                        size="sm"
                        variant={"secondary"}
                        icon={<VersionsIcon />}
                        onClick={() => {
                            setConnectionModal({ mode: "add", open: true, connection: null });
                        }}>
                        Add Connection
                    </Button>
                </div>
            </div>

            {error && (
                <div className="fixed -translate-x-1/2 left-1/2 bottom-10">
                    <ActionableNotification variant="error" title="Error" subtitle={error} closeOnEscape inline={false} onClose={() => setError(null)} />
                </div>
            )}
            <ConnectionModal
                open={connectionModal.open}
                mode={connectionModal.mode}
                initialData={connectionModal.connection}
                onSuccess={() => window.location.reload()}
                onClose={() => {
                    setConnectionModal({ ...connectionModal, open: false, connection: null });
                }}
            />
        </>
    );
}
