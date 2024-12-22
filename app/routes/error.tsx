import { useLoaderData } from "@remix-run/react";
import { Link, redirect } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { User } from "~/utils/session.server";
import { useState } from "react";
import { Footer } from "~/components/footer";
import { Logo } from "~/components/logo";
import { Header, HeaderAction, HeaderActions, HeaderMenuButton, HeaderName } from "~/ui/header";
import SkipToContent from "~/ui/skip-to-content";
import { Avatar, AvatarFallback } from "~/ui/avatar";
import { ArrowRightIcon, SignOutIcon, ThreeBarsIcon, XIcon } from "@primer/octicons-react";
import { Button } from "~/ui/button";

interface UUID {
    $uuid: string;
}
interface Info {
    readOnly: boolean;
    uuid: UUID;
}

interface IdIndex {
    v: number;
    key: { [key: string]: number };
    name: string;
}

interface MongoDbCollection {
    name: string;
    type: string;
    options: object;
    info: Info;
    idIndex: IdIndex;
}

type ProfileLoaderData = {
    user: User;
};

export const loader: LoaderFunction = async ({ request, params }) => {
    let url = new URL(request.url);
    let message = url.searchParams.get("message");
    try {
        return Response.json(
            { message },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (e: any) {
        return redirect(`/error?message=${e.message}`);
    }
};

export default function Layout() {
    const loaderData = useLoaderData<typeof loader>();

    const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);

    return (
        <>
            <Header aria-label="">
                <SkipToContent />
                <HeaderMenuButton
                    aria-label="Open menu"
                    renderMenuIcon={<ThreeBarsIcon />}
                    renderCloseIcon={<XIcon />}
                    onClick={() => {
                        setIsSideNavExpanded(!isSideNavExpanded);
                    }}
                    isActive={isSideNavExpanded}
                />
                <HeaderName as={"a"} to="/">
                    <Logo className={"h-5"} />
                </HeaderName>
                <HeaderActions>
                    <Link to="/profile">
                        <HeaderAction aria-label="User Profile">
                            <Avatar className="bg-primary text-primary-foreground">
                                <AvatarFallback>{(loaderData.user.username as string).substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </HeaderAction>
                    </Link>
                    <HeaderAction aria-label="Logout">
                        <Link to={"/logout"}>
                            <SignOutIcon size={20} />
                        </Link>
                    </HeaderAction>
                </HeaderActions>
            </Header>

            <div className="h-screen pt-12">
                <div className="max-w-xl pl-0 pr-0">
                    <div className="h-full pt-5 mr-0 overflow-auto">
                        <div className="p-4 border border-red-300 border-solid">
                            <h2 className="mb-5 text-2xl font-bold text-red-600">Error</h2>
                            <p className="mb-4">{loaderData?.message}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button size="sm" variant="secondary" as={"a"} to="/" icon={<ArrowRightIcon />}>
                                    Dashboard
                                </Button>
                                <Button size="sm" variant="ghost" as={"a"} to="/connections" icon={<ArrowRightIcon />}>
                                    Connections
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
