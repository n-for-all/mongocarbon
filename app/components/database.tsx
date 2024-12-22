import { Form, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Input } from "@ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/ui/dialog";
import { Button } from "~/ui/button";
import Modal from "~/ui/modal";
import { toast } from "~/ui/hooks/use-toast";

interface DatabaseAddModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (dbName: string, collectionName: string) => void;
}

export const DatabaseAddModal = ({ open, onClose, onSuccess }: DatabaseAddModalProps) => {
    const [state, setState] = useState({ dbName: "", collectionName: "" });

    const [errors, setErrors] = useState({});
    const fetcher = useFetcher<{
        status: string;
        errors?: any;
        message?: string;
        redirect?: string;
    }>();

    useEffect(() => {
        if (fetcher.data && fetcher.data.status == "success") {
            setDescription("Created!");
            toast({
                title: "Database Created!",
                type: "background",
            });
            setTimeout(() => {
                onSuccess(state.dbName.trim(), state.collectionName.trim());
                onClose();
            }, 2000);
        } else if (fetcher.data && fetcher.data.status == "error") {
            setDescription(fetcher.data.message || "");

            setErrors(fetcher.data.errors || {});

            toast({
                title: "Error",
                description: fetcher.data.message || "An error occurred",
                type: "background",
            });
        }
    }, [fetcher.data]);

    const [description, setDescription] = useState("Creating...");

    const submit = async () => {
        fetcher.submit(
            {
                create: state,
            },
            {
                method: "POST",
                encType: "application/json",
                action: `/database`,
            }
        );
    };

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                onPrimaryClick={submit}
                loading={fetcher.state == "loading" || fetcher.state == "submitting" ? true : false}
                loadingDescription={description}
                modalHeading={"Create a new database"}
                modalLabel="Database"
                primaryButtonText={"Create"}
                secondaryButtonText={"Cancel"}>
                <Form aria-label="Database form" autoComplete="new-password">
                    <div className="flex flex-col gap-4">
                        <Input
                            id="name"
                            labelText="Database Name"
                            type="text"
                            autoComplete="new-password"
                            required
                            invalid={errors["dbName"]}
                            invalidText={errors["dbName"]}
                            helperText="Enter a name for this database"
                            value={state.dbName}
                            onChange={(e) => {
                                setState({ ...state, dbName: e.target.value });
                            }}
                        />
                        <hr />
                        <div>
                            <Input
                                id="collectionName"
                                labelText="Collection Name"
                                autoComplete="new-password"
                                type="text"
                                required
                                invalid={errors["collectionName"]}
                                invalidText={errors["collectionName"]}
                                helperText="You need to add a collection to create the database"
                                value={state.collectionName}
                                onChange={(e) => {
                                    setState({ ...state, collectionName: e.target.value });
                                }}
                            />
                            <small className="block mt-4 mb-4 text-sm">
                                <b>*</b>MongoDb will only create a database if a collection is added.
                                <a
                                    className="ml-2 text-sm text-blue-600 hover:underline"
                                    target="_blank"
                                    href="https://www.mongodb.com/resources/products/fundamentals/create-database">
                                    Learn More
                                </a>
                            </small>
                        </div>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

interface DatabaseDeleteModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    name: string;
}

export const DatabaseDeleteModal = ({ open, onClose, onSuccess, name }: DatabaseDeleteModalProps) => {
    const fetcher = useFetcher<{
        status: string;
        errors?: any;
        message?: string;
        redirect?: string;
    }>();

    const [description, setDescription] = useState("Deleting...");
    const [confirmName, setConfirmName] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (fetcher.data && fetcher.data.status == "success") {
            setDescription("Deleted!");
            toast({
                title: "Database Deleted!",
                type: "background",
            });
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } else if (fetcher.data && fetcher.data.status == "error") {
            setDescription(fetcher.data.message || "");
            toast({
                title: "Error",
                description: fetcher.data.message || "An error occurred",
                type: "background",
            });

            setTimeout(() => {
                setDescription("Deleting...");
            }, 2000);
        }
    }, [fetcher.data]);

    const submitDelete = async () => {
        if (confirmName != name) {
            setErrors({ name: "The name does not match the database name" });
            return;
        }

        fetcher.submit(
            {
                delete: { name },
            },
            {
                method: "POST",
                encType: "application/json",
                action: `/database`,
            }
        );
    };
    if (!name || name == "") return null;
    return (
        <Modal
            open={open}
            danger={true}
            loading={fetcher.state == "loading" || fetcher.state == "submitting" ? true : false}
            loadingDescription={description}
            modalHeading="Drop Database"
            modalLabel="Database"
            primaryButtonText="Yes"
            secondaryButtonText="No"
            onClose={onClose}
            onPrimaryClick={submitDelete}>
            <h3>
                Are you sure you want to drop the database <b>"{name}"</b>?
            </h3>
            <div className="mb-4 text-xs">Dropping a database will delete all collections and documents in the database and this action cannot be undone</div>
            <Input
                id="name"
                labelText="Type the name of the database to confirm"
                type="text"
                autoComplete="new-password"
                required
                placeholder={name}
                invalid={!!errors["confirmName"]}
                invalidText={errors["confirmName"]}
                value={confirmName}
                onChange={(e) => {
                    setErrors(() => ({}));
                    setConfirmName(e.target.value);
                }}
            />
        </Modal>
    );
};
