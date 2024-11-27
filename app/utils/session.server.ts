import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect, TypedResponse } from "@remix-run/node";
import { userDb } from "./db.server";
import type { DbConnection, User as PrismaUser } from "@prisma/client";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
	throw new Error("SESSION_SECRET must be set");
}

export type User = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	firstName: string;
	newsletter: boolean;
};

function cleanupUser<TResult = User, TUser extends Partial<PrismaUser> = PrismaUser>(user: TUser): TResult {
	return {
		id: user.id,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		username: user.username,
	} as unknown as TResult;
}

export async function requireUser(request: Request): Promise<User | null>;
/**
 * @throws Will throw a redirect response if the user is not avaliable
 */
export async function requireUser(request: Request, redirectToIfNotAvaliable: string): Promise<User>;
export async function requireUser(request: Request, redirectToIfNotAvaliable?: string): Promise<User | null> {
	const userId = await requireUserId(request, redirectToIfNotAvaliable as never);

	if (!userId) {
		return null;
	}

	const user = await userDb.user.findUnique({ where: { id: userId } });

	if (!user) {
		return null;
	}

	return cleanupUser(user);
}

export async function getUserDbConnection(userId, id) {
	return await userDb.dbConnection.findUnique({ where: { userId, id } });
}
export async function getUserDbConnections(userId) {
	return await userDb.dbConnection.findMany({ where: { userId } });
}

export async function updatePassword(userId, password) {
	const passwordHash = await bcrypt.hash(password, 10);
	return await userDb.user.update({ where: { id: userId }, data: { passwordHash: passwordHash } });
}

export async function addUserDbConnection(userId, connection: Omit<DbConnection, "id" | "userId">) {
	return await userDb.dbConnection.create({
		data: {
			...connection,
			userId,
		},
	});
}

export async function removeUserDbConnection(userId, connectionId) {
	return await userDb.dbConnection.delete({ where: { userId, id: connectionId } });
}

export async function updateUserDbConnection(userId, connectionId, connection: Omit<DbConnection, "id" | "userId">) {
	return await userDb.dbConnection.update({
		where: { id: connectionId, userId },
		data: {
			...connection,
		},
	});
}

const storage = createCookieSessionStorage({
	cookie: {
		name: "mongocarbon_session",
		secure: process.env.NODE_ENV === "production",
		secrets: [sessionSecret],
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
		httpOnly: true,
	},
});

const commitSession = storage.commitSession;

export { commitSession };
export async function createUserSession(userId: string, redirectTo: string): Promise<TypedResponse<never>> {
	const session = await storage.getSession();
	session.set("userId", userId);
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await storage.commitSession(session),
		},
	});
}
export function getUserSession(request: Request) {
	return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	if (!userId || typeof userId !== "string") return null;
	return userId;
}

export async function getUser(request: Request) {
	const userId = await getUserId(request);
	if (typeof userId !== "string") {
		return null;
	}
	try {
		const user = await userDb.user.findUnique({
			where: { id: userId },
			select: { id: true, username: true },
		});
		return user;
	} catch {
		throw logout(request);
	}
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	if (!userId || typeof userId !== "string") {
		const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
		throw redirect(`/login?${searchParams}`);
	}
	return userId;
}

type LoginForm = {
	username: string;
	password: string;
};

export async function register({ username, password }: LoginForm) {
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await userDb.user.create({
		data: { username, passwordHash },
	});
	return { id: user.id, username };
}

export async function login({ username, password }: LoginForm) {
	const user = await userDb.user.findUnique({
		where: { username },
	});
	if (!user) return null;
	const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
	if (!isCorrectPassword) return null;
	return { id: user.id, username };
}

export async function logout(request: Request) {
	const session = await getUserSession(request);
	return redirect("/login", {
		headers: {
			"Set-Cookie": await storage.destroySession(session),
		},
	});
}
