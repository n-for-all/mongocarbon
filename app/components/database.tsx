import { FormGroup, Stack, Button, Checkbox, NumberInput, FileUploader, RadioButtonGroup, Search, Select, SelectItem, TextInput, TextArea, Modal, Dropdown } from "@carbon/react";
import { Form, useFetcher, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

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
			setStatus("finished");
			setTimeout(() => {
				onSuccess(state.dbName.trim(), state.collectionName.trim());
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
				action: `/database`,
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
				modalHeading={"Create a new database"}
				modalLabel="Database"
				primaryButtonText={"Create"}
				secondaryButtonText={"Cancel"}>
				<Form aria-label="Database form" autoComplete="new-password">
					<Stack gap={4}>
						<TextInput
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
								helperText="You need to add a collection to create the database"
								value={state.collectionName}
								onChange={(e) => {
									setState({ ...state, collectionName: e.target.value });
								}}
							/>
							<small className="block mt-1">
								<b>*</b>MongoDb will only create a database if a collection is added.
								<a className="text-blue-600 hover:underline" target="_blank" href="https://www.mongodb.com/resources/products/fundamentals/create-database">
									View More
								</a>
							</small>
						</FormGroup>
					</Stack>
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
		if (confirmName != name) {
			setErrors({ name: "The name does not match the database name" });
			return;
		}
		setStatus("active");
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
			loadingStatus={fetcher.state == "loading" || fetcher.state == "submitting" ? "active" : (status as any)}
			loadingDescription={description}
			modalHeading="Drop Database"
			modalLabel="Database"
			primaryButtonText="Yes"
			secondaryButtonText="No"
			onRequestClose={onClose}
			onRequestSubmit={submitDelete}>
			<h3>
				Are you sure you want to drop the database <b>"{name}"</b>?
			</h3>
			<div className="mb-4 text-xs">Dropping a database will delete all collections and documents in the database and this action cannot be undone</div>
			<TextInput
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
