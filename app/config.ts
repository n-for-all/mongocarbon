import * as dotenv from "dotenv";
import { Config } from "./types";
import { fileURLToPath } from "node:url";
import path from "node:path";

dotenv.config();

function getBoolean(str, defaultValue = false) {
	return str ? str.toLowerCase() === "true" : defaultValue;
}

const config: Config = {
	site: {
		host: "localhost",
		port: process.env.PORT || 4321,
		requestSizeLimit: process.env.REQUEST_SIZE || "50mb",
		sslCert: process.env.SSL_CRT_PATH || "",
		sslEnabled: getBoolean(process.env.SSL_ENABLED, false),
		sslKey: process.env.SSL_KEY_PATH || "",
	},

	options: {
		gridFSEnabled: getBoolean(process.env.GRIDFS_ENABLED, true),
	},
	rootPath: path.dirname(fileURLToPath(import.meta.url)),
};
export default config;
