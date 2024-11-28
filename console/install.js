import fs from "fs";
import { randomBytes } from "crypto";
import { join } from "path";
import { Command } from "commander";

import packageJson from "../package.json" assert { type: "json" };

const program = new Command();
program.version(packageJson.version);

program.description("Install").action((options) => {
	const sessionSecret = randomBytes(32).toString("hex");
	const envPath = join(process.cwd(), ".env");

	try {
        
        let update = [];
		let envContent = "";
		if (fs.existsSync(envPath)) {
			envContent = fs.readFileSync(envPath, "utf8");
		}

		if (!envContent.includes("DATABASE_URL")) {
            update.push("DATABASE_URL");
			envContent += `\nDATABASE_URL="file:./db.db"\n`;
		}

		if (!envContent.includes("SESSION_SECRET")) {
            update.push("SESSION_SECRET");
			envContent += `\nSESSION_SECRET=${sessionSecret}\n`;
		}

		if (!envContent.includes("IBM_TELEMETRY_DISABLED")) {
            update.push("IBM_TELEMETRY_DISABLED");
			envContent += `\nIBM_TELEMETRY_DISABLED='true'\n`;
		}
		if (update.length > 0) {
			fs.writeFileSync(envPath, envContent);
			console.log(update.join(' and ') + " have been generated and appended to .env file.");
		} else {
			console.log("DATABASE_URL and SESSION_SECRET already exists in the .env file.");
		}
	} catch (err) {
		console.log(err);
	}
});

program.parse();
