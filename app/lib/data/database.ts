import { Config } from "~/types";
import { ConnectionData } from "../db.js";
import { Collection, IndexDescriptionInfo } from "mongodb";
import { convertMongoTimestamp } from "~/utils/functions.server";
import { bytesToSize, isValidDatabaseName } from "~/utils/functions";

export class Database {
	config: Config;
	connectionData: ConnectionData;
	constructor(connectionData: ConnectionData, config: Config) {
		this.config = config;
		this.connectionData = connectionData;
	}

	getStats = async (dbOName: string) => {
		const listDatabases = await this.connectionData.getDatabases();
		let dbName = "";
		let found = listDatabases.some((db) => {
			if (dbOName == db) {
				dbName = db;
				return true;
			}
		});

		if (!found) {
			throw new Error("Database not found");
		}

		const data = await this.connectionData.getClient()?.db(dbName).stats();
		const collections = await this.connectionData.getClient()?.db(dbName).collections();
		if (data) {
			let collectionList: Array<{
				name: string;
				count: number;
				indexes: IndexDescriptionInfo[];
				storageSize?: number;
			}> = [];
			if (collections) {
				const collectionListStats = await Promise.allSettled(
					collections.map((c: Collection) => {
						return Promise.allSettled([
							Promise.resolve(c),
							c
								.aggregate([
									{
										$collStats: {
											latencyStats: { histograms: true },
											storageStats: {},
											count: {},
											queryExecStats: {},
										},
									},
								])
								.next(),
							c.indexes(),
							c.countDocuments(),
						]);
					})
				);
				collectionList = collectionListStats.map((result) => {
					if (result.status == "fulfilled") {
						const [col, stats, indexes, count] = result.value;
						return {
							name: col.status == "fulfilled" ? col.value.collectionName : "N/A",
							count: count.status == "fulfilled" ? count.value : 0,
							indexes: indexes.status == "fulfilled" ? indexes.value : [],
							stats: stats.status == "fulfilled" ? stats.value : undefined,
						};
					} else {
						return {
							name: "N/A",
							count: 0,
							indexes: [],
							storageSize: undefined,
						};
					}
				});
			}

			return {
				name: data.db,
				fsUsedSize: data.fsUsedSize,
				fsTotalSize: data.fsTotalSize,
				operationTime: convertMongoTimestamp(data.operationTime),
				clusterTime: convertMongoTimestamp(data.$clusterTime?.clusterTime),
				views: data.views,
				avgObjSize: bytesToSize(data.avgObjSize || 0),
				collections: data.collections,
				collectionList: collectionList,
				dataFileVersion:
					data.dataFileVersion && data.dataFileVersion.major && data.dataFileVersion.minor ? data.dataFileVersion.major + "." + data.dataFileVersion.minor : null,
				dataSize: bytesToSize(data.dataSize),
				extentFreeListNum: data.extentFreeList && data.extentFreeList.num ? data.extentFreeList.num : null,
				fileSize: data.fileSize === undefined ? null : bytesToSize(data.fileSize),
				indexes: data.indexes,
				indexSize: bytesToSize(data.indexSize),
				numExtents: data.numExtents ? data.numExtents.toString() : null,
				objects: data.objects,
				storageSize: bytesToSize(data.storageSize),
			};
		}
		return null;
	};

	createDatabase = async (dbName: string, collectionName: string) => {
		if (!isValidDatabaseName(dbName)) {
			return Promise.reject(new Error(`The database name "${dbName} is invalid`));
		}
		const ndb = this.connectionData.getClient()?.db(dbName);

		return await ndb?.createCollection(collectionName);
	};

	deleteDatabase = async (dbName: string) => {
		const ndb = this.connectionData.getClient()?.db(dbName);
		return await ndb?.dropDatabase();
	};
}
