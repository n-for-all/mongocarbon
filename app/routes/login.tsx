import { useActionData, Form } from "@remix-run/react";
import { ActionFunction, TypedResponse } from "@remix-run/node";
import { validatePassword, validateUsername } from "~/utils/functions";
import { createUserSession, login, register } from "~/utils/session.server";
import { ArrowRight, CarbonIconProps, LogoGithub } from "@carbon/icons-react";
import { Button, Stack, Tab, TabList, Tabs, TextInput, TabPanels, TabPanel, ActionableNotification, Layer } from "@carbon/react";
import React, { useEffect } from "react";
import { JSX } from "react/jsx-runtime";
import { Logo } from "~/components/logo";
import GitHubWidget from "~/components/github_widget";
import packageJson from "../../package.json";

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
		password: !password || password.trim() == "" ? "Please enter your password" : false,
	};
	if (Object.values(fieldErrors).some(Boolean)) return Response.json({ fieldErrors, fields });
	const user = await login({ username, password });
	if (!user) {
		return Response.json({
			fields,
			formError: `The Username and Password combination is incorrect`,
		});
	}
	return createUserSession(user.id, redirectTo);
};

export default function LoginRoute() {
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
			<div className="flex items-center justify-center h-screen">
				<div className="w-full max-w-md mx-auto">
					<Logo className={"h-10 mx-auto"} />
					<Layer className="w-full p-10 mt-5 bg-white border border-solid shadow-lg border-neutral-200">
						<h3 className="block mb-1 text-3xl font-bold">Login</h3>
						<small className="block mb-6 text-xs opacity-50 leading-1">Please enter your email and password below:</small>
						<Form method="post">
							<Stack gap={7}>
								<TextInput
									id="username"
									name="username"
									labelText="Email"
									type="email"
									autoComplete="new-password"
									required
									invalid={Boolean(actionData?.fieldErrors?.username) || undefined}
									invalidText={actionData?.fieldErrors?.username ? actionData?.fieldErrors?.username : undefined}
								/>
								<TextInput
									id="password"
									name="password"
									labelText="Password"
									type="password"
									required
									autoComplete="new-password"
									invalid={Boolean(actionData?.fieldErrors?.password) || undefined}
									invalidText={actionData?.fieldErrors?.password ? actionData?.fieldErrors?.password : undefined}
								/>
								<Button
									size="sm"
									renderIcon={(props: JSX.IntrinsicAttributes & CarbonIconProps & React.RefAttributes<React.ReactSVGElement>) => (
										<ArrowRight size={20} {...props} />
									)}
									type="submit">
									Login
								</Button>
							</Stack>
						</Form>
					</Layer>
					<div className="flex flex-col items-center justify-center mt-4">
						<GitHubWidget repo="n-for-all/mongocarbon" version={packageJson.version} title={"MongoCarbon"} />
					</div>
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
