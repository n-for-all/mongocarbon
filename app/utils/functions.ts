import validator from "validator";

export const mongodbOperators = [
    "$eq",
    "$gt",
    "$gte",
    "$in",
    "$lt",
    "$lte",
    "$ne",
    "$nin",
    "$and",
    "$not",
    "$nor",
    "$or",
    "$exists",
    "$type",
    "$expr",
    "$jsonSchema",
    "$mod",
    "$regex",
    "$text",
    "$where",
    "$geoIntersects",
    "$geoWithin",
    "$near",
    "$nearSphere",
    "$all",
    "$elemMatch",
    "$size",
    "$bitsAllClear",
    "$bitsAllSet",
    "$bitsAnyClear",
    "$bitsAnySet",
];

export function validateUsername(username: string) {
    if (!isUsername(username)) {
        return `Usernames must be at least 3 characters long and no spaces included`;
    }
}
export function validatePassword(password: string) {
    const { isStrongPassword } = validator;
    if (
        !isStrongPassword(password, {
            minLength: 6,
        })
    ) {
        return "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }
}

export const convertBytes = function (input: any) {
    if (typeof input == "undefined") {
        return "";
    }
    input = Number.parseInt(input, 10);
    if (Number.isNaN(input)) {
        return "0 Bytes";
    }
    if (input < 1024) {
        return input.toString() + " Bytes";
    }
    if (input < 1024 * 1024) {
        // Convert to KB and keep 2 decimal values
        input = Math.round((input / 1024) * 100) / 100;
        return input.toString() + " KB";
    }
    if (input < 1024 * 1024 * 1024) {
        input = Math.round((input / (1024 * 1024)) * 100) / 100;
        return input.toString() + " MB";
    }
    if (input < 1024 * 1024 * 1024 * 1024) {
        input = Math.round((input / (1024 * 1024 * 1024)) * 100) / 100;
        return input.toString() + " GB";
    }
    if (input < 1024 * 1024 * 1024 * 1024 * 1024) {
        input = Math.round((input / (1024 * 1024 * 1024 * 1024)) * 100) / 100;
        return input.toString() + " TB";
    }
    return input.toString() + " Bytes";
};

export const numberWithCommas = (x: string | number | undefined) => {
    if (isNumber(x)) {
        return x?.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    } else {
        return x;
    }
};

export const validateMongoConnectionString = (connectionString: string): boolean => {
    if (connectionString.startsWith("mongodb://") || connectionString.startsWith("mongodb+srv://")) {
        return true;
    }
    return false;
};

export const isNumber = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

// Given some size in bytes, returns it in a converted, friendly size
// credits: http://stackoverflow.com/users/1596799/aliceljm
export const bytesToSize = function bytesToSize(bytes) {
    if (bytes === 0) return "0 Byte";
    const k = 1000;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // eslint-disable-next-line no-restricted-properties
    return (bytes / k ** i).toPrecision(3) + " " + sizes[i];
};

export const colsToGrid = function (cols) {
    // Generate list of GridFS buckets
    // takes databases, filters by having suffix of '.files' and also a corresponding '.chunks' in the DB list, then returns just the prefix name.

    // cols comes in an object of all databases and all their collections
    // return an object of all databases and all potential GridFS x.files & x.chunks

    const rets = {};

    for (const key in cols) {
        rets[key] =
            cols[key].constructor.name === "Array"
                ? cols[key]
                      .filter((col) => col.toString().slice(-6) === ".files" && [col.toString().slice(0, -6) + ".chunks"].filter((value) => cols[key].includes(value)))
                      .map((col) => col.toString().slice(0, -6))
                      .sort()
                : [];
    }

    return rets;
};

export const roughSizeOfObject = function (object) {
    const objectList: Array<any> = [];
    const recurse = function (value: any) {
        let bytes = 0;

        if (typeof value === "boolean") {
            bytes = 4;
        } else if (typeof value === "string") {
            bytes = value.length * 2;
        } else if (typeof value === "number") {
            bytes = 8;
        } else if (typeof value === "object" && !objectList.includes(value)) {
            objectList[objectList.length] = value;

            for (const i in value) {
                bytes += 8; // an assumed existence overhead
                bytes += recurse(value[i]);
            }
        }

        return bytes;
    };

    return recurse(object);
};

export const isValidDatabaseName = function (name) {
    if (!name || name.length > 63) {
        return false;
    }

    // https://docs.mongodb.com/manual/reference/limits/#naming-restrictions
    if (/[ "$*./:<>?|]/.test(name)) {
        return false;
    }

    return true;
};

export const isValidCollectionName = function (name) {
    if (name === undefined || name.length === 0) {
        return false;
    }

    if (!/^[/A-Z_a-z-][\w./-]*$/.test(name)) {
        return false;
    }
    return true;
};

export const isUsername = (username: string) => {
    if (validator.isEmpty(username) || username.length <= 3) {
        return false;
    } else if (!validator.matches(username, "^[a-zA-Z0-9_.-@]*$")) {
        return false;
    }
    return true;
};
