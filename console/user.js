import { Command } from "commander";
import { PrismaClient, Prisma } from "@prisma/client";

import bcrypt from "bcryptjs";
import validator from "validator";
import packageJson from "../package.json" assert { type: "json" };

const program = new Command();
program.version(packageJson.version);

program
	.command("user")
	.description("Manage Users")
	.option("-d, --delete", "delete user")
	.option("-c, --create", "create user")
	.option("-u, --username <char>", "Username")
	.option("-p, --password <char>", "Password")
	.action((options) => {
		const client = new PrismaClient();
		const { isStrongPassword, isEmail } = validator;

		if (!options.username || !isEmail(options.username)) {
			console.error("Username must be a valid email address: ", options.username);
			return;
		}

		if (options.delete) {
			client.user
				.delete({ where: { username: options.username } })
				.then(() => {
					console.log("User deleted successfully");
				})
				.catch((error) => {
					console.error("User not found");
				});
			return;
		}

		if (
			!options.password ||
			!isStrongPassword(options.password, {
				minLength: 6,
			})
		) {
			console.error("Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character");
			return;
		}

		client.user
			.create({ data: { username: options.username, passwordHash: bcrypt.hashSync(options.password, 10) } })
			.then(() => {
				console.log("User created successfully");
			})
			.catch((error) => {
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					if (error.code === "P2002") {
						console.error("This user already exists, Please create a user with different username");
					}
				}
			});
	});

program.parse();
