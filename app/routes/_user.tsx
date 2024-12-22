import { Outlet, useLoaderData } from "@remix-run/react";
import { Link, redirect, useLocation } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";
import packageJson from "../../package.json";

import { DatabaseIcon, EyeIcon, PlusIcon, SignOutIcon, ThreeBarsIcon, XIcon } from "@primer/octicons-react";
import { LoaderFunction } from "@remix-run/node";
import { commitSession, getUserDbConnections, getUserSession, requireUser, User } from "~/utils/session.server";
import db, { ConnectionData } from "~/lib/db";
import { colsToGrid } from "~/utils/functions";
import { ReactElement, useEffect, useState } from "react";
import { Footer } from "~/components/footer";
import { SwitchConnection } from "~/components/connection";
import { DbConnection } from "@prisma/client";
import { DatabaseAddModal } from "~/components/database";
import { GithubButton } from "~/components/github_widget";
import { Logo } from "~/components/logo";
import SkipToContent from "~/ui/skip-to-content";
import { HeaderNavigation, Header, HeaderAction, HeaderActions, HeaderMenuButton, HeaderMenuItem, HeaderName } from "~/ui/header";
import { Avatar, AvatarFallback } from "~/ui/avatar";
import { TreeNode, TreeView } from "~/ui/tree";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarProvider } from "~/ui/sidebar";

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
    try {
        const user = await requireUser(request, "/login");
        const session = await getUserSession(request);
        const connections = await getUserDbConnections(user.id);
        let connection = session.get("connection");

        if (!connection || connections.length == 0) {
            if (connections.length == 1) {
                // If there is only one connection, set it as the default
                session.set("connection", connections[0]);
                await commitSession(session);
                connection = connections[0];
            } else {
                return redirect("/connections", 301);
            }
        }

        let mongo: ConnectionData;

        try {
            mongo = await db(connection);
        } catch (error: any) {
            return Response.json({ status: "error", message: "Error: " + error.message }, { status: 500 });
        }

        const databases = await mongo.getDatabases(); // List of database names

        const collections = {};
        for (let i in databases) {
            collections[databases[i]] = await mongo.getCollections({ dbName: databases[i] });
        }
        const gridFSBuckets = colsToGrid(collections);

        const result: ProfileLoaderData & {
            selectedDb: string | undefined | null;
            selectedCollection: string | undefined | null;
            connection: DbConnection;
            connections: Array<DbConnection>;
            databases: string[];
            collections: Record<string, string[]>;
            gridFSBuckets: { [x: string]: string[] };
        } = { selectedDb: params.db || null, selectedCollection: params.db ? params.col || null : null, user, databases, connections, connection, collections, gridFSBuckets };

        return Response.json(result, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (e: any) {
        if (e instanceof Response) {
            return e;
        }
        return redirect(`/error?message=${e.message}`);
    }
};

export default function Layout() {
    const loaderData = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);
    const [isCreateDatabase, setIsCreateDatabase] = useState(false);

    let _currentDb: string = loaderData.selectedDb ? loaderData.selectedDb : "";
    let _currentCollection: string = loaderData.selectedCollection ? loaderData.selectedCollection : "";
    const [current, setCurrent] = useState({
        db: _currentDb,
        collection: _currentCollection,
    });

    useEffect(() => {
        if (loaderData.selectedDb != current.db || loaderData.selectedCollection != current.collection) {
            let _currentDb: string = loaderData.selectedDb ? loaderData.selectedDb : "";
            let _currentCollection: string = loaderData.selectedCollection ? loaderData.selectedCollection : "";
            setCurrent({
                db: _currentDb,
                collection: _currentCollection,
            });
        }
    }, [loaderData.selectedDb]);

    let collectionsElms: ReactElement[] = [];
    if (loaderData) {
        const databases = Object.keys(loaderData.collections);
        databases.sort((a: string, b: string) => {
            return a > b ? 1 : -1;
        });
        collectionsElms = databases.map((database, indexDb: number) => {
            const collections = loaderData.collections[database].sort((a: MongoDbCollection, b: MongoDbCollection) => {
                return a.name > b.name ? 1 : -1;
            });

            return (
                <TreeNode
                    active={database == current.db}
                    isExpanded={database == current.db}
                    onSelect={() => {
                        setCurrent({
                            db: database,
                            collection: "",
                        });
                        navigate(`/database/${database}`);
                    }}
                    key={database}
                    label={database}
                    onToggle={(e, node) => {
                        const isExpanded = node?.isExpanded;
                        setCurrent(
                            isExpanded
                                ? {
                                      db: database,
                                      collection: "",
                                  }
                                : {
                                      db: "",
                                      collection: "",
                                  }
                        );
                        console.log("Toggle", node);
                    }}
                    tabIndex={0}>
                    {collections.map((collection: MongoDbCollection, indexCol: number) => {
                        return (
                            <TreeNode
                                active={database == current.db && collection.name == current.collection}
                                onSelect={() => {
                                    setCurrent({
                                        db: database,
                                        collection: collection.name,
                                    });
                                    navigate(`/database/${database}/${collection.name}`);
                                }}
                                icon={<DatabaseIcon />}
                                key={`${database}-${collection.name}`}
                                label={collection.name}
                                onToggle={(e, node) => {
                                    setCurrent({
                                        db: database,
                                        collection: collection.name,
                                    });
                                    console.log("Toggle", node);
                                }}
                            />
                        );
                    })}
                </TreeNode>
            );
        });
    }

    const onCreateDatabase = () => {
        setIsCreateDatabase(true);
    };
    const { pathname } = useLocation();

    const treeView = (
        <>
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-100">
                <span className="block text-xs uppercase opacity-50">Databases</span>
                <Link className="text-xs uppercase opacity-50 hover:underline hover:opacity-100" to={"/database"}>
                    <EyeIcon />
                </Link>
            </div>
            <TreeView size="sm" multiselect={false} hideLabel={true} label={"Databases"} aria-expanded={true} className="bg-neutral-100">
                {collectionsElms}
            </TreeView>
        </>
    );

    return (
        <>
            <SidebarProvider defaultOpen={true} open={isSideNavExpanded}>
                <Sidebar>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <div className="flex justify-between mb-4">
                                    <HeaderMenuItem as={"div"} className="flex items-center mr-4">
                                        <SwitchConnection current={loaderData.connection} connections={loaderData.connections} />
                                    </HeaderMenuItem>
                                    <HeaderNavigation aria-label="New Database">
                                        <HeaderMenuItem variant="outline" icon={<PlusIcon />} onClick={onCreateDatabase}>
                                            New Database
                                        </HeaderMenuItem>
                                    </HeaderNavigation>
                                </div>
                                <div className="relative top-0 left-0 w-full h-full overflow-auto">{treeView}</div>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
                <div className="relative w-full overflow-hidden transition">
                    <Header className="z-50 bg-white shadow" aria-label="Header">
                        <SkipToContent />
                        <HeaderActions>
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
                            <HeaderNavigation aria-label="Connections">
                                <HeaderMenuItem as={"div"} className="flex items-center mr-4">
                                    <SwitchConnection current={loaderData.connection} connections={loaderData.connections} />
                                </HeaderMenuItem>
                            </HeaderNavigation>
                            <HeaderNavigation aria-label="New Database">
                                <HeaderMenuItem onClick={onCreateDatabase}>New Database</HeaderMenuItem>
                            </HeaderNavigation>
                        </HeaderActions>
                        <HeaderActions>
                            <GithubButton repo="n-for-all/mongocarbon" version={packageJson.version} title={"MongoCarbon"} />
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

                    <div className="h-screen overflow-auto">
                        <div className="pt-12 pb-12 pl-0 pr-0">
                            <div className="h-full pt-5 mr-0 ">
                                <div className="px-4 lg:px-8">
                                    <Outlet key={pathname + "-content"} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Footer />
                </div>
            </SidebarProvider>
            <DatabaseAddModal
                open={isCreateDatabase}
                onClose={() => {
                    setIsCreateDatabase(false);
                }}
                onSuccess={(dbName, collectionName) => {
                    setIsCreateDatabase(false);
                    navigate(`/database/${dbName}/${collectionName}`, { replace: true });
                }}
            />
        </>
    );
}
