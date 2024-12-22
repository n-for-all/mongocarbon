import { Form, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Checkbox } from "~/ui/checkbox";
import { toast } from "~/ui/hooks/use-toast";
import { Input } from "~/ui/input";
import Modal from "~/ui/modal";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/ui/select";

interface ConnectionDeleteModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    id: string;
}

const ConnectionDeleteModal = ({ open, onClose, onSuccess, id }: ConnectionDeleteModalProps) => {
    const fetcher = useFetcher<{
        status: string;
        errors?: any;
        message?: string;
        redirect?: string;
    }>();

    const [status, setStatus] = useState("inactive");
    const [description, setDescription] = useState("Deleting...");

    useEffect(() => {
        if (fetcher.data && fetcher.data.status == "success") {
            setDescription("Deleted!");
            setStatus("finished");
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } else if (fetcher.data && fetcher.data.status == "error") {
            setDescription(fetcher.data.message || "");
            setStatus("error");

            setTimeout(() => {
                setStatus("inactive");
                setDescription("Deleting...");
            }, 2000);
        }
    }, [fetcher.data]);

    const submitDelete = async () => {
        setStatus("active");
        fetcher.submit(
            {
                delete: { id },
            },
            {
                method: "POST",
                encType: "application/json",
                action: `/connections`,
            }
        );
    };
    return (
        <Modal
            open={open}
            danger={true}
            loading={fetcher.state == "loading" || fetcher.state == "submitting" ? true : false}
            loadingDescription={description}
            modalHeading="Delete Connection"
            modalLabel="Database Connection"
            primaryButtonText="Yes"
            secondaryButtonText="No"
            onClose={onClose}
            onPrimaryClick={submitDelete}
            onSecondaryClick={onClose}>
            <h3>Are you sure you want to delete this connection?</h3>
        </Modal>
    );
};

interface ConnectionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode?: "add" | "edit";
    initialData?: any;
}

export const ConnectionModal = ({ open, onClose, onSuccess, mode = "add", initialData = null }: ConnectionModalProps) => {
    const [state, setState] = useState(
        initialData ?? {
            id: undefined,
            allowDiskUse: true,
            name: "",
            connectionString: "",
            tls: false,
            tlsAllowInvalidCertificates: true,
            tlsCAFile: "",
            tlsCertificateKeyFile: "",
            tlsCertificateKeyFilePassword: "",
            maxPoolSize: 4,
            whitelist: "",
            blacklist: "",
        }
    );

    const [errors, setErrors] = useState({});
    const fetcher = useFetcher<{
        status: string;
        errors?: any;
        message?: string;
        redirect?: string;
    }>();

    useEffect(() => {
        setState(
            initialData ?? {
                id: undefined,
                allowDiskUse: true,
                name: "",
                connectionString: "",
                tls: false,
                tlsAllowInvalidCertificates: true,
                tlsCAFile: "",
                tlsCertificateKeyFile: "",
                tlsCertificateKeyFilePassword: "",
                maxPoolSize: 4,
                whitelist: "",
                blacklist: "",
            }
        );
    }, [initialData]);

    useEffect(() => {
        if (fetcher.data && fetcher.data.status == "success") {
            setDescription(mode == "edit" ? "Updated" : "Connected!");
            toast({
                title: mode == "edit" ? "Updated" : "Connected!",
                type: "background",
            });

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } else if (fetcher.data && fetcher.data.status == "error") {
            setDescription(fetcher.data.message || "");
            setErrors(fetcher.data.errors || {});
            toast({
                title: "Error",
                description: fetcher.data.message || "An error occurred",
                variant: "error",
            });
        }
    }, [fetcher.data]);

    const [description, setDescription] = useState("Connecting...");
    const [modalDelete, setModalDelete] = useState(false);

    const submit = async () => {
        fetcher.submit(
            {
                [mode]: state,
            },
            {
                method: "POST",
                encType: "application/json",
                action: `/connections`,
            }
        );
    };

    return (
        <>
            <Modal
                open={open}
                danger={mode == "edit"}
                onClose={onClose}
                onPrimaryClick={
                    mode == "edit"
                        ? () => {
                              setModalDelete(true);
                          }
                        : submit
                }
                loading={fetcher.state == "loading" || fetcher.state == "submitting" ? true : false}
                loadingDescription={description}
                modalHeading={mode == "edit" ? `Update Connection` : "Create a new database connection"}
                modalLabel="Database Connection"
                onSecondaryClick={mode == "edit" ? submit : undefined}
                primaryButtonText={mode == "edit" ? "Delete" : "Create"}
                secondaryButtonText={mode == "edit" ? "Update" : "Cancel"}>
                <Form aria-label="Database Connection form" autoComplete="new-password">
                    <div className="flex flex-col gap-4">
                        <Input
                            id="name"
                            labelText="Name"
                            type="text"
                            autoComplete="new-password"
                            required
                            invalid={errors["name"]}
                            invalidText={errors["name"]}
                            helperText="Enter a name for this connection"
                            value={state.name}
                            onChange={(e) => {
                                setState({ ...state, name: e.target.value });
                            }}
                        />
                        <hr />
                        <div>
                            <Input
                                id="connectionString"
                                labelText="Connection String"
                                autoComplete="new-password"
                                type="text"
                                required
                                invalid={errors["connectionString"]}
                                invalidText={errors["connectionString"]}
                                helperText="ex: mongodb:// or mongodb+srv:// [username:password@]host[/[defaultauthdb][?options]]"
                                value={state.connectionString}
                                onChange={(e) => {
                                    setState({ ...state, connectionString: e.target.value });
                                }}
                            />
                            <a className="text-xs text-blue-600 hover:underline" target="_blank" href="https://www.mongodb.com/docs/manual/reference/connection-string/">
                                View Documentation
                            </a>
                            <small className="block mt-1">
                                <b>*</b>Use <b>"directConnection=true"</b> parameter to run operations on host{" "}
                                <a className="text-blue-600 hover:underline" target="_blank" href="https://www.mongodb.com/docs/drivers/node/v3.6/fundamentals/connection/connect/">
                                    View More
                                </a>
                            </small>
                        </div>
                        <Checkbox
                            labelText="TLS"
                            helperText="set to true to enable TLS/SSL"
                            checked={state.tls}
                            onChange={(checked) => {
                                setState({ ...state, tls: checked });
                            }}
                        />
                        <div className={"flex flex-col gap-4" + (state.tls ? "" : " hidden")}>
                            <Checkbox
                                labelText="TLS Allow Invalid Certificates"
                                helperText="validate mongod server certificate against CA"
                                checked={state.tlsAllowInvalidCertificates}
                                onChange={(checked) => {
                                    setState({ ...state, tlsAllowInvalidCertificates: checked });
                                }}
                                disabled={!state.tls}
                            />
                            <Input
                                id="tlsCAFile"
                                labelText="TLS CA File"
                                autoComplete="new-password"
                                type="text"
                                required
                                invalid={errors["tlsCAFile"]}
                                invalidText={errors["tlsCAFile"]}
                                disabled={!state.tls}
                                value={state.tlsCAFile}
                                onChange={(e) => {
                                    setState({ ...state, tlsCAFile: e.target.value });
                                }}
                            />
                            <Input
                                id="tlsCertificateKeyFile"
                                autoComplete="new-password"
                                labelText="TLS Certificate Key File"
                                type="text"
                                required
                                invalid={errors["tlsCertificateKeyFile"]}
                                invalidText={errors["tlsCertificateKeyFile"]}
                                disabled={!state.tls}
                                value={state.tlsCertificateKeyFile}
                                onChange={(e) => {
                                    setState({ ...state, tlsCertificateKeyFile: e.target.value });
                                }}
                            />
                            <Input
                                id="tlsCertificateKeyFilePassword"
                                labelText="TLS Certificate Key File Password"
                                type="password"
                                autoComplete="new-password"
                                required
                                invalid={errors["tlsCertificateKeyFilePassword"]}
                                invalidText={errors["tlsCertificateKeyFilePassword"]}
                                disabled={!state.tls}
                                value={state.tlsCertificateKeyFilePassword}
                                onChange={(e) => {
                                    setState({ ...state, tlsCertificateKeyFilePassword: e.target.value });
                                }}
                            />
                        </div>
                        <Input
                            id="maxPoolSize"
                            labelText="Max Pool Size"
                            type="number"
                            min={1}
                            max={100}
                            value={state.maxPoolSize}
                            onChange={(e) => {
                                setState({ ...state, maxPoolSize: Number((e.target as HTMLInputElement).value) });
                            }}
                        />
                        <Input
                            id="whitelist"
                            autoComplete="new-password"
                            labelText="Whitelist"
                            type="text"
                            invalid={false}
                            invalidText=""
                            helperText="Comma separated list of databases (case sensitive)"
                            value={state.whitelist}
                            onChange={(e) => {
                                setState({ ...state, whitelist: e.target.value });
                            }}
                        />
                        <Input
                            id="blacklist"
                            autoComplete="new-password"
                            labelText="Blacklist"
                            type="text"
                            helperText="Comma separated list of databases (case sensitive)"
                            invalid={false}
                            invalidText=""
                            value={state.blacklist}
                            onChange={(e) => {
                                setState({ ...state, blacklist: e.target.value });
                            }}
                        />

                        <Checkbox
                            labelText="Allow Disk Use"
                            helperText="set to true to remove the limit of 100 MB of RAM on each aggregation pipeline stage"
                            checked={state.allowDiskUse}
                            onChange={(checked) => {
                                setState({ ...state, allowDiskUse: checked });
                            }}
                        />
                    </div>
                </Form>
            </Modal>
            <ConnectionDeleteModal
                open={modalDelete}
                onClose={() => setModalDelete(false)}
                onSuccess={() => {
                    onSuccess();
                    onClose();
                }}
                id={state.id}
            />
        </>
    );
};

export const SwitchConnection = ({ current, connections }) => {
    const fetcher = useFetcher<{
        status: string;
        errors?: any;
        message?: string;
        redirect?: string;
    }>();

    const [selectedConnection, setSelectedConnection] = useState(current);
    useEffect(() => {
        if (selectedConnection && (fetcher.state == "submitting" || fetcher.state == "loading")) {
            const connection = connections.find((c) => c.id == selectedConnection.id);
            if (connection) {
                toast({
                    title: "Connecting, Please wait...",
                    description: `Connecting to "${connection.name}"`,
                    variant: "default",
                });
            }
        }
    }, [fetcher.state]);
    useEffect(() => {
        if (fetcher.data && fetcher.data.status == "success") {
            window.location.href = fetcher.data.redirect || "/";
        } else if (fetcher.data && fetcher.data.status == "error") {
            toast({
                title: "Error",
                description: fetcher.data.message,
                variant: "error",
            });
        }
    }, [fetcher.data]);
    const onChange = (selectedItem) => {
        if (!selectedItem || !selectedItem.id) {
            return;
        }
        const connection = connections.find((c) => c.id == selectedItem.id);
        if (connection) {
            setSelectedConnection(connection);
            fetcher.submit(
                {
                    connect: { id: connection.id },
                },
                {
                    method: "POST",
                    encType: "application/json",
                    action: `/connections`,
                }
            );
        }
    };

    let items = connections || [];
    return (
        <>
            <Select
                onValueChange={(value) => {
                    if (value == "new") {
                        window.location.href = `/connections`;
                        return;
                    }
                    onChange(items.find((item) => item.id == value));
                }}
                value={current ? current.id : null}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue>{current?.name || "Select a connection"}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white">
                    {items.map((item) => {
                        return (
                            <SelectItem key={item.id} value={item.id}>
                                {item.name}
                            </SelectItem>
                        );
                    })}
                    <SelectGroup>
                        <SelectLabel className="mt-5 text-xs font-normal uppercase opacity-50">New Connection</SelectLabel>
                        <SelectItem className="text-sm" value="new">
                            Add New Connection
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </>
    );
};
