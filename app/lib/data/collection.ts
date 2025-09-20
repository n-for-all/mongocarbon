import { Binary, BSON, Collection as MongoCollection, Document, Db, Sort, SortDirection, DeleteResult, InsertManyResult } from "mongodb";
import { Config } from "../../types";
import { ConnectionData } from "../db.js";
import { bytesToSize, roughSizeOfObject, isValidCollectionName } from "~/utils/functions.js";
import { parseObjectId, toJsonString, bsonToString, toBSON, parseEJSON } from "~/utils/functions.server";

const ALLOWED_MIME_TYPES = new Set(["text/csv", "application/json"]);

const converters = {
    // If type == J, convert value as json document
    J(value: string) {
        return JSON.parse(value);
    },
    // If type == N, convert value to number
    N(value: string) {
        return Number(value);
    },
    // If type == O, convert value to ObjectId
    O(value: string | number) {
        return parseObjectId(value);
    },
    // If type == R, convert to RegExp
    R(value: string) {
        return new RegExp(value, "i");
    },
    U(value: string) {
        return new Binary(Buffer.from(value.replaceAll("-", ""), "hex"), Binary.SUBTYPE_UUID);
    },
    // if type == S, no conversion done
    S(value: string) {
        return value;
    },
};

export class Collection {
    allowDiskUse: boolean;
    config: Config;
    collection: MongoCollection<Document> | undefined;
    collectionName: string;
    db: Db | undefined;
    constructor(connectionData: ConnectionData, dbName: string, collectionName: string, config: Config, allowDiskUse = true) {
        this.config = config;
        this.allowDiskUse = allowDiskUse;
        this.db = connectionData.getClient()?.db(dbName);
        this.collection = connectionData.getClient()?.db(dbName).collection(collectionName);
        this.collectionName = collectionName;
    }
    /*
     * Builds the Mongo query corresponding to the
     * Simple/Advanced parameters input.
     * Returns {} if no query parameters were passed in request.
     */
    _getQuery = (query: { [x: string]: any }) => {
        const { key } = query;
        let { value } = query;
        if (key && value) {
            // if it is a simple query

            // 1. fist convert value to its actual type
            const type = query.type?.toUpperCase();
            if (!(type in converters)) {
                throw new Error("Invalid query type: " + type);
            }
            value = converters[type](value);

            // 2. then set query to it
            return { [key]: value };
        }
        const { query: jsonQuery } = query;
        return jsonQuery || {};
    };
    _getSort = (query: { [x: string]: any }) => {
        const { sort } = query;
        if (sort) {
            const outSort: Sort = {};
            for (const i in sort) {
                outSort[i] = Number.parseInt(sort[i], 10) as SortDirection;
            }
            return outSort;
        }
        return {};
    };
    _getProjection = (query: { [x: string]: any }) => {
        const { projection } = query;
        if (projection) {
            return toBSON(projection) ?? {};
        }
        return {};
    };
    _getQueryOptions = (query: { [x: string]: any }) => {
        return {
            sort: this._getSort(query),
            limit: Number.parseInt(query.limit, 10) || 10,
            skip: query.skip ? Number.parseInt(query.skip, 10) || 0 : 0,
            projection: this._getProjection(query),
        };
    };
    _getAggregatePipeline = (pipeline, queryOptions) => {
        // https://stackoverflow.com/a/48307554/10413113
        return [
            ...pipeline,
            ...(Object.keys(queryOptions.sort).length > 0
                ? [
                      {
                          $sort: queryOptions.sort,
                      },
                  ]
                : []),
            {
                $facet: {
                    count: [{ $count: "count" }],
                    items: [
                        { $skip: queryOptions.skip },
                        { $limit: queryOptions.limit + queryOptions.skip },
                        ...(Object.keys(queryOptions.projection).length > 0
                            ? [
                                  {
                                      $project: queryOptions.projection,
                                  },
                              ]
                            : []),
                    ],
                },
            },
        ];
    };
    _getItemsAndCount = async (itemQuery, queryOptions) => {
        let query = this._getQuery(itemQuery);
        if (itemQuery.runAggregate === "on" && query.constructor.name === "Array") {
            if (query.length > 0) {
                const queryAggregate = this._getAggregatePipeline(query, queryOptions);
                const [resultArray] = await this.collection!.aggregate(queryAggregate, { allowDiskUse: this.allowDiskUse }).toArray();
                const { items, count } = resultArray;
                return {
                    items,
                    count: count.at(0)?.count,
                };
            }
            query = {};
        }

        const [items, count] = await Promise.all([
            this.collection!.find(query, { ...queryOptions, allowDiskUse: this.allowDiskUse }).toArray(),
            this.collection!.countDocuments(query),
        ]);

        return {
            items,
            count,
        };
    };
    viewCollection = async (query: { [x: string]: any }) => {
        const queryOptions = this._getQueryOptions(query);
        const { items, count } = await this._getItemsAndCount(query, queryOptions);

        const [stats, indexes] = await Promise.all([
            this.collection!.aggregate([
                {
                    $collStats: {
                        latencyStats: { histograms: true },
                        storageStats: {},
                        count: {},
                        queryExecStats: {},
                    },
                },
            ]).next(),
            this.collection!.indexes(),
        ]);

        const { indexSizes } = stats?.storageStats;
        for (let n = 0, nn = indexes.length; n < nn; n++) {
            if (indexes[n].name) {
                indexes[n].size = indexSizes[indexes[n].name as string];
            }
        }

        const docs = [];
        const columns: Array<string[]> = [];

        for (const i in items) {
            docs[i] = items[i];
            columns.push(Object.keys(items[i]));
        }

        // Pagination
        const { limit, skip, sort } = queryOptions;
        const pagination = count > limit;

        const ctx = {
            title: this.collectionName,
            docs,
            columns: columns.flat().filter((value, index, arr) => arr.indexOf(value) === index), // All used columns
            count,
            stats,
            limit,
            skip,
            sort,
            pagination,
            key: query.key,
            value: query.value,
            type: query.type,
            query: query.query,
            projection: query.projection,
            runAggregate: query.runAggregate === "on",
            indexes,
        };

        return ctx;
    };

    getDbCollection = () => {
        return this.collection;
    };

    // findDocuments = async (query: { [x: string]: any }) => {
    // 	const queryOptions = this._getQueryOptions(query);
    // 	this._getItemsAndCount(query, queryOptions);

    // 	return await this.collection!.find(this._getQuery(query), queryOptions).toArray();
    // };

    getColumns = async () => {
        const results = await this.collection!.aggregate([
            { $project: { keys: { $objectToArray: "$$ROOT" } } },
            { $unwind: "$keys" },
            { $group: { _id: null, allKeys: { $addToSet: "$keys.k" } } },
        ]).next();

        return results ? results.allKeys : [];
    };
    compactCollection = async () => {
        return await this.db!.command({ compact: this.collectionName });
    };

    exportCollection = async (documentQuery: { [x: string]: any }) => {
        const query = this._getQuery(documentQuery);
        const queryOptions = {
            sort: this._getSort(documentQuery),
            projection: this._getProjection(documentQuery),
        };
        return await this.collection!.find(query, queryOptions);
    };
    exportColArray = async (documentQuery: { [x: string]: any }) => {
        return new Promise((resolve, reject) => {
            try {
                const query = this._getQuery(documentQuery);
                const queryOptions = {
                    sort: this._getSort(documentQuery),
                    projection: this._getProjection(documentQuery),
                };
                this.collection!.find(query, queryOptions)
                    .toArray()
                    .then((items) => {
                        resolve(toJsonString(items));
                    });
            } catch (error) {
                reject(error);
            }
        });
    };
    exportCsv = async (documentQuery: { [x: string]: any }) => {
        return this.exportColArray(documentQuery);
    };

    reIndex = async () => {
        return new Promise((resolve, reject) => {
            //@ts-ignore
            if (typeof this.collection!.reIndex === "function") {
                //@ts-ignore
                this.collection!.reIndex()
                    .then(() => {
                        resolve(true);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            } else {
                reject(new Error("ReIndex is not supported on this version on mongodb"));
            }
        });
    };
    addIndex = async (index) => {
        const doc = index;

        if (doc === undefined || doc.length === 0) {
            throw new Error("Please enter a valid index!");
        }

        const docBSON = doc;

        return await this.collection!.createIndex(docBSON);
    };

    createCollection = async (collectionName: string) => {
        const valid = isValidCollectionName(collectionName);
        if (!valid) {
            throw new Error("Invalid collection name");
        }

        return await this.db!.createCollection(collectionName);
    };
    deleteCollection = async (): Promise<boolean> => {
        return await this.collection!.drop();
    };
    deleteDocuments = async (documentQuery: { [x: string]: any }): Promise<DeleteResult> => {
        const query = this._getQuery(documentQuery);
        return await this.collection!.deleteMany(query);
    };

    renameCollection = async (newName: string) => {
        const valid = isValidCollectionName(newName);
        if (!valid) {
            throw new Error("Invalid collection name");
        }

        return await this.collection!.rename(newName);
    };

    dropIndex = async (indexName: string | undefined): Promise<Document> => {
        if (!indexName) {
            throw new Error("The index you are deleting is invalid!");
        }
        return await this.collection!.dropIndex(indexName);
    };

    importCollection = async (files: Array<any>): Promise<InsertManyResult<BSON.Document>> => {
        const areInvalidFiles = files.some((file) => !ALLOWED_MIME_TYPES.has(file.mimetype) || !file.data || !file.data.toString);
        if (areInvalidFiles) {
            throw new Error("Some of the files are invalid, Importing is aborted");
        }

        const docs: Array<any> = [];

        for (const file of files) {
            const fileContent = file.data.toString("utf8");
            const lines = fileContent
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);
            for (const line of lines) {
                const parsedData = parseEJSON(line);
                docs.push(...parsedData);
            }
        }
        return await this.collection!.insertMany(docs);
    };

    async configureQueryAnalyzer(options: { mode: string; samplesPerSecond?: number }) {
        console.log("Calling function", "configureQueryAnalyzer", options);
        if (!options?.mode) {
            throw new Error("Mode is required");
        }

        const command: any = {
            configureQueryAnalyzer: this.collectionName,
            mode: options.mode, // e.g. "off", "slowOnly", "full"
        };
        if (options.samplesPerSecond !== undefined) {
            command.samplesPerSecond = options.samplesPerSecond;
        }

        return await this.db?.command(command);
    }

    async getShardDistribution() {
        // Runs aggregation with $shardedDataDistribution stage to get distribution stats
        const pipeline = [{ $shardedDataDistribution: {} }];
        const distribution = await this.collection!.aggregate(pipeline).toArray();
        return distribution;
    }

    async getShardVersion() {
        // The getShardVersion command requires the full namespace: "database.collection"
        const namespace = `${this.db!.databaseName}.${this.collectionName}`;

        const adminDb = this.db!.admin();
        const command = { getShardVersion: namespace };

        return await adminDb.command(command);
    }

    async stats() {
        const command = { collStats: this.collectionName };
        return await this.db!.command(command);
    }

    async totalIndexSize() {
        const command = { collStats: this.collectionName };
        const stats = await this.db!.command(command);
        return stats?.totalIndexSize || 0;
    }

    async totalSize() {
        const command = { collStats: this.collectionName };
        const stats = await this.db!.command(command);
        return stats?.totalSize || 0;
    }

    async validate(options: { full?: boolean; repair?: boolean; checkBSONConformance?: boolean }) {
        const command = {
            validate: this.collectionName,
            full: options.full || undefined,
            repair: options.repair || undefined,
            checkBSONConformance: options.checkBSONConformance || undefined,
        };
        return await this.db!.command(command);
    }

    async storageSize() {
        const command = { collStats: this.collectionName };
        const stats = await this.db!.command(command);
        return stats?.storageSize || 0;
    }

    async callFunction(functionName, ...args) {
        if (typeof this[functionName] === "function") {
            return this[functionName](...args);
        }
        if (this.collection && typeof this.collection[functionName] === "function") {
            return this.collection[functionName](...args);
        }
        throw new Error(`${functionName} is not a function`);
    }
}
