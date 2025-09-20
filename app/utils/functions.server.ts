import parser from "mongodb-query-parser";
import { Timestamp } from "mongodb";
import { EJSON, ObjectId } from "bson";
import { Binary } from "mongodb";
import * as crypto from "crypto";
import jwt from "jsonwebtoken";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

export const convertMongoTimestamp = (timestamp: Timestamp | { $timestamp: string } | undefined) => {
    if (timestamp instanceof Timestamp) {
        return new Date(timestamp.t * 1000);
    }
    if (timestamp && timestamp.$timestamp) {
        const seconds = parseInt(timestamp.$timestamp.substring(0, 10), 10);
        return new Date(seconds * 1000);
    }
    return null;
};

export const toBSON = parser.toBSON;
export const parseEJSON = EJSON.parse;

export const parseObjectId = function (string) {
    if (/^[\da-f]{24}$/i.test(string)) {
        return ObjectId.createFromHexString(string);
    }
    if (string instanceof ObjectId) {
        return string;
    }

    return ObjectId.createFromHexString(String(string));
};

// Convert BSON documents to string
export const bsonToString = function (doc) {
    return JSON.stringify(EJSON.deserialize(doc));
};

export const toJsonString = function (doc) {
    return EJSON.stringify(EJSON.serialize(doc));
};

export const addHyphensToUUID = function (hex) {
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

function uuid4ToString(input) {
    const hex = input.toString("hex"); // same of input.buffer.toString('hex')
    return addHyphensToUUID(hex);
}

/**
 * Convert BSON into a plain string:
 * - { _bsontype: 'ObjectId', id: <Buffer> } => <ObjectId>
 * - { _bsontype: 'Binary', __id: undefined, sub_type: 4, position: 16, buffer: <Buffer> } => <UUID>
 * - { _bsontype: 'Binary', __id: undefined, sub_type: <number_not_4>, position: 16, buffer: <Buffer> } => <Binary>
 * @param {ObjectId|Binary|*} input
 * @returns {string}
 */
export const stringDocIDs = function (input) {
    if (input && typeof input === "object") {
        switch (input._bsontype) {
            case "ObjectId":
            case "Long": {
                return input.toString();
            }
            case "Binary": {
                if (input.sub_type === Binary.SUBTYPE_UUID) {
                    return uuid4ToString(input);
                }
                return input.toJSON();
            }
            default: {
                return input;
            }
        }
    }

    return input;
};

export const generateGravatarUrl = (
    email,
    options: {
        size?: number;
        default?: string;
    } = {}
) => {
    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Create MD5 hash
    const emailHash = crypto.createHash("md5").update(normalizedEmail).digest("hex");

    // Basic Gravatar URL
    const baseUrl = `https://www.gravatar.com/avatar/${emailHash}`;

    // Optional parameters
    const params: Array<string | number> = [];
    if (options.size) params.push(`s=${options.size}`);
    if (options.default) params.push(`d=${options.default}`);

    // Combine URL with parameters
    return params.length ? `${baseUrl}?${params.join("&")}` : baseUrl;
};

export function isCursor(obj) {
    return obj && typeof obj.next === "function" && typeof obj.toArray === "function";
}

export function createJWTToken(payload: object, options: object = {}) {
    const secret = process.env.JWT_SECRET;
    return jwt.sign(payload, secret, { algorithm: "HS256", ...options });
}

// Encrypt data with a secret key using AES-256-GCM
export function generateApiKey(data) {
    if (!process.env.API_KEY_SECRET) {
        throw new Error("API_KEY_SECRET is not set in the .env file");
    }
    const iv = randomBytes(12);
    const key = Buffer.from(process.env.API_KEY_SECRET, "utf-8").slice(0, 32); // 256-bit key
    const cipher = createCipheriv("aes-256-gcm", key, iv);

    const jsonData = JSON.stringify(data);
    const encrypted = Buffer.concat([cipher.update(jsonData, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Combine iv + tag + encrypted for transmission
    // Encode all to base64url for safe key format
    return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptApiKey(encryptedBase64) {
    if (!process.env.API_KEY_SECRET) {
        throw new Error("API_KEY_SECRET is not set in the .env file");
    }
    const data = Buffer.from(encryptedBase64, "base64url");
    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const encrypted = data.subarray(28);

    const key = Buffer.from(process.env.API_KEY_SECRET, "utf-8").subarray(0, 32);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf-8"));
}
