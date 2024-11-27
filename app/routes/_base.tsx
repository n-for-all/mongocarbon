import { HeaderGlobalBar, HeaderGlobalAction, HeaderName, HeaderMenuButton, HeaderContainer, Header, SkipToContent, Layer } from "@carbon/react";
import { UserAvatar, Logout, Connect, Edit } from "@carbon/icons-react";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Footer } from "~/components/footer";
import { requireUser } from "~/utils/session.server";
import { Link, redirect } from "@remix-run/react";
import { Logo } from "~/components/logo";

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
	return (
		<>
			<Header aria-label="">
				<SkipToContent />
				<HeaderName as={Link} to="/" prefix="">
					<Logo className={"h-5"} />
				</HeaderName>
				<HeaderGlobalBar>
					<HeaderGlobalAction aria-label="User Profile">
						<Link to="/profile">
							<UserAvatar size={20} />
						</Link>
					</HeaderGlobalAction>

					<HeaderGlobalAction aria-label="Logout">
						<Link to={"/logout"}>
							<Logout size={20} />
						</Link>
					</HeaderGlobalAction>
				</HeaderGlobalBar>
			</Header>
			<Layer level={1} className="flex flex-col h-screen overflow-auto bg-neutral-100">
				<div className="flex flex-col items-start justify-start flex-1 w-full mx-auto">
					<Outlet />
				</div>
				<Footer />
			</Layer>
		</>
	);
}
