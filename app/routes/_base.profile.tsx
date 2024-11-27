import { ActionableNotification, Button, Form, Layer, Stack, TextInput } from "@carbon/react";
import { UserAvatar, Logout, Connect, Edit, ArrowRight, ConnectSource, Add } from "@carbon/icons-react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Outlet, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Footer } from "~/components/footer";
import { validatePassword } from "~/utils/functions";
import { logout, requireUser, updatePassword } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
	const user = await requireUser(request, "/login?redirect=/profile");

	return Response.json(
		{ user },
		{
			headers: {
				"Cache-Control": "no-store",
			},
		}
	);
};
export const action: ActionFunction = async ({ request }) => {
	const user = await requireUser(request, "/login?redirect=/profile");

	const formData = await request.formData();
	const username = formData.get("username");
	const password = formData.get("password");
	const confirm_password = formData.get("confirm_password");
	if (typeof password !== "string" || typeof confirm_password !== "string") {
		return Response.json({
			formError: `Please enter a valid password.`,
		});
	}
	const fields = { password, confirm_password };
	const fieldErrors = {
		password: validatePassword(password),
	};
	if (Object.values(fieldErrors).some(Boolean)) {
		return Response.json({ fieldErrors, fields, formError: validatePassword(password) });
	}

	if (password !== confirm_password) {
		return Response.json({
			fields,
			formError: `Passwords do not match.`,
			fieldErrors: {
				confirm_password: "Confirm password do not match.",
			},
		});
	}

	try {
		await updatePassword(user.id, password);
		await logout(request);
		return redirect("/");
	} catch (e: any) {
		return Response.json({
			fields,
			formError: e.message,
		});
	}
};

export default function Dashboard() {
	const loaderData = useLoaderData<typeof loader>();

	const [user, setUser] = useState(loaderData?.user);
	const navigate = useNavigate();

	const [state, setState] = useState({
		password: "",
		confirm_password: "",
	});

	const actionData = useActionData<typeof action>();
	// const [searchParams] = useSearchParams();
	const [open, setOpen] = useState(false);
	useEffect(() => {
		if (actionData && actionData.formError) {
			setOpen(true);
		}
		if (actionData && actionData.fields) {
			setState(actionData.fields);
		}
	}, [actionData]);

	return (
		<>
			<Layer className="w-full max-w-md p-6 mx-auto my-16 mb-16 bg-white border border-solid shadow-lg border-neutral-200">
				<h2 className="mb-2 text-4xl font-bold">Welcome</h2>
				<p className="mb-10 text-sm">Please use the form below to update your profile</p>
				<Form method="post">
					<input type="hidden" name="loginType" value="login" />
					<Stack gap={7} className="mb-2">
						<TextInput id="username" name="username" readOnly labelText="Email" type="email" value={user.username} autoComplete="new-password" required />
						<TextInput
							id="password"
							name="password"
							labelText="Password"
							type="password"
							value={state.password}
							onChange={(e) => {
								setState({ ...state, password: e.target.value });
							}}
							required
							autoComplete="new-password"
							invalid={Boolean(actionData?.fieldErrors?.password) || undefined}
							invalidText={actionData?.fieldErrors?.password ? actionData?.fieldErrors?.password : undefined}
						/>
						<TextInput
							id="confirm_password"
							name="confirm_password"
							labelText="Confirm Password"
							type="password"
							value={state.confirm_password}
							onChange={(e) => {
								setState({ ...state, confirm_password: e.target.value });
							}}
							required
							autoComplete="new-password"
							invalid={Boolean(actionData?.fieldErrors?.confirm_password) || undefined}
							invalidText={actionData?.fieldErrors?.confirm_password ? actionData?.fieldErrors?.confirm_password : undefined}
						/>
						<Button size="sm" renderIcon={ArrowRight} type="submit">
							Update
						</Button>
					</Stack>
					<hr />
					<div className="flex items-center justify-between">
						
						<Button
							className="mt-4"
							size="sm"
							renderIcon={Add}
							type="button"
							kind="secondary"
							onClick={() => {
								navigate("/create");
							}}>
							Add User
						</Button>
                        <Button
                        hasIconOnly
							className="mt-4"
							size="sm"
                            iconDescription="Connections"
							renderIcon={ConnectSource}
							type="button"
							kind="tertiary"
							onClick={() => {
								navigate("/connections");
							}}>
							Go to Connections
						</Button>
					</div>
				</Form>
			</Layer>
			{open && (
				<div className="fixed -translate-x-1/2 left-1/2 bottom-10">
					<ActionableNotification title="Error" subtitle={actionData?.formError} closeOnEscape inline={false} onClose={() => setOpen(false)} />
				</div>
			)}
		</>
	);
}
