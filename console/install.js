import fs from "fs";
import { randomBytes } from "crypto";
import { join } from "path";
import { Command } from "commander";
import appRoot from "app-root-path";
import * as dotenv from "dotenv";
import child_process from "child_process";
import chalk from "chalk";

import packageJson from "../package.json" assert { type: "json" };

const program = new Command();
program.version(packageJson.version);

program.description("Install").action((options) => {
	const sessionSecret = randomBytes(32).toString("hex");
	console.log(chalk.bgMagentaBright(chalk.bold("Installing MongoCarbon...")));
	console.log(chalk.bgGrey(chalk.bold("MongoCarbon:"), "Checking for .env file at: ", appRoot.toString()));
	console.log("");
	const envPath = join(appRoot.toString(), ".env");

	try {
		let update = [];
		let envContent = "";
		if (fs.existsSync(envPath)) {
			envContent = fs.readFileSync(envPath, "utf8");
		}

		if (!envContent.includes("DATABASE_URL")) {
			update.push("DATABASE_URL");
			envContent += `\nDATABASE_URL="file:${appRoot.toString()}/db.db"\n`;
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
			console.log(chalk.bgGreen(chalk.bold("MongoCarbon:"), update.join(" and ") + " have been generated and appended to .env file: ", appRoot.toString()));
		} else {
			console.log(chalk.bgYellowBright(chalk.bold("MongoCarbon:"), "DATABASE_URL and SESSION_SECRET already exists in the .env file at: ", appRoot.toString()));
		}

		dotenv.config({ path: envPath });
		console.log("");
		console.log(chalk.bgGrey(chalk.bold("MongoCarbon:"), "Installing prisma... "));
		console.log("");
		let output = child_process.spawnSync("prisma", ["generate", "--no-hints"], { stdio: "inherit" });
		if (output && output.error) {
			console.log(chalk.bgRed(output.error.message));
			console.log(output.error);
		}
		output = child_process.spawnSync("dotenv", ["-e", envPath, "--", "npx", "prisma", "migrate", "deploy"], { stdio: "inherit" });
		if (output && output.error) {
			console.log(chalk.bgRed(output.error));
			console.log(output.error);
		}
	} catch (err) {
		console.log(chalk.bgRed(err.message));
	}
});

program.parse();
