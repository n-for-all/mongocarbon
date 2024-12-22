import { LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Footer } from "~/components/footer";
import { requireUser } from "~/utils/session.server";
import { Link, redirect } from "@remix-run/react";
import { Logo } from "~/components/logo";
import SkipToContent from "~/ui/skip-to-content";
import { Header, HeaderAction, HeaderActions, HeaderName } from "~/ui/header";
import { Avatar, AvatarFallback } from "~/ui/avatar";
import { SignOutIcon } from "@primer/octicons-react";

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const user = await requireUser(request, "/login");
        return Response.json(
            { user },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (e) {
        if (e instanceof Response) {
            return e;
        }
        return redirect("/login");
    }
};

export default function Dashboard() {
    const { user } = useLoaderData<typeof loader>();
    return (
        <>
            <Header aria-label="">
                <SkipToContent />
                <HeaderName name="MongoCarbon" as={"a"} to="/">
                    <Logo className={"h-5"} />
                </HeaderName>
                <HeaderActions>
                    <HeaderAction aria-label="User Profile">
                        <Link to="/profile">
                            <Avatar className="bg-primary text-primary-foreground">
                                <AvatarFallback>{(user.username as string).substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Link>
                    </HeaderAction>

                    <HeaderAction aria-label="Logout">
                        <Link to={"/logout"}>
                            <SignOutIcon size={20} />
                        </Link>
                    </HeaderAction>
                </HeaderActions>
            </Header>
            <div className="flex flex-col h-screen overflow-auto bg-neutral-100">
                <div className="flex flex-col items-start justify-start flex-1 w-full mx-auto">
                    <Outlet />
                </div>
                <Footer />
            </div>
        </>
    );
}
