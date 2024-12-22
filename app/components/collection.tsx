import { Input } from "@ui/input";
import { Form, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import Modal from "~/ui/modal";
import { toast } from "~/ui/hooks/use-toast";

interface CollectionAddModalProps {
    open: boolean;
    dbName: string;
    onClose: () => void;
    onSuccess: (dbName: string, collectionName: string) => void;
}

export const CollectionAddModal = ({ dbName, open, onClose, onSuccess }: CollectionAddModalProps) => {
    const [state, setState] = useState({ collectionName: "" });

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
                title: "Connected!",
                description: fetcher.data.message || "Connected!",
                type: "background",
            });

            setTimeout(() => {
                onSuccess(dbName, state.collectionName.trim());
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
                action: `/database/${dbName}`,
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
                modalHeading={"Create a new collection"}
                modalLabel="Collection"
                primaryButtonText={"Create"}
                secondaryButtonText={"Cancel"}>
                <Form aria-label="Collection form" autoComplete="new-password">
                    <Input
                        id="collectionName"
                        labelText="Collection Name"
                        autoComplete="new-password"
                        type="text"
                        required
                        invalid={errors["collectionName"]}
                        invalidText={errors["collectionName"]}
                        helperText="Enter the name of the collection you want to create"
                        value={state.collectionName}
                        onChange={(e) => {
                            setState({ ...state, collectionName: e.target.value });
                        }}
                    />
                </Form>
            </Modal>
        </>
    );
};

interface CollectionDeleteModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    dbName: string;
    collectionName: string;
}

export const CollectionDeleteModal = ({ open, onClose, onSuccess, dbName, collectionName }: CollectionDeleteModalProps) => {
    const fetcher = useFetcher<{
        status: string;
        errors?: any;
        message?: string;
        redirect?: string;
    }>();

    const [status, setStatus] = useState("inactive");
    const [description, setDescription] = useState("Deleting...");
    const [confirmName, setConfirmName] = useState("");
    const [errors, setErrors] = useState({});

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
        if (confirmName != collectionName) {
            setErrors({ collectionName: "The name does not match the collection name" });
            return;
        }
        setStatus("active");
        fetcher.submit(
            {
                delete: { collectionName },
            },
            {
                method: "POST",
                encType: "application/json",
                action: `/database/${dbName}`,
            }
        );
    };
    if (!collectionName || collectionName == "") return null;
    return (
        <Modal
            open={open}
            danger={true}
            loading={fetcher.state == "loading" || fetcher.state == "submitting" ? true : false}
            loadingDescription={description}
            modalHeading="Drop Collection"
            modalLabel="Collection"
            primaryButtonText="Yes"
            secondaryButtonText="No"
            onClose={onClose}
            onPrimaryClick={submitDelete}>
            <h3>
                Are you sure you want to delete the collection <b>"{collectionName}"</b>?
            </h3>
            <div className="mb-4 text-xs">Deleting a collection will delete all documents in the collection and this action cannot be undone</div>
            <Input
                id="name"
                type="text"
                labelText="Type the name of the collection to confirm"
                autoComplete="new-password"
                required
                placeholder={collectionName}
                invalid={!!errors["collectionName"]}
                invalidText={errors["collectionName"]}
                value={confirmName}
                onChange={(e) => {
                    setErrors({});
                    setConfirmName(e.target.value);
                }}
            />
        </Modal>
    );
};
