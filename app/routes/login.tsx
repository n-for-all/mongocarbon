import { useActionData, Form } from "@remix-run/react";
import { ActionFunction, TypedResponse } from "@remix-run/node";
import { validatePassword, validateUsername } from "~/utils/functions";
import { checkUserSession, createUserSession, login, register } from "~/utils/session.server";
import { ArrowRight, CarbonIconProps, LogoGithub } from "@carbon/icons-react";
import { Button, Stack, Tab, TabList, Tabs, TextInput, TabPanels, TabPanel, ActionableNotification, Layer } from "@carbon/react";
import React, { useEffect } from "react";
import { JSX } from "react/jsx-runtime";
import { Logo } from "~/components/logo";
import GitHubWidget from "~/components/github_widget";
import packageJson from "../../package.json";

type ActionResponse = {
	status: string;
	message?: string;
	errors?: {
		username: string | undefined;
		password: string | undefined;
	};
};

export const action: ActionFunction = async ({ request }): Promise<TypedResponse<ActionResponse>> => {
	try {
		const form = await request.formData();
		const username = form.get("username");
		const password = form.get("password");
		const redirectTo = form.get("redirectTo") || "/";
		if (typeof username !== "string" || typeof password !== "string" || typeof redirectTo !== "string") {
			return Response.json({
				formError: `Form not submitted correctly.`,
			});
		}
		const errors = {
			username: validateUsername(username),
			password: !password || password.trim() == "" ? "Please enter your password" : false,
		};
		if (Object.values(errors).some(Boolean)) {
			return Response.json({ status: "error", errors });
		}
		const user = await login({ username, password });
		if (!user) {
			return Response.json({
				status: "error",
				message: `The Username and Password combination is incorrect`,
			});
		}
		checkUserSession(request);
		return createUserSession(user.id, redirectTo);
	} catch (e: any) {
		if (e instanceof Response) {
			return e;
		}
		return Response.json({
			status: "error",
			message: e.message,
		});
	}
};

export default function LoginRoute() {
	const actionData = useActionData<ActionResponse>();
	// const [searchParams] = useSearchParams();
	const [open, setOpen] = React.useState(false);
	useEffect(() => {
		if (actionData && actionData.message) {
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
						<small className="block mb-6 text-xs opacity-50 leading-1">Please enter your username and password below:</small>
						<Form method="post">
							<Stack gap={7}>
								<TextInput
									id="username"
									name="username"
									labelText="Username"
									type="text"
									autoComplete="new-password"
									required
									invalid={Boolean(actionData?.errors?.username) || undefined}
									invalidText={actionData?.errors?.username ? actionData?.errors?.username : undefined}
								/>
								<TextInput
									id="password"
									name="password"
									labelText="Password"
									type="password"
									required
									autoComplete="new-password"
									invalid={Boolean(actionData?.errors?.password) || undefined}
									invalidText={actionData?.errors?.password ? actionData?.errors?.password : undefined}
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
					<ActionableNotification
						kind={actionData?.status == "error" ? "error" : "success"}
						title={actionData?.status == "error" ? "Error" : "Info"}
						subtitle={actionData?.message}
						closeOnEscape
						inline={false}
						onClose={() => setOpen(false)}
					/>
				</div>
			)}
		</>
	);
}
