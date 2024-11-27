import { FormGroup, Stack, Button, Checkbox, NumberInput, FileUploader, RadioButtonGroup, Search, Select, SelectItem, TextInput, TextArea, Modal, Dropdown } from "@carbon/react";
import { Form, useFetcher, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

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
			loadingStatus={fetcher.state == "loading" || fetcher.state == "submitting" ? "active" : (status as any)}
			loadingDescription={description}
			modalHeading="Delete Connection"
			modalLabel="Database Connection"
			primaryButtonText="Yes"
			secondaryButtonText="No"
			onRequestClose={onClose}
			onRequestSubmit={submitDelete}>
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
			setStatus("finished");
			setTimeout(() => {
				onSuccess();
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
	const [description, setDescription] = useState("Connecting...");
	const [modalDelete, setModalDelete] = useState(false);

	const submit = async () => {
		setStatus("active");
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

	const resetStatus = () => {
		setStatus("inactive");
		setDescription("Connecting...");
	};

	return (
		<>
			<Modal
				open={open}
				danger={mode == "edit"}
				onRequestClose={onClose}
				onRequestSubmit={
					mode == "edit"
						? () => {
								setModalDelete(true);
						  }
						: submit
				}
				loadingStatus={fetcher.state == "loading" || fetcher.state == "submitting" ? "active" : (status as any)}
				loadingDescription={description}
				onLoadingSuccess={resetStatus}
				modalHeading={mode == "edit" ? `Update Connection` : "Create a new database connection"}
				modalLabel="Database Connection"
				onSecondarySubmit={mode == "edit" ? submit : undefined}
				primaryButtonText={mode == "edit" ? "Delete" : "Create"}
				secondaryButtonText={mode == "edit" ? "Update" : "Cancel"}>
				<Form aria-label="Database Connection form" autoComplete="new-password">
					<Stack gap={4}>
						<TextInput
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
						<FormGroup legendText="Connection Details">
							<TextInput
								id="connectionString"
								labelText="Connection String"
								autoComplete="new-password"
								hideLabel={true}
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
                            <small className="block mt-1"><b>*</b>Use <b>"directConnection=true"</b> parameter to run operations on host <a className="text-blue-600 hover:underline" target="_blank" href="https://www.mongodb.com/docs/drivers/node/v3.6/fundamentals/connection/connect/">View More</a></small>
							
						</FormGroup>
						<Checkbox
							id="tls"
							labelText="TLS"
							helperText="set to true to enable TLS/SSL"
							checked={state.tls}
							onChange={(e) => {
								setState({ ...state, tls: e.target.checked });
							}}
						/>
						<Stack gap={4} className={state.tls ? "" : "hidden"}>
							<Checkbox
								id="tlsAllowInvalidCertificates"
								labelText="TLS Allow Invalid Certificates"
								helperText="validate mongod server certificate against CA"
								checked={state.tlsAllowInvalidCertificates}
								onChange={(e) => {
									setState({ ...state, tlsAllowInvalidCertificates: e.target.checked });
								}}
								disabled={!state.tls}
							/>
							<TextInput
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
							<TextInput
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
							<TextInput
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
						</Stack>
						<NumberInput
							id="maxPoolSize"
							label="Max Pool Size"
							min={1}
							max={100}
							value={state.maxPoolSize}
							onChange={(e) => {
								setState({ ...state, maxPoolSize: Number((e.target as HTMLInputElement).value) });
							}}
						/>
						<TextInput
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
						<TextInput
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
							id="allowDiskUse"
							labelText="Allow Disk Use"
							helperText="set to true to remove the limit of 100 MB of RAM on each aggregation pipeline stage"
							checked={state.allowDiskUse}
							onChange={(e) => {
								setState({ ...state, allowDiskUse: e.target.checked });
							}}
						/>
					</Stack>
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
    useEffect(() => {}, []);
	// useEffect(() => {
	// 	if (fetcher.data && fetcher.data.status == "success") {
	// 		window.location.reload();
	// 	}
	// }, [fetcher.data]);
	const onChange = ({ selectedItem }) => {
		if (!selectedItem) {
			return;
		}
		if (selectedItem.id == "new") {
			window.location.href = `/connections`;
			return;
		}
		const connection = connections.find((c) => c.id == selectedItem.id);
		if (connection) {
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
	return (
		<Dropdown
			type="inline"
			id="default"
			size="sm"
			hideLabel={true}
			titleText="Connection"
			onChange={onChange}
			// helperText="Select a connection"
			selectedItem={current || null}
			label={current?.name || "Select a connection"}
			items={(connections || []).concat([
				{
					id: "new",
					name: "Add New Connection",
				},
			])}
			itemToString={(item) => (item ? item.name : "")}
		/>
	);
};
