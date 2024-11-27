import { FormGroup, Stack, Button, Checkbox, NumberInput, FileUploader, RadioButtonGroup, Search, Select, SelectItem, TextInput, TextArea, Modal, Dropdown } from "@carbon/react";
import { Form, useFetcher, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

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
			setStatus("finished");
			setTimeout(() => {
				onSuccess(dbName, state.collectionName.trim());
				onClose();
			}, 2000);
		} else if (fetcher.data && fetcher.data.status == "error") {
			setDescription(fetcher.data.message || "");
			setStatus("error");
			setErrors(fetcher.data.errors || {});

			setTimeout(() => {
				resetStatus();
			}, 2000);
		}
	}, [fetcher.data]);

	const [status, setStatus] = useState("inactive");
	const [description, setDescription] = useState("Creating...");

	const submit = async () => {
		setStatus("active");
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

	const resetStatus = () => {
		setStatus("inactive");
		setDescription("Creating...");
	};

	return (
		<>
			<Modal
				open={open}
				onRequestClose={onClose}
				onRequestSubmit={submit}
				loadingStatus={fetcher.state == "loading" || fetcher.state == "submitting" ? "active" : (status as any)}
				loadingDescription={description}
				onLoadingSuccess={resetStatus}
				modalHeading={"Create a new collection"}
				modalLabel="Collection"
				primaryButtonText={"Create"}
				secondaryButtonText={"Cancel"}>
				<Form aria-label="Collection form" autoComplete="new-password">
					<Stack gap={4}>
						<FormGroup legendText="Collection Name">
							<TextInput
								id="collectionName"
								labelText="Collection Name"
								autoComplete="new-password"
								hideLabel={true}
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
						</FormGroup>
					</Stack>
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
			loadingStatus={fetcher.state == "loading" || fetcher.state == "submitting" ? "active" : (status as any)}
			loadingDescription={description}
			modalHeading="Drop Collection"
			modalLabel="Collection"
			primaryButtonText="Yes"
			secondaryButtonText="No"
			onRequestClose={onClose}
			onRequestSubmit={submitDelete}>
			<h3>
				Are you sure you want to delete the collection <b>"{collectionName}"</b>?
			</h3>
			<div className="mb-4 text-xs">Deleting a collection will delete all documents in the collection and this action cannot be undone</div>
			<TextInput
				id="name"
				labelText="Type the name of the collection to confirm"
				type="text"
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
