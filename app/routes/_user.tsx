import { Outlet, useLoaderData } from "@remix-run/react";
import { Link, redirect, useLocation } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";
import packageJson from "../../package.json";

import {
	Header,
	HeaderMenuButton,
	HeaderMenuItem,
	HeaderName,
	HeaderNavigation,
	HeaderGlobalBar,
	HeaderGlobalAction,
	SkipToContent,
	Grid,
	Column,
	TreeView,
	TreeNode,
	SideNav,
	SideNavItems,
	HeaderSideNavItems,
} from "@carbon/react";
import { Logout, DataTable, UserAvatar, DataView } from "@carbon/icons-react";
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

	const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);
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

	let indexTree: Array<string> = [];
	let collectionsElms: ReactElement[] = [];
	if (loaderData) {
		const databases = Object.keys(loaderData.collections);
		databases.sort((a: string, b: string) => {
			return a > b ? 1 : -1;
		});
		collectionsElms = databases.map((database, indexDb: number) => {
			if (database == current.db) {
				indexTree = [indexDb.toString()];
			}
			const collections = loaderData.collections[database].sort((a: MongoDbCollection, b: MongoDbCollection) => {
				return a.name > b.name ? 1 : -1;
			});

			return (
				<TreeNode
					isExpanded={database == current.db}
					onSelect={() => {
						setCurrent({
							db: database,
							collection: "",
						});
						navigate(`/database/${database}`);
					}}
					id={indexDb.toString()}
					key={database}
					label={database}
					tabIndex={0}>
					{collections.map((collection: MongoDbCollection, indexCol: number) => {
						if (database == current.db && collection.name == current.collection) {
							indexTree.push(indexCol.toString());
						}
						return (
							<TreeNode
								id={`${indexDb}-${indexCol}`}
								onSelect={() => {
									setCurrent({
										db: database,
										collection: collection.name,
									});
									navigate(`/database/${database}/${collection.name}`);
								}}
								renderIcon={DataTable}
								key={collection.name}
								label={collection.name}
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
			<div className="flex items-center justify-between px-4 py-2">
				<span className="block text-xs uppercase opacity-50">Databases</span>
				<Link className="text-xs uppercase opacity-50 hover:underline hover:opacity-100" to={"/database"}>
					<DataView />
				</Link>
			</div>
			<TreeView size="sm" multiselect={false} selected={[indexTree[0], indexTree.join("-")]} active={indexTree[0]} hideLabel={true} label={"Databases"} aria-expanded={true}>
				{collectionsElms}
			</TreeView>
		</>
	);
	return (
		<>
			<Header aria-label="">
				<SkipToContent />
				<HeaderMenuButton
					aria-label="Open menu"
					onClick={() => {
						setIsSideNavExpanded(!isSideNavExpanded);
					}}
					isActive={isSideNavExpanded}
				/>
				<HeaderName as={Link} to="/" prefix="">
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
				<HeaderGlobalBar>
					<GithubButton repo="n-for-all/mongocarbon" version={packageJson.version} title={"MongoCarbon"} />
					<Link to="/profile">
						<HeaderGlobalAction aria-label="User Profile">
							<UserAvatar size={20} />
						</HeaderGlobalAction>
					</Link>
					<HeaderGlobalAction aria-label="Logout">
						<Link to={"/logout"}>
							<Logout size={20} />
						</Link>
					</HeaderGlobalAction>
				</HeaderGlobalBar>
				<SideNav
					aria-label="Side navigation"
					expanded={isSideNavExpanded}
					isPersistent={false}
					onSideNavBlur={() => {
						setIsSideNavExpanded(false);
					}}>
					<SideNavItems>
						<HeaderSideNavItems>
							<HeaderMenuItem as={"div"} className="flex items-center mr-4">
								<SwitchConnection current={loaderData.connection} connections={loaderData.connections} />
							</HeaderMenuItem>
							<HeaderNavigation aria-label="New Database">
								<HeaderMenuItem onClick={onCreateDatabase}>New Database</HeaderMenuItem>
							</HeaderNavigation>
							<div className="relative top-0 left-0 w-full h-full overflow-auto">{treeView}</div>
						</HeaderSideNavItems>
					</SideNavItems>
				</SideNav>
			</Header>

			<div className="h-screen pt-12">
				<Grid className="h-full pl-0 pr-0" fullWidth>
					{!isSideNavExpanded && (
						<Column lg={3} md={8} sm={4} className="relative h-full ml-0 border-r border-solid border-neutral-100">
							<div className="absolute top-0 left-0 w-full h-full overflow-auto">{treeView}</div>
						</Column>
					)}
					<Column lg={13} md={8} sm={4} className="h-full pt-5 mr-0 overflow-auto">
						<div className="pr-4 lg:pr-8">
							<Outlet key={pathname + "-content"} />
						</div>
					</Column>
				</Grid>
			</div>
			<Footer />
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
