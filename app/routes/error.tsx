import { useLoaderData } from "@remix-run/react";
import { Link, redirect } from "@remix-run/react";

import {
	Header,
	HeaderContainer,
	HeaderMenu,
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
	Button,
	//  SideNavLink,
	//  SideNavMenu,
	//  SideNavMenuItem
} from "@carbon/react";
import { Logout, DataTable, UserAvatar, ArrowRight } from "@carbon/icons-react";
import { LoaderFunction } from "@remix-run/node";
import { getUserDbConnections, getUserSession, requireUser, User } from "~/utils/session.server";
import db, { ConnectionData } from "~/lib/db";
import config from "~/config";
import { colsToGrid } from "~/utils/functions";
import { ReactElement, useState } from "react";
import { Footer } from "~/components/footer";
import { SwitchConnection } from "~/components/connection";
import { DbConnection } from "@prisma/client";
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
					onClick={() => {
						setIsSideNavExpanded(!isSideNavExpanded);
					}}
					isActive={isSideNavExpanded}
				/>
				<HeaderName as={Link} to="/" prefix="">
					<Logo className={"h-5"} />
				</HeaderName>
				<HeaderGlobalBar>
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
			</Header>

			<div className="h-screen pt-12">
				<Grid className="max-w-xl pl-0 pr-0" fullWidth>
					<Column lg={13} md={8} sm={4} className="h-full pt-5 mr-0 overflow-auto">
						<div className="p-4 border border-red-300 border-solid">
							<h2 className="mb-5 text-2xl font-bold text-red-600">Error</h2>
							<p className="mb-4">{loaderData?.message}</p>
							<div className="flex flex-wrap items-center gap-2">
								<Button size="sm" kind="secondary" as={Link} to="/" renderIcon={ArrowRight}>
									Dashboard
								</Button>
								<Button size="sm" kind="tertiary" as={Link} to="/connections" renderIcon={ArrowRight}>
									Connections
								</Button>
							</div>
						</div>
					</Column>
				</Grid>
			</div>
			<Footer />
		</>
	);
}
