import type { LoaderFunctionArgs } from "@remix-run/node";
import path from "path";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const projectRoot = path.resolve();
    const jsonData = {
        workspace: {
            root: projectRoot,
            uuid: "mongocarbon",
        },
    };
    return Response.json(jsonData);
};
