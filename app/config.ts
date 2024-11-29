import * as dotenv from "dotenv";
import { Config } from "./types";
import path from "node:path";
const envPath = path.join(appRoot.toString(), ".env");
import appRoot from "app-root-path";

dotenv.config({ path: envPath });

function getBoolean(str, defaultValue = false) {
	return str ? str.toLowerCase() === "true" : defaultValue;
}

const config: Config = {
	options: {
		gridFSEnabled: getBoolean(process.env.GRIDFS_ENABLED, true),
	},
};
export default config;
