import { useActionData, Form } from "@remix-run/react";
import { userDb } from "../utils/db.server";
import { ActionFunction, TypedResponse } from "@remix-run/node";
import { validatePassword, validateUsername } from "~/utils/functions";
import { createUserSession, login, register } from "~/utils/session.server";
import { Add } from "@carbon/icons-react";
import { Button, Stack, Tab, TabList, Tabs, TextInput, TabPanels, TabPanel, ActionableNotification, Layer } from "@carbon/react";
import React, { useEffect } from "react";
import { Logo } from "~/components/logo";

type ActionResponse = {
	fields?: { loginType: string; username: string; password: string };
	formError?: string;
	fieldErrors?: {
		username: string | undefined;
		password: string | undefined;
	};
};

export const action: ActionFunction = async ({ request }): Promise<TypedResponse<ActionResponse>> => {
	const form = await request.formData();
	const loginType = form.get("loginType");
	const username = form.get("username");
	const password = form.get("password");
	const redirectTo = form.get("redirectTo") || "/";
	if (typeof username !== "string" || typeof password !== "string" || typeof redirectTo !== "string") {
		return Response.json({
			formError: `Form not submitted correctly.`,
		});
	}
	const fields = { loginType, username, password };
	const fieldErrors = {
		username: validateUsername(username),
		password: validatePassword(password),
	};
	if (Object.values(fieldErrors).some(Boolean)) return Response.json({ fieldErrors, fields });
	const userExists = await userDb.user.findFirst({
		where: { username },
	});
	if (userExists) {
		return Response.json({
			fields,
			formError: `User with username ${username} already exists`,
		});
	}
	const user = await register({ username, password });
	if (!user) {
		return Response.json({
			fields,
			formError: `Something went wrong trying to create a new user.`,
		});
	}
	return createUserSession(user.id, redirectTo);
};

export default function CreateUserRoute() {
	const actionData = useActionData<ActionResponse>();
	// const [searchParams] = useSearchParams();
	const [open, setOpen] = React.useState(false);
	useEffect(() => {
		if (actionData && actionData.formError) {
			setOpen(true);
		}
	}, [actionData]);
	return (
		<>
			<div className="flex items-center justify-center flex-1 w-full h-screen">
				<div className="w-full max-w-md mx-auto">
					<Logo className={"h-10 mx-auto"} />

					<Layer className="w-full p-10 mt-5 border border-solid shadow-lg border-neutral-200 bg-neutral-50">
						<h3 className="block mb-1 text-2xl font-bold">New user account</h3>
						<small className="block mb-4 text-xs opacity-50 leading-1">
							This will not create a mongodb database user, it will only create a user to access MongoCarbon admin portal
						</small>
						<Form method="post">
							<Stack gap={7}>
								<TextInput
									id="username"
									labelText="Email"
									name="username"
									type="email"
									autoComplete="new-password"
									required
									invalid={Boolean(actionData?.fieldErrors?.username) || undefined}
									invalidText={actionData?.fieldErrors?.username ? actionData?.fieldErrors?.username : undefined}
								/>
								<TextInput
									id="password"
									labelText="Password"
									type="password"
									name="password"
									required
									autoComplete="new-password"
									pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}"
									invalid={Boolean(actionData?.fieldErrors?.password) || undefined}
									invalidText={actionData?.fieldErrors?.password ? actionData?.fieldErrors?.password : undefined}
								/>
								<Button size="sm" type="submit" renderIcon={Add}>Create User</Button>
							</Stack>
						</Form>
					</Layer>
				</div>
			</div>
			{open && (
				<div className="fixed -translate-x-1/2 left-1/2 bottom-10">
					<ActionableNotification title="Error" subtitle={actionData?.formError} closeOnEscape inline={false} onClose={() => setOpen(false)} />
				</div>
			)}
		</>
	);
}
