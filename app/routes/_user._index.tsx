import { Table, Grid, Column, TableRow, TableCell, TableBody, TableContainer } from "@carbon/react";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useMatches } from "@remix-run/react";
import { Admin, Document } from "mongodb";
import db, { ConnectionData } from "~/lib/db";
import { getUserSession } from "~/utils/session.server";


export const loader: LoaderFunction = async ({ request }) => {
    const session = await getUserSession(request);
	const connection = session.get("connection");

	let mongo: ConnectionData;

	try {
		mongo = await db(connection);
	} catch (error) {
		return Response.json({ status: "error", message: "Could not connect to MongoDB" }, { status: 500 });
	}

	const adminDb = mongo.mainClient?.adminDb || undefined;
	const info: Document = await (adminDb as Admin).serverStatus();



	return Response.json(
		{ info, versions: process.versions },
		{
			headers: {
				"Cache-Control": "no-store",
			},
		}
	);
};

export default function Dashboard() {
	const loaderData = useLoaderData<typeof loader>();
    const info = loaderData?.info;
	const versions = loaderData?.versions;

	return (
		<Grid className="dashboard-page" fullWidth>
			<Column lg={13} md={8} sm={4}>
				<Grid>
					<Column lg={16} md={8} sm={4}>
						<div className="pb-4">
							<h4 className="text-xl font-medium">Server Information</h4>
							<p className="text-sm">Version: {info.version}</p>
						</div>
						<div className="flex flex-col pb-4 lg:flex-row">
							<div className="flex-1 w-full">
								<Table size="lg" useZebraStyles={false}>
									<TableBody>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Hostname</TableCell>
											<TableCell className="px-4 py-2">{info.host}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Uptime</TableCell>
											<TableCell className="px-4 py-2">
												{info.uptime} seconds {info.uptime > 86400 ? `(${Math.floor(info.uptime / 86400)} days)` : null}
											</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Server Time</TableCell>
											<TableCell className="px-4 py-2">{info.localTime}</TableCell>
										</TableRow>
									</TableBody>
								</Table>
								<Table size="lg" useZebraStyles={false} className="flex-1 w-full mt-4">
									<TableBody>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Current Connections</TableCell>
											<TableCell className="px-4 py-2">{info.connections.current}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Active Clients</TableCell>
											<TableCell className="px-4 py-2">{info.globalLock.activeClients.total}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Clients Reading</TableCell>
											<TableCell className="px-4 py-2">{info.globalLock.activeClients.readers}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Read Lock Queue</TableCell>
											<TableCell className="px-4 py-2">{info.globalLock.currentQueue.readers}</TableCell>
										</TableRow>
									</TableBody>
								</Table>
								<Table size="lg" useZebraStyles={false} className="flex-1 w-full mt-4">
									<TableBody>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Disk Flushes</TableCell>
											<TableCell className="px-4 py-2">{info.backgroundFlushing ? info.backgroundFlushing.flushes : "N/A"}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Time Spent Flushing</TableCell>
											<TableCell className="px-4 py-2">{info.backgroundFlushing ? `${info.backgroundFlushing.total_ms} ms` : "N/A"}</TableCell>
										</TableRow>
									</TableBody>
								</Table>
								<Table size="lg" useZebraStyles={false} className="flex-1 w-full mt-4">
									<TableBody>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Total Inserts</TableCell>
											<TableCell className="px-4 py-2">{info.opcounters.insert}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Total Updates</TableCell>
											<TableCell className="px-4 py-2">{info.opcounters.update}</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</div>
							<div className="flex-1 w-full">
								<Table size="lg" useZebraStyles={false} className="flex-1 w-full">
									<TableBody>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">MongoDB Version</TableCell>
											<TableCell className="px-4 py-2">{info.version}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Node Version</TableCell>
											<TableCell className="px-4 py-2">{versions.node}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">V8 Version</TableCell>
											<TableCell className="px-4 py-2">{versions.v8}</TableCell>
										</TableRow>
									</TableBody>
								</Table>
								<Table size="lg" useZebraStyles={false} className="flex-1 w-full mt-4">
									<TableBody>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Available Connections</TableCell>
											<TableCell className="px-4 py-2">{info.connections.available}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Queued Operations</TableCell>
											<TableCell className="px-4 py-2">{info.globalLock.currentQueue.total}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Clients Writing</TableCell>
											<TableCell className="px-4 py-2">{info.globalLock.activeClients.writers}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Write Lock Queue</TableCell>
											<TableCell className="px-4 py-2">{info.globalLock.currentQueue.writers}</TableCell>
										</TableRow>
									</TableBody>
								</Table>
								<Table size="lg" useZebraStyles={false} className="flex-1 w-full mt-4">
									<TableBody>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Last Flush</TableCell>
											<TableCell className="px-4 py-2">{info.backgroundFlushing ? info.backgroundFlushing.last_finished : "N/A"}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Average Flush Time</TableCell>
											<TableCell className="px-4 py-2">{info.backgroundFlushing ? `${info.backgroundFlushing.average_ms} ms` : "N/A"}</TableCell>
										</TableRow>
									</TableBody>
								</Table>
								<Table size="lg" useZebraStyles={false} className="flex-1 w-full mt-4">
									<TableBody>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Total Queries</TableCell>
											<TableCell className="px-4 py-2">{info.opcounters.query}</TableCell>
										</TableRow>
										<TableRow className="border-b">
											<TableCell className="px-4 py-2 font-semibold">Total Deletes</TableCell>
											<TableCell className="px-4 py-2">{info.opcounters.delete}</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</div>
						</div>
					</Column>
				</Grid>
			</Column>
		</Grid>
	);
}
