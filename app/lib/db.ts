import mongodb, { MongoClientOptions } from "mongodb";
import { Config, UserConnection } from "~/types";

interface ConnectionInfo {
	connectionName: string;
	client: mongodb.MongoClient;
	adminDb: mongodb.Admin | null;
	info: {
		whitelist: string[];
		blacklist: string[];
	};
}

class MongoDbConnection {
	mainClient?: ConnectionInfo;
	config: UserConnection;
	constructor(config: UserConnection) {
		this.config = config;
	}

	init = async () => {
		const { connectionString, name } = this.config;
		const options: MongoClientOptions = {
			maxPoolSize: this.config.maxPoolSize,
			tls: this.config.tls,
			tlsAllowInvalidCertificates: this.config.tlsAllowInvalidCertificates,
			tlsCAFile: this.config.tlsCAFile,
			tlsCertificateKeyFile: this.config.tlsCertificateKeyFile,
			tlsCertificateKeyFilePassword: this.config.tlsCertificateKeyFilePassword,
		};
		try {
			const client = await mongodb.MongoClient.connect(connectionString, options);
			const adminDb = client.db().admin();
			this.mainClient = {
				connectionName: name,
				client,
				adminDb,
				info: {
					whitelist: this.config.whitelist.trim().split(",").filter(Boolean),
					blacklist: this.config.blacklist.trim().split(",").filter(Boolean),
				},
			};
		} catch (error) {
			console.error(`Could not connect to database using connectionString: ${connectionString.replace(/(mongo.*?:\/\/.*?:).*?@/, "$1****@")}"`);
			throw error;
		}
	};

	getClient(): mongodb.MongoClient | undefined {
		return this.mainClient?.client;
	}

	getCollections = async ({ dbName }) => {
		const collections = await this.mainClient?.client.db(dbName).listCollections().toArray();
		return collections;
	};

	getDatabasesWithDetails = async (): Promise<mongodb.ListDatabasesResult> => {
		if (!this.mainClient?.adminDb) {
			return {
				databases: [],
				ok: 0,
			};
		}
		return await this.mainClient?.adminDb.listDatabases();
	};
	getDatabases = async () => {
		const databases: string[] = [];
		if (this.mainClient?.adminDb) {
			const whitelist = this.mainClient?.info.whitelist;
			const blacklist = this.mainClient?.info.blacklist;
			const allDbs = await this.mainClient.adminDb.listDatabases();

			for (let i = 0; i < allDbs.databases.length; ++i) {
				const dbName = allDbs.databases[i].name;
				if (dbName) {
					if (whitelist.length > 0 && !whitelist.includes(dbName)) {
						continue;
					}

					if (blacklist.length > 0 && blacklist.includes(dbName)) {
						continue;
					}

					databases.push(dbName);
				}
			}
		} else {
			const dbConnection = this.mainClient?.client.db();
			const dbName = dbConnection?.databaseName;
			if (dbName) {
				databases.push(dbName);
			}
		}
		return databases;
	};
}

const connect = async (config: UserConnection): Promise<ConnectionData> => {
	const connectionData = new MongoDbConnection(config);
	await connectionData.init();

	return connectionData;
};

export type ConnectionData = MongoDbConnection;

export default connect;
