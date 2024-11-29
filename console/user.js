import { Command } from "commander";
import { PrismaClient, Prisma } from "@prisma/client";

import bcrypt from "bcryptjs";
import validator from "validator";
import packageJson from "../package.json" assert { type: "json" };
import appRoot from "app-root-path";
import * as dotenv from "dotenv";
import { join } from "path";
import chalk from "chalk";

const envPath = join(appRoot.toString(), ".env");
dotenv.config({ path: envPath });

const program = new Command();
program.version(packageJson.version);

const isUsername = (username) => {
	if (validator.isEmpty(username) || username.length <= 3) {
		return false;
	} else if (!validator.matches(username, "^[a-zA-Z0-9_.-]*$")) {
		return false;
	}
	return true;
};

program
	.command("user")
	.description("Manage Users")
	.option("-d, --delete", "delete user")
	.option("-c, --create", "create user")
	.option("-u, --username <char>", "Username")
	.option("-p, --password <char>", "Password")
	.action((options) => {
		const client = new PrismaClient();
		const { isStrongPassword } = validator;

		if (!options.username || !isUsername(options.username)) {
			console.log(chalk.red("Usernames must be at least 3 characters long and no spaces included: "), chalk.red(options.username));
			return;
		}

		if (options.delete) {
			client.user
				.delete({ where: { username: options.username } })
				.then(() => {
					console.log(chalk.bgGreen("User deleted successfully"));
				})
				.catch((error) => {
					console.error(chalk.red("User not found"));
				});
			return;
		}

		if (
			!options.password ||
			!isStrongPassword(options.password, {
				minLength: 6,
			})
		) {
			console.log(
				chalk.red("Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character")
			);
			return;
		}

		client.user
			.create({ data: { username: options.username, passwordHash: bcrypt.hashSync(options.password, 10) } })
			.then(() => {
				console.log(chalk.bgGreen("User created successfully"));
			})
			.catch((error) => {
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					if (error.code === "P2002") {
						console.error(chalk.red("This user already exists, Please create a user with different username"));
						return;
					}
				}
				console.log(chalk.red(error.message));
				console.error(error);
			});
	});

program.parse();
