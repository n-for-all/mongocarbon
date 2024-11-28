import fs from 'fs';
import { randomBytes } from "crypto";
import { join } from "path";
import { Command } from "commander";

import packageJson from "../package.json" assert { type: "json" };

const program = new Command();
program.version(packageJson.version);

program
	.command("secret")
	.description("Create Secret")
	.option("-s, --session", "For session")
	.action((options) => {
		// Generate a random session secret
		const sessionSecret = randomBytes(32).toString("hex");
		const envPath = join(process.cwd(), ".env");

		if (!options.session) {
			return console.error("Please specify an option example '-s'");
		}

		try {
            let envContent = ""
			if (fs.existsSync(envPath)) {
				envContent = fs.readFileSync(envPath, "utf8");
			}

			if (envContent.includes("SESSION_SECRET")) {
				console.log("SESSION_SECRET already exists in .env file.");
				return;
			}
			envContent += `\nSESSION_SECRET=${sessionSecret}\n`;
			fs.writeFileSync(envPath, envContent);
			console.log("SESSION_SECRET has been generated and appended to .env file.");
		} catch (err) {
			console.error("Error generating SESSION_SECRET:", err);
		}
	});

program.parse();
