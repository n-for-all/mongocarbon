import { useActionData, Form } from "@remix-run/react";
import { userDb } from "../utils/db.server";
import { ActionFunction, TypedResponse } from "@remix-run/node";
import { validatePassword, validateUsername } from "~/utils/functions";
import { register } from "~/utils/session.server";
import { PlusIcon } from "@primer/octicons-react";

import React, { useEffect } from "react";
import { Logo } from "~/components/logo";
import { Input } from "~/ui/input";
import { Button } from "~/ui/button";
import ActionableNotification from "~/ui/actionable-notification";

type ActionResponse = {
    status: string;
    message?: string;
    fieldErrors?: {
        username: string | undefined;
        password: string | undefined;
    };
};

export const action: ActionFunction = async ({ request }): Promise<TypedResponse<ActionResponse>> => {
    const form = await request.formData();
    const username = form.get("username");
    const password = form.get("password");
    const redirectTo = form.get("redirectTo") || "/";
    if (typeof username !== "string" || typeof password !== "string" || typeof redirectTo !== "string") {
        return Response.json({
            status: "error",
            message: `Form not submitted correctly.`,
        });
    }
    const errors = {
        username: validateUsername(username),
        password: validatePassword(password),
    };
    if (Object.values(errors).some(Boolean)) {
        return Response.json({ status: "error", errors });
    }
    const userExists = await userDb.user.findFirst({
        where: { username },
    });
    if (userExists) {
        return Response.json({ status: "error", message: `User with username ${username} already exists` });
    }
    const user = await register({ username, password });
    if (!user) {
        return Response.json({ status: "error", message: `Something went wrong trying to create a new user.` });
    }
    return Response.json({ status: "success", message: `User Created` });
};

export default function CreateUserRoute() {
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
            <div className="flex items-center justify-center flex-1 w-full h-screen">
                <div className="w-full max-w-md mx-auto">
                    <Logo className={"h-10 mx-auto"} />

                    <div className="w-full p-10 mt-5 border border-solid border-neutral-200 bg-neutral-50">
                        <h3 className="block mb-1 text-2xl font-bold">New user account</h3>
                        <small className="block mb-4 text-xs opacity-50 leading-1">
                            This will not create a mongodb database user, it will only create a user to access MongoCarbon admin portal
                        </small>
                        <Form method="post">
                            <div className="flex flex-col gap-10">
                                <Input
                                    id="username"
                                    labelText="Username"
                                    name="username"
                                    type="text"
                                    autoComplete="new-password"
                                    required
                                    invalid={Boolean(actionData?.fieldErrors?.username) || undefined}
                                    invalidText={actionData?.fieldErrors?.username ? actionData?.fieldErrors?.username : undefined}
                                />
                                <Input
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
                                <Button size="sm" type="submit" icon={<PlusIcon />}>
                                    Create User
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
            {open && (
                <div className="fixed -translate-x-1/2 left-1/2 bottom-10">
                    <ActionableNotification
                        variant={actionData?.status == "error" ? "error" : "success"}
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
