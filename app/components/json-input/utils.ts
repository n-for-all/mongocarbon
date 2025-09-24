const locale = {
    format: "{reason} at line {line}",
    symbols: {
        colon: "colon",
        comma: "comma",
        semicolon: "semicolon",
        slash: "slash",
        backslash: "backslash",
        brackets: {
            round: "round brackets",
            square: "square brackets",
            curly: "curly brackets",
            angle: "angle brackets",
        },
        period: "period",
        quotes: {
            single: "single quote",
            double: "double quote",
            grave: "grave accent",
        },
        space: "space",
        ampersand: "ampersand",
        asterisk: "asterisk",
        at: "at sign",
        equals: "equals sign",
        hash: "hash",
        percent: "percent",
        plus: "plus",
        minus: "minus",
        dash: "dash",
        hyphen: "hyphen",
        tilde: "tilde",
        underscore: "underscore",
        bar: "vertical bar",
    },
    types: {
        key: "key",
        value: "value",
        number: "number",
        string: "string",
        primitive: "primitive",
        boolean: "boolean",
        character: "character",
        integer: "integer",
        array: "array",
        float: "float",
    },
    invalidToken: {
        tokenSequence: {
            prohibited: "'{firstToken}' token cannot be followed by '{secondToken}' token(s)",
            permitted: "'{firstToken}' token can only be followed by '{secondToken}' token(s)",
        },
        termSequence: {
            prohibited: "A {firstTerm} cannot be followed by a {secondTerm}",
            permitted: "A {firstTerm} can only be followed by a {secondTerm}",
        },
        double: "'{token}' token cannot be followed by another '{token}' token",
        useInstead: "'{badToken}' token is not accepted. Use '{goodToken}' instead",
        unexpected: "Unexpected '{token}' token found",
    },
    brace: {
        curly: {
            missingOpen: "Missing '{' open curly brace",
            missingClose: "Open '{' curly brace is missing closing '}' curly brace",
            cannotWrap: "'{token}' token cannot be wrapped in '{}' curly braces",
        },
        square: {
            missingOpen: "Missing '[' open square brace",
            missingClose: "Open '[' square brace is missing closing ']' square brace",
            cannotWrap: "'{token}' token cannot be wrapped in '[]' square braces",
        },
    },
    string: {
        missingOpen: "Missing/invalid opening string '{quote}' token",
        missingClose: "Missing/invalid closing string '{quote}' token",
        mustBeWrappedByQuotes: "Strings must be wrapped by quotes",
        nonAlphanumeric: "Non-alphanumeric token '{token}' is not allowed outside string notation",
        unexpectedKey: "Unexpected key found at string position",
    },
    key: {
        numberAndLetterMissingQuotes: "Key beginning with number and containing letters must be wrapped by quotes",
        spaceMissingQuotes: "Key containing space must be wrapped by quotes",
        unexpectedString: "Unexpected string found at key position",
    },
    noTrailingOrLeadingComma: "Trailing or leading commas in arrays and objects are not permitted",
};

const format = (str, params = {}) => {
    if (Object.keys(params).length === 0 || !str || str.indexOf("{") === -1) return str;
    return str.replace(/{(\w+)}/g, (_, key) => params[key]);
};

const newSpan = (i: number, token: any, depth: number, colors: any) => {
    let type = token.type,
        string = token.string;
    let color = "";
    switch (type) {
        case "string":
        case "number":
        case "primitive":
        case "error":
            color = colors[token.type];
            break;
        case "key":
            color = string === " " ? colors.keys_whiteSpace : colors.keys;
            break;
        case "symbol":
            color = string === ":" ? colors.colon : colors.default;
            break;
        default:
            color = colors.default;
            break;
    }
    if (string.length !== string.replace(/</g, "").replace(/>/g, "").length) string = "<xmp style=display:inline;>" + string + "</xmp>";
    return `<span type="${type}" value="${string}" depth="${depth}" style="color:${color}">${string}</span>`;
};
const tokenize = (
    something,
    colors
): {
    tokens: { string: string; type: string }[];
    noSpaces: string;
    indented: string;
    json: string;
    jsObject: any;
    markup: string;
    lines: number;
    error?: { token: string; line: number; reason: string } | null;
} | null => {
    if (typeof something !== "object") {
        return {
            tokens: [],
            noSpaces: "",
            indented: "",
            json: "",
            jsObject: undefined,
            markup: "",
            lines: 0,
            error: { token: "", line: 0, reason: "tokenize() expects object type properties only. Got '" + typeof something + "' type instead." },
        };
    }

    if ("nodeType" in something) {
        const containerNode = something.cloneNode(true),
            hasChildren = containerNode.hasChildNodes();
        if (!hasChildren) return null;
        const children = containerNode.childNodes;

        let buffer: {
            tokens_unknown: { string: string; type: string }[];
            tokens_proto: { string: string; type: string }[];
            tokens_split: { string: string; type: string }[];
            tokens_fallback: { string: string; type: string }[];
            tokens_normalize: { string: string; type: string }[];
            tokens_merge: { string: string; type: string }[];
            tokens_plainText: string;
            indented: string;
            json: string;
            jsObject: any;
            markup: string;
        } = {
            tokens_unknown: [],
            tokens_proto: [],
            tokens_split: [],
            tokens_fallback: [],
            tokens_normalize: [],
            tokens_merge: [],
            tokens_plainText: "",
            indented: "",
            json: "",
            jsObject: undefined,
            markup: "",
        };
        for (var i = 0; i < children.length; i++) {
            let child = children[i];
            switch (child.nodeName) {
                case "SPAN":
                    const info = {
                        string: child.textContent,
                        type: child.attributes.type.textContent,
                    };
                    buffer.tokens_unknown.push(info);
                    break;
                case "DIV":
                    buffer.tokens_unknown.push({ string: child.textContent, type: "unknown" });
                    break;
                case "BR":
                    if (child.textContent === "") buffer.tokens_unknown.push({ string: "\n", type: "unknown" });
                    break;
                case "#text":
                    buffer.tokens_unknown.push({ string: child.textContent, type: "unknown" });
                    break;
                case "FONT":
                    buffer.tokens_unknown.push({ string: child.textContent, type: "unknown" });
                    break;
                default:
                    console.error("Unrecognized node:", { child });
                    break;
            }
        }
        function quarkize(text, prefix = "") {
            let buffer: {
                active: string | false;
                string: string;
                number: string;
                symbol: string;
                space: string;
                delimiter: string;
                quarks: { string: string; type: string }[];
            } = {
                active: false,
                string: "",
                number: "",
                symbol: "",
                space: "",
                delimiter: "",
                quarks: [],
            };
            function pushAndStore(char, type) {
                switch (type) {
                    case "symbol":
                    case "delimiter":
                        if (buffer.active)
                            buffer.quarks.push({
                                string: buffer[buffer.active],
                                type: prefix + "-" + buffer.active,
                            });
                        if (buffer.active) buffer[buffer.active] = "";
                        buffer.active = type;
                        buffer[type] = char;
                        break;
                    default:
                        if (type !== buffer.active || [buffer.string, char].indexOf("\n") > -1) {
                            if (buffer.active)
                                buffer.quarks.push({
                                    string: buffer[buffer.active],
                                    type: prefix + "-" + buffer.active,
                                });
                            if (buffer.active) buffer[buffer.active] = "";
                            buffer.active = type;
                            buffer[type] = char;
                        } else buffer[type] += char;
                        break;
                }
            }
            function finalPush() {
                if (buffer.active) {
                    buffer.quarks.push({
                        string: buffer[buffer.active],
                        type: prefix + "-" + buffer.active,
                    });
                    buffer[buffer.active] = "";
                    buffer.active = false;
                }
            }
            for (var i = 0; i < text.length; i++) {
                const char = text.charAt(i);
                switch (char) {
                    case '"':
                    case "'":
                        pushAndStore(char, "delimiter");
                        break;
                    case " ":
                    case "\u00A0":
                        pushAndStore(char, "space");
                        break;
                    case "{":
                    case "}":
                    case "[":
                    case "]":
                    case ":":
                    case ",":
                        pushAndStore(char, "symbol");
                        break;
                    case "0":
                    case "1":
                    case "2":
                    case "3":
                    case "4":
                    case "5":
                    case "6":
                    case "7":
                    case "8":
                    case "9":
                        if (buffer.active === "string") pushAndStore(char, "string");
                        else pushAndStore(char, "number");
                        break;
                    case "-":
                        if (i < text.length - 1)
                            if ("0123456789".indexOf(text.charAt(i + 1)) > -1) {
                                pushAndStore(char, "number");
                                break;
                            }
                    case ".":
                        if (i < text.length - 1 && i > 0)
                            if ("0123456789".indexOf(text.charAt(i + 1)) > -1 && "0123456789".indexOf(text.charAt(i - 1)) > -1) {
                                pushAndStore(char, "number");
                                break;
                            }
                    default:
                        pushAndStore(char, "string");
                        break;
                }
            }
            finalPush();
            return buffer.quarks;
        }
        for (var i = 0; i < buffer.tokens_unknown.length; i++) {
            let token = buffer.tokens_unknown[i];
            buffer.tokens_proto = buffer.tokens_proto.concat(quarkize(token.string, "proto"));
        }
        function validToken(string, type) {
            const quotes = "'\"";
            let firstChar = "",
                lastChar = "",
                quoteType: number = -1;
            switch (type) {
                case "primitive":
                    if (["true", "false", "null", "undefined"].indexOf(string) === -1) return false;
                    break;
                case "string":
                    if (string.length < 2) return false;
                    (firstChar = string.charAt(0)), (lastChar = string.charAt(string.length - 1)), (quoteType = quotes.indexOf(firstChar));
                    if (quoteType === -1) return false;
                    if (firstChar !== lastChar) return false;
                    for (var i = 0; i < string.length; i++) {
                        if (i > 0 && i < string.length - 1) if (string.charAt(i) === quotes[quoteType]) if (string.charAt(i - 1) !== "\\") return false;
                    }
                    break;
                case "key":
                    if (string.length === 0) return false;
                    (firstChar = string.charAt(0)), (lastChar = string.charAt(string.length - 1)), (quoteType = quotes.indexOf(firstChar));
                    if (quoteType > -1) {
                        if (string.length === 1) return false;
                        if (firstChar !== lastChar) return false;
                        for (var i = 0; i < string.length; i++) {
                            if (i > 0 && i < string.length - 1) if (string.charAt(i) === quotes[quoteType]) if (string.charAt(i - 1) !== "\\") return false;
                        }
                    } else {
                        const nonAlphanumeric = "'\"`.,:;{}[]&<>=~*%\\|/-+!?@^ \xa0";
                        for (var i = 0; i < nonAlphanumeric.length; i++) {
                            const nonAlpha = nonAlphanumeric.charAt(i);
                            if (string.indexOf(nonAlpha) > -1) return false;
                        }
                    }
                    break;
                case "number":
                    for (var i = 0; i < string.length; i++) {
                        if ("0123456789".indexOf(string.charAt(i)) === -1)
                            if (i === 0) {
                                if ("-" !== string.charAt(0)) return false;
                            } else if ("." !== string.charAt(i)) return false;
                    }
                    break;
                case "symbol":
                    if (string.length > 1) return false;
                    if ("{[:]},".indexOf(string) === -1) return false;
                    break;
                case "colon":
                    if (string.length > 1) return false;
                    if (":" !== string) return false;
                    break;
                default:
                    break;
            }
            return true;
        }
        for (var i = 0; i < buffer.tokens_proto.length; i++) {
            let token = buffer.tokens_proto[i];
            if (token.type.indexOf("proto") === -1) {
                if (!validToken(token.string, token.type)) {
                    buffer.tokens_split = buffer.tokens_split.concat(quarkize(token.string, "split"));
                } else buffer.tokens_split.push(token);
            } else buffer.tokens_split.push(token);
        }
        for (var i = 0; i < buffer.tokens_split.length; i++) {
            let token = buffer.tokens_split[i];
            let type = token.type,
                string = token.string,
                length = string.length,
                fallback: string[] = [];
            if (type.indexOf("-") > -1) {
                type = type.slice(type.indexOf("-") + 1);
                if (type !== "string") fallback.push("string");
                fallback.push("key");
                fallback.push("error");
            }
            let tokul = {
                string: string,
                length: length,
                type: type,
                fallback: fallback,
            };
            buffer.tokens_fallback.push(tokul);
        }
        function tokenFollowed() {
            const last = buffer.tokens_normalize.length - 1;
            if (last < 1) return false;
            for (var i = last; i >= 0; i--) {
                const previousToken = buffer.tokens_normalize[i];
                switch (previousToken.type) {
                    case "space":
                    case "linebreak":
                        break;
                    default:
                        return previousToken;
                        break;
                }
            }
            return false;
        }
        let buffer2: {
            brackets: string[];
            stringOpen: string | false;
            isValue: boolean;
        } = {
            brackets: [],
            stringOpen: false,
            isValue: false,
        };
        for (var i = 0; i < buffer.tokens_fallback.length; i++) {
            let token = buffer.tokens_fallback[i];
            const type = token.type,
                string = token.string;
            let normalToken = {
                type: type,
                string: string,
            };
            switch (type) {
                case "symbol":
                case "colon":
                    if (buffer2.stringOpen) {
                        if (buffer2.isValue) normalToken.type = "string";
                        else normalToken.type = "key";
                        break;
                    }
                    switch (string) {
                        case "[":
                        case "{":
                            buffer2.brackets.push(string);
                            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === "[";
                            break;
                        case "]":
                        case "}":
                            buffer2.brackets.pop();
                            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === "[";
                            break;
                        case ",":
                            const followed = tokenFollowed();
                            if (followed && followed.type === "colon") break;
                            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === "[";
                            break;
                        case ":":
                            normalToken.type = "colon";
                            buffer2.isValue = true;
                            break;
                    }
                    break;
                case "delimiter":
                    if (buffer2.isValue) normalToken.type = "string";
                    else normalToken.type = "key";
                    if (!buffer2.stringOpen) {
                        buffer2.stringOpen = string;
                        break;
                    }
                    if (i > 0) {
                        const previousToken = buffer.tokens_fallback[i - 1],
                            _string = previousToken.string,
                            _type = previousToken.type,
                            _char = _string.charAt(_string.length - 1);
                        if (_type === "string" && _char === "\\") break;
                    }
                    if (buffer2.stringOpen === string) {
                        buffer2.stringOpen = false;
                        break;
                    }
                    break;
                case "primitive":
                case "string":
                    if (["false", "true", "null", "undefined"].indexOf(string) > -1) {
                        const lastIndex = buffer.tokens_normalize.length - 1;
                        if (lastIndex >= 0) {
                            if (buffer.tokens_normalize[lastIndex].type !== "string") {
                                normalToken.type = "primitive";
                                break;
                            }
                            normalToken.type = "string";
                            break;
                        }
                        normalToken.type = "primitive";
                        break;
                    }
                    if (string === "\n")
                        if (!buffer2.stringOpen) {
                            normalToken.type = "linebreak";
                            break;
                        }
                    if (buffer2.isValue) normalToken.type = "string";
                    else normalToken.type = "key";
                    break;
                case "space":
                    if (buffer2.stringOpen)
                        if (buffer2.isValue) normalToken.type = "string";
                        else normalToken.type = "key";
                    break;
                case "number":
                    if (buffer2.stringOpen)
                        if (buffer2.isValue) normalToken.type = "string";
                        else normalToken.type = "key";
                    break;
                default:
                    break;
            }
            buffer.tokens_normalize.push(normalToken);
        }
        for (var i = 0; i < buffer.tokens_normalize.length; i++) {
            const token = buffer.tokens_normalize[i];
            let mergedToken = {
                string: token.string,
                type: token.type,
                tokens: [i],
            };
            if (["symbol", "colon"].indexOf(token.type) === -1)
                if (i + 1 < buffer.tokens_normalize.length) {
                    let count = 0;
                    for (var u = i + 1; u < buffer.tokens_normalize.length; u++) {
                        const nextToken = buffer.tokens_normalize[u];
                        if (token.type !== nextToken.type) break;
                        mergedToken.string += nextToken.string;
                        mergedToken.tokens.push(u);
                        count++;
                    }
                    i += count;
                }
            buffer.tokens_merge.push(mergedToken);
        }
        const quotes = "'\"",
            alphanumeric = "abcdefghijklmnopqrstuvwxyz" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "0123456789" + "_$";
        var error: {
                token: string;
                line: number;
                reason: string;
            } | null = null,
            line = buffer.tokens_merge.length > 0 ? 1 : 0;
        buffer2 = {
            brackets: [],
            stringOpen: false,
            isValue: false,
        };
        function setError(tokenID, reason, offset = 0) {
            error = {
                token: tokenID,
                line: line,
                reason: reason,
            };
            buffer.tokens_merge[tokenID + offset].type = "error";
        }
        function followedBySymbol(tokenID, options) {
            if (tokenID === undefined) console.error("tokenID argument must be an integer.");
            if (options === undefined) console.error("options argument must be an array.");
            if (tokenID === buffer.tokens_merge.length - 1) return false;
            for (var i = tokenID + 1; i < buffer.tokens_merge.length; i++) {
                const nextToken = buffer.tokens_merge[i];
                switch (nextToken.type) {
                    case "space":
                    case "linebreak":
                        break;
                    case "symbol":
                    case "colon":
                        if (options.indexOf(nextToken.string) > -1) return i;
                        else return false;
                        break;
                    default:
                        return false;
                        break;
                }
            }
            return false;
        }
        function followsSymbol(tokenID, options) {
            if (tokenID === undefined) console.error("tokenID argument must be an integer.");
            if (options === undefined) console.error("options argument must be an array.");
            if (tokenID === 0) return false;
            for (var i = tokenID - 1; i >= 0; i--) {
                const previousToken = buffer.tokens_merge[i];
                switch (previousToken.type) {
                    case "space":
                    case "linebreak":
                        break;
                    case "symbol":
                    case "colon":
                        if (options.indexOf(previousToken.string) > -1) return true;
                        return false;
                    default:
                        return false;
                }
            }
            return false;
        }
        function getFollowsSymbolIndex(tokenID, options) {
            if (tokenID === undefined) console.error("tokenID argument must be an integer.");
            if (options === undefined) console.error("options argument must be an array.");
            if (tokenID === 0) return false;
            for (var i = tokenID - 1; i >= 0; i--) {
                const previousToken = buffer.tokens_merge[i];
                switch (previousToken.type) {
                    case "space":
                    case "linebreak":
                        break;
                    case "symbol":
                    case "colon":
                        if (options.indexOf(previousToken.string) > -1) return i;
                        return 0;
                    default:
                        return 0;
                }
            }
            return 0;
        }
        function typeFollowed(tokenID) {
            if (tokenID === undefined) console.error("tokenID argument must be an integer.");
            if (tokenID === 0) return false;
            for (var i = tokenID - 1; i >= 0; i--) {
                const previousToken = buffer.tokens_merge[i];
                switch (previousToken.type) {
                    case "space":
                    case "linebreak":
                        break;
                    default:
                        return previousToken.type;
                        break;
                }
            }
            return false;
        }
        let bracketList: { i: number; line: number; string: string }[] = [];
        for (var i = 0; i < buffer.tokens_merge.length; i++) {
            if (error) break;
            let token = buffer.tokens_merge[i],
                string = token.string,
                type = token.type;

            switch (type) {
                case "space":
                    break;
                case "linebreak":
                    line++;
                    break;
                case "symbol":
                    switch (string) {
                        case "{":
                        case "[":
                            let objFound = followsSymbol(i, ["}", "]"]);
                            if (objFound) {
                                const index = getFollowsSymbolIndex(i, ["}", "]"]);
                                setError(
                                    i,
                                    format("'{firstToken}' token cannot be followed by '{secondToken}' token(s)", {
                                        firstToken: buffer.tokens_merge[index.toString()].string,
                                        secondToken: string,
                                    })
                                );
                                break;
                            }
                            if (string === "[" && i > 0)
                                if (!followsSymbol(i, [":", "[", ","])) {
                                    setError(
                                        i,
                                        format(locale.invalidToken.tokenSequence.permitted, {
                                            firstToken: "[",
                                            secondToken: [":", "[", ","],
                                        })
                                    );
                                    break;
                                }
                            if (string === "{")
                                if (followsSymbol(i, ["{"])) {
                                    setError(
                                        i,
                                        format(locale.invalidToken.double, {
                                            token: "{",
                                        })
                                    );
                                    break;
                                }
                            buffer2.brackets.push(string);
                            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === "[";
                            bracketList.push({ i: i, line: line, string: string });
                            break;
                        case "}":
                        case "]":
                            if (string === "}")
                                if (buffer2.brackets[buffer2.brackets.length - 1] !== "{") {
                                    setError(i, format(locale.brace.curly.missingOpen));
                                    break;
                                }
                            if (string === "}")
                                if (followsSymbol(i, [","])) {
                                    setError(
                                        i,
                                        format(locale.invalidToken.tokenSequence.prohibited, {
                                            firstToken: ",",
                                            secondToken: "}",
                                        })
                                    );
                                    break;
                                }
                            if (string === "]")
                                if (buffer2.brackets[buffer2.brackets.length - 1] !== "[") {
                                    setError(i, format(locale.brace.square.missingOpen));
                                    break;
                                }
                            if (string === "]")
                                if (followsSymbol(i, [":"])) {
                                    setError(
                                        i,
                                        format(locale.invalidToken.tokenSequence.prohibited, {
                                            firstToken: ":",
                                            secondToken: "]",
                                        })
                                    );
                                    break;
                                }
                            buffer2.brackets.pop();
                            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === "[";
                            bracketList.push({ i: i, line: line, string: string });
                            break;
                        case ",":
                            let commaFound = followsSymbol(i, ["{"]);
                            if (commaFound) {
                                if (followedBySymbol(i, ["}"])) {
                                    setError(
                                        i,
                                        format(locale.brace.curly.cannotWrap, {
                                            token: ",",
                                        })
                                    );
                                    break;
                                }
                                setError(
                                    i,
                                    format(locale.invalidToken.tokenSequence.prohibited, {
                                        firstToken: "{",
                                        secondToken: ",",
                                    })
                                );
                                break;
                            }
                            if (followedBySymbol(i, ["}", ",", "]"])) {
                                setError(i, format(locale.noTrailingOrLeadingComma));
                                break;
                            }
                            let found = typeFollowed(i);
                            switch (found) {
                                case "key":
                                case "colon":
                                    setError(
                                        i,
                                        format(locale.invalidToken.termSequence.prohibited, {
                                            firstTerm: found === "key" ? locale.types.key : locale.symbols.colon,
                                            secondTerm: locale.symbols.comma,
                                        })
                                    );
                                    break;
                                case "symbol":
                                    if (followsSymbol(i, ["{"])) {
                                        setError(
                                            i,
                                            format(locale.invalidToken.tokenSequence.prohibited, {
                                                firstToken: "{",
                                                secondToken: ",",
                                            })
                                        );
                                        break;
                                    }
                                    break;
                                default:
                                    break;
                            }
                            buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === "[";
                            break;
                        default:
                            break;
                    }
                    buffer.json += string;
                    break;
                case "colon":
                    let colonFound = followsSymbol(i, ["["]);
                    if (colonFound && followedBySymbol(i, ["]"])) {
                        setError(
                            i,
                            format(locale.brace.square.cannotWrap, {
                                token: ":",
                            })
                        );
                        break;
                    }
                    if (colonFound) {
                        setError(
                            i,
                            format(locale.invalidToken.tokenSequence.prohibited, {
                                firstToken: "[",
                                secondToken: ":",
                            })
                        );
                        break;
                    }
                    if (typeFollowed(i) !== "key") {
                        setError(
                            i,
                            format(locale.invalidToken.termSequence.permitted, {
                                firstTerm: locale.symbols.colon,
                                secondTerm: locale.types.key,
                            })
                        );
                        break;
                    }
                    if (followedBySymbol(i, ["}", "]"])) {
                        setError(
                            i,
                            format(locale.invalidToken.termSequence.permitted, {
                                firstTerm: locale.symbols.colon,
                                secondTerm: locale.types.value,
                            })
                        );
                        break;
                    }
                    buffer2.isValue = true;
                    buffer.json += string;
                    break;
                case "key":
                case "string":
                    let firstChar = string.charAt(0),
                        lastChar = string.charAt(string.length - 1),
                        quote_primary = quotes.indexOf(firstChar);
                    if (quotes.indexOf(firstChar) === -1)
                        if (quotes.indexOf(lastChar) !== -1) {
                            setError(
                                i,
                                format(locale.string.missingOpen, {
                                    quote: firstChar,
                                })
                            );
                            break;
                        }
                    if (quotes.indexOf(lastChar) === -1)
                        if (quotes.indexOf(firstChar) !== -1) {
                            setError(
                                i,
                                format(locale.string.missingClose, {
                                    quote: firstChar,
                                })
                            );
                            break;
                        }
                    if (quotes.indexOf(firstChar) > -1)
                        if (firstChar !== lastChar) {
                            setError(
                                i,
                                format(locale.string.missingClose, {
                                    quote: firstChar,
                                })
                            );
                            break;
                        }
                    if ("string" === type)
                        if (quotes.indexOf(firstChar) === -1 && quotes.indexOf(lastChar) === -1) {
                            setError(i, format(locale.string.mustBeWrappedByQuotes));
                            break;
                        }
                    if ("key" === type)
                        if (followedBySymbol(i, ["}", "]"])) {
                            setError(
                                i,
                                format(locale.invalidToken.termSequence.permitted, {
                                    firstTerm: locale.types.key,
                                    secondTerm: locale.symbols.colon,
                                })
                            );
                        }
                    if (quotes.indexOf(firstChar) === -1 && quotes.indexOf(lastChar) === -1)
                        for (var h = 0; h < string.length; h++) {
                            if (error) break;
                            const c = string.charAt(h);
                            if (alphanumeric.indexOf(c) === -1) {
                                setError(
                                    i,
                                    format(locale.string.nonAlphanumeric, {
                                        token: c,
                                    })
                                );
                                break;
                            }
                        }
                    if (firstChar === "'") string = '"' + string.slice(1, -1) + '"';
                    else if (firstChar !== '"') string = '"' + string + '"';
                    if ("key" === type)
                        if ("key" === typeFollowed(i)) {
                            setError(i, format(locale.key.spaceMissingQuotes));
                            break;
                        }
                    if ("key" === type)
                        if (!followsSymbol(i, ["{", ","])) {
                            setError(
                                i,
                                format(locale.invalidToken.tokenSequence.permitted, {
                                    firstToken: type,
                                    secondToken: ["{", ","],
                                })
                            );
                            break;
                        }
                    if ("string" === type)
                        if (!followsSymbol(i, ["[", ":", ","])) {
                            setError(
                                i,
                                format(locale.invalidToken.tokenSequence.permitted, {
                                    firstToken: type,
                                    secondToken: ["[", ":", ","],
                                })
                            );
                            break;
                        }
                    if ("key" === type)
                        if (buffer2.isValue) {
                            setError(i, format(locale.string.unexpectedKey));
                            break;
                        }
                    if ("string" === type)
                        if (!buffer2.isValue) {
                            setError(i, format(locale.key.unexpectedString));
                            break;
                        }
                    buffer.json += string;
                    break;
                case "number":
                case "primitive":
                    if (followsSymbol(i, ["{"])) {
                        buffer.tokens_merge[i].type = "key";
                        type = buffer.tokens_merge[i].type;
                        string = '"' + string + '"';
                    } else if (typeFollowed(i) === "key") {
                        buffer.tokens_merge[i].type = "key";
                        type = buffer.tokens_merge[i].type;
                    } else if (!followsSymbol(i, ["[", ":", ","])) {
                        setError(
                            i,
                            format(locale.invalidToken.tokenSequence.permitted, {
                                firstToken: type,
                                secondToken: ["[", ":", ","],
                            })
                        );
                        break;
                    }
                    if (type !== "key")
                        if (!buffer2.isValue) {
                            buffer.tokens_merge[i].type = "key";
                            type = buffer.tokens_merge[i].type;
                            string = '"' + string + '"';
                        }
                    if (type === "primitive")
                        if (string === "undefined")
                            setError(
                                i,
                                format(locale.invalidToken.useInstead, {
                                    badToken: "undefined",
                                    goodToken: "null",
                                })
                            );
                    buffer.json += string;
                    break;
            }
        }
        let noEscapedSingleQuote = "";
        for (var i = 0; i < buffer.json.length; i++) {
            let current = buffer.json.charAt(i),
                next = "";
            if (i + 1 < buffer.json.length) {
                next = buffer.json.charAt(i + 1);
                if (current === "\\" && next === "'") {
                    noEscapedSingleQuote += next;
                    i++;
                    continue;
                }
            }
            noEscapedSingleQuote += current;
        }
        buffer.json = noEscapedSingleQuote;
        if (!error) {
            const maxIterations = Math.ceil(bracketList.length / 2);
            let round = 0,
                delta = false;
            function removePair(index) {
                bracketList.splice(index + 1, 1);
                bracketList.splice(index, 1);
                if (!delta) delta = true;
            }
            while (bracketList.length > 0) {
                delta = false;
                for (var tokenCount = 0; tokenCount < bracketList.length - 1; tokenCount++) {
                    const pair = bracketList[tokenCount].string + bracketList[tokenCount + 1].string;
                    if (["[]", "{}"].indexOf(pair) > -1) removePair(tokenCount);
                }
                round++;
                if (!delta) break;
                if (round >= maxIterations) break;
            }
            if (bracketList.length > 0) {
                const _tokenString = bracketList[0].string,
                    _tokenPosition = bracketList[0].i,
                    _closingBracketType = _tokenString === "[" ? "]" : "}";
                line = bracketList[0].line;
                setError(_tokenPosition, format(locale.brace[_closingBracketType === "]" ? "square" : "curly"].missingClose));
            }
        }
        if (!error)
            if ([undefined, ""].indexOf(buffer.json) === -1)
                try {
                    buffer.jsObject = JSON.parse(buffer.json);
                } catch (err: any) {
                    const errorMessage = err.message,
                        subsMark = errorMessage.indexOf("position");
                    if (subsMark === -1) throw new Error("Error parsing failed");
                    const errPositionStr = errorMessage.substring(subsMark + 9, errorMessage.length),
                        errPosition = parseInt(errPositionStr);
                    let charTotal = 0,
                        tokenIndex = 0,
                        token: { type: string; string: string } | null = null,
                        _line = 1,
                        exitWhile = false;
                    while (charTotal < errPosition && !exitWhile) {
                        token = buffer.tokens_merge[tokenIndex];
                        if ("linebreak" === token.type) _line++;
                        if (["space", "linebreak"].indexOf(token.type) === -1) charTotal += token.string.length;
                        if (charTotal >= errPosition) break;
                        tokenIndex++;
                        if (!buffer.tokens_merge[tokenIndex + 1]) exitWhile = true;
                    }
                    line = _line;
                    let backslashCount = 0;
                    if (token) {
                        for (let i = 0; i < token.string.length; i++) {
                            const char = token.string.charAt(i);
                            if (char === "\\") backslashCount = backslashCount > 0 ? backslashCount + 1 : 1;
                            else {
                                if (backslashCount % 2 !== 0 || backslashCount === 0)
                                    if ("'\"bfnrt".indexOf(char) === -1) {
                                        setError(
                                            tokenIndex,
                                            format(locale.invalidToken.unexpected, {
                                                token: "\\",
                                            })
                                        );
                                    }
                                backslashCount = 0;
                            }
                        }
                    } else {
                        setError(
                            tokenIndex,
                            format(locale.invalidToken.unexpected, {
                                token: "<null>",
                            })
                        );
                    }
                    if (!error) {
                        setError(
                            tokenIndex,
                            format(locale.invalidToken.unexpected, {
                                token: token?.string,
                            })
                        );
                    }
                }
        let _line = 1,
            _depth = 0;
        function newIndent() {
            var space: string[] = [];
            for (var i = 0; i < _depth * 2; i++) space.push("&nbsp;");
            return space.join("");
        }
        function newLineBreak(byPass = false) {
            _line++;
            if (_depth > 0 || byPass) {
                return "<br>";
            }
            return "";
        }
        function newLineBreakAndIndent(byPass = false) {
            return newLineBreak(byPass) + newIndent();
        }
        if (!error)
            for (var i = 0; i < buffer.tokens_merge.length; i++) {
                const token = buffer.tokens_merge[i],
                    string = token.string,
                    type = token.type;
                switch (type) {
                    case "space":
                    case "linebreak":
                        break;
                    case "string":
                    case "number":
                    case "primitive":
                    case "error":
                        buffer.markup += (followsSymbol(i, [",", "["]) ? newLineBreakAndIndent() : "") + newSpan(i, token, _depth, colors);
                        break;
                    case "key":
                        buffer.markup += newLineBreakAndIndent() + newSpan(i, token, _depth, colors);
                        break;
                    case "colon":
                        buffer.markup += newSpan(i, token, _depth, colors) + "&nbsp;";
                        break;
                    case "symbol":
                        switch (string) {
                            case "[":
                            case "{":
                                buffer.markup += (!followsSymbol(i, [":"]) ? newLineBreakAndIndent() : "") + newSpan(i, token, _depth, colors);
                                _depth++;
                                break;
                            case "]":
                            case "}":
                                _depth--;
                                const islastToken = i === buffer.tokens_merge.length - 1,
                                    _adjustment = i > 0 ? (["[", "{"].indexOf(buffer.tokens_merge[i - 1].string) > -1 ? "" : newLineBreakAndIndent(islastToken)) : "";
                                buffer.markup += _adjustment + newSpan(i, token, _depth, colors);
                                break;
                            case ",":
                                buffer.markup += newSpan(i, token, _depth, colors);
                                break;
                        }
                        break;
                }
            }
        if (error) {
            let _line_fallback = 1;
            function countCarrigeReturn(string) {
                let count = 0;
                for (var i = 0; i < string.length; i++) {
                    if (["\n", "\r"].indexOf(string[i]) > -1) count++;
                }
                return count;
            }
            _line = 1;
            for (var i = 0; i < buffer.tokens_merge.length; i++) {
                const token = buffer.tokens_merge[i],
                    type = token.type,
                    string = token.string;
                if (type === "linebreak") _line++;
                buffer.markup += newSpan(i, token, _depth, colors);
                _line_fallback += countCarrigeReturn(string);
            }
            _line++;
            _line_fallback++;
            if (_line < _line_fallback) _line = _line_fallback;
        }
        for (var i = 0; i < buffer.tokens_merge.length; i++) {
            let token = buffer.tokens_merge[i];
            buffer.indented += token.string;
            if (["space", "linebreak"].indexOf(token.type) === -1) buffer.tokens_plainText += token.string;
        }

        return {
            tokens: buffer.tokens_merge,
            noSpaces: buffer.tokens_plainText,
            indented: buffer.indented,
            json: buffer.json,
            jsObject: buffer.jsObject,
            markup: buffer.markup,
            lines: _line,
            error: error,
        };
    } else {
        let buffer: {
            inputText: string;
            position: number;
            currentChar: string;
            tokenPrimary: string;
            tokenSecondary: string;
            brackets: string[];
            isValue: boolean;
            stringOpen: string | null;
            stringStart: number;
            tokens: string[];
        } = {
            inputText: JSON.stringify(something),
            position: 0,
            currentChar: "",
            tokenPrimary: "",
            tokenSecondary: "",
            brackets: [],
            isValue: false,
            stringOpen: null,
            stringStart: 0,
            tokens: [],
        };

        function determine_string() {
            if ("'\"".indexOf(buffer.currentChar) === -1) return false;
            if (!buffer.stringOpen) {
                add_tokenSecondary();
                buffer.stringStart = buffer.position;
                buffer.stringOpen = buffer.currentChar;
                return true;
            }
            if (buffer.stringOpen === buffer.currentChar) {
                add_tokenSecondary();
                const stringToken = buffer.inputText.substring(buffer.stringStart, buffer.position + 1);
                add_tokenPrimary(stringToken);
                buffer.stringOpen = null;
                return true;
            }
            return false;
        }
        function determine_value() {
            if (":,{}[]".indexOf(buffer.currentChar) === -1) return false;
            if (buffer.stringOpen) return false;
            add_tokenSecondary();
            add_tokenPrimary(buffer.currentChar);
            switch (buffer.currentChar) {
                case ":":
                    buffer.isValue = true;
                    return true;
                case "{":
                case "[":
                    buffer.brackets.push(buffer.currentChar);
                    break;
                case "}":
                case "]":
                    buffer.brackets.pop();
                    break;
            }
            if (buffer.currentChar !== ":") buffer.isValue = buffer.brackets[buffer.brackets.length - 1] === "[";
            return true;
        }
        function add_tokenSecondary() {
            if (buffer.tokenSecondary.length === 0) return false;
            buffer.tokens.push(buffer.tokenSecondary);
            buffer.tokenSecondary = "";
            return true;
        }
        function add_tokenPrimary(value) {
            if (value.length === 0) return false;
            buffer.tokens.push(value);
            return true;
        }
        for (var i = 0; i < buffer.inputText.length; i++) {
            buffer.position = i;
            buffer.currentChar = buffer.inputText.charAt(buffer.position);
            const a = determine_value(),
                b = determine_string(),
                c = buffer.currentChar !== "\\" ? false : true;
            if (!a && !b && !c) if (!buffer.stringOpen) buffer.tokenSecondary += buffer.currentChar;
        }
        let buffer2: {
            brackets: string[];
            isValue: boolean;
            tokens: { type: string; string: string; value: any; depth: number }[];
        } = { brackets: [], isValue: false, tokens: [] };
        buffer2.tokens = buffer.tokens.map((token) => {
            let type = "",
                string = "",
                value: string | null | number | boolean | undefined = "";
            switch (token) {
                case ",":
                    type = "symbol";
                    string = token;
                    value = token;
                    buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === "[";
                    break;
                case ":":
                    type = "symbol";
                    string = token;
                    value = token;
                    buffer2.isValue = true;
                    break;
                case "{":
                case "[":
                    type = "symbol";
                    string = token;
                    value = token;
                    buffer2.brackets.push(token);
                    buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === "[";
                    break;
                case "}":
                case "]":
                    type = "symbol";
                    string = token;
                    value = token;
                    buffer2.brackets.pop();
                    buffer2.isValue = buffer2.brackets[buffer2.brackets.length - 1] === "[";
                    break;
                case "undefined":
                    type = "primitive";
                    string = token;
                    value = undefined;
                    break;
                case "null":
                    type = "primitive";
                    string = token;
                    value = null;
                    break;
                case "false":
                    type = "primitive";
                    string = token;
                    value = false;
                    break;
                case "true":
                    type = "primitive";
                    string = token;
                    value = true;
                    break;
                default:
                    const C = token.charAt(0);
                    function stripQuotesFromKey(text) {
                        if (text.length === 0) return text;
                        if (['""', "''"].indexOf(text) > -1) return "''";
                        let wrappedInQuotes = false;
                        for (var i = 0; i < 2; i++) {
                            if ([text.charAt(0), text.charAt(text.length - 1)].indexOf(['"', "'"][i]) > -1) {
                                wrappedInQuotes = true;
                                break;
                            }
                        }
                        if (wrappedInQuotes && text.length >= 2) text = text.slice(1, -1);
                        const nonAlphaNumeric = text.replace(/\w/g, ""),
                            alphaNumeric = text.replace(/\W+/g, ""),
                            mayRemoveQuotes = ((nonAlphaNumeric, text) => {
                                let numberAndLetter = false;
                                for (var i = 0; i < text.length; i++) {
                                    if (i === 0) if (isNaN(text.charAt(i))) break;
                                    if (isNaN(text.charAt(i))) {
                                        numberAndLetter = true;
                                        break;
                                    }
                                }
                                return !(nonAlphaNumeric.length > 0 || numberAndLetter);
                            })(nonAlphaNumeric, text),
                            hasQuotes = ((string) => {
                                for (var i = 0; i < string.length; i++) {
                                    if (["'", '"'].indexOf(string.charAt(i)) > -1) return true;
                                }
                                return false;
                            })(nonAlphaNumeric);
                        if (hasQuotes) {
                            let newText = "";
                            const charList = text.split("");
                            for (var ii = 0; ii < charList.length; ii++) {
                                let char = charList[ii];
                                if (["'", '"'].indexOf(char) > -1) char = "\\" + char;
                                newText += char;
                            }
                            text = newText;
                        }
                        if (!mayRemoveQuotes) return "'" + text + "'";
                        else return text;
                    }
                    if ("'\"".indexOf(C) > -1) {
                        if (buffer2.isValue) type = "string";
                        else type = "key";
                        if (type === "key") string = stripQuotesFromKey(token);
                        if (type === "string") {
                            string = "";
                            const charList2 = token.slice(1, -1).split("");
                            for (var ii = 0; ii < charList2.length; ii++) {
                                let char = charList2[ii];
                                if ("'\"".indexOf(char) > -1) char = "\\" + char;
                                string += char;
                            }
                            string = "'" + string + "'";
                        }
                        value = string;
                        break;
                    }
                    if (String(Number(token)) === token) {
                        type = "number";
                        string = token;
                        value = Number(token);
                        break;
                    }
                    if (token.length > 0)
                        if (!buffer2.isValue) {
                            type = "key";
                            string = token;
                            if (string.indexOf(" ") > -1) string = "'" + string + "'";
                            value = string;
                            break;
                        }
            }
            return {
                type: type,
                string: string,
                value: value,
                depth: buffer2.brackets.length,
            };
        });
        let clean = "";
        for (var i = 0; i < buffer2.tokens.length; i++) {
            let token = buffer2.tokens[i];
            clean += token.string;
        }
        function indent(number) {
            var space: string[] = [];
            for (var i = 0; i < number * 2; i++) space.push(" ");
            return (number > 0 ? "\n" : "") + space.join("");
        }
        let indentation = "";
        for (var i = 0; i < buffer2.tokens.length; i++) {
            let token = buffer2.tokens[i];
            switch (token.string) {
                case "[":
                case "{":
                    const nextToken: { type: string; string: string; depth: number } =
                        i < buffer2.tokens.length - 1 - 1 ? buffer2.tokens[i + 1] : { type: "", string: "", depth: 0 };
                    if ("}]".indexOf(nextToken.string) === -1) indentation += token.string + indent(token.depth);
                    else indentation += token.string;
                    break;
                case "]":
                case "}":
                    const prevToken: { type: string; string: string; depth: number } = i > 0 ? buffer2.tokens[i - 1] : { type: "", string: "", depth: 0 };
                    if ("[{".indexOf(prevToken.string) === -1) indentation += indent(token.depth) + token.string;
                    else indentation += token.string;
                    break;
                case ":":
                    indentation += token.string + " ";
                    break;
                case ",":
                    indentation += token.string + indent(token.depth);
                    break;
                default:
                    indentation += token.string;
                    break;
            }
        }
        let lines = 1;
        function indentII(number) {
            var space: string[] = [];
            if (number > 0) lines++;
            for (var i = 0; i < number * 2; i++) space.push("&nbsp;");
            return (number > 0 ? "<br>" : "") + space.join("");
        }
        let markup = "";
        const lastIndex = buffer2.tokens.length - 1;
        for (var i = 0; i < buffer2.tokens.length; i++) {
            let token = buffer2.tokens[i];
            let span = newSpan(i, token, token.depth, colors);
            switch (token.string) {
                case "{":
                case "[":
                    const nextToken: { type: string; string: string; depth: number } =
                        i < buffer2.tokens.length - 1 - 1 ? buffer2.tokens[i + 1] : { type: "", string: "", depth: 0 };
                    if ("}]".indexOf(nextToken.string) === -1) markup += span + indentII(token.depth);
                    else markup += span;
                    break;
                case "}":
                case "]":
                    const prevToken: { type: string; string: string; depth: number } = i > 0 ? buffer2.tokens[i - 1] : { type: "", string: "", depth: 0 };
                    if ("[{".indexOf(prevToken.string) === -1) markup += indentII(token.depth) + (lastIndex === i ? "<br>" : "") + span;
                    else markup += span;
                    break;
                case ":":
                    markup += span + " ";
                    break;
                case ",":
                    markup += span + indentII(token.depth);
                    break;
                default:
                    markup += span;
                    break;
            }
        }
        lines += 2;
        return {
            tokens: buffer2.tokens,
            noSpaces: clean,
            indented: indentation,
            json: JSON.stringify(something),
            jsObject: something,
            markup: markup,
            lines: lines,
        };
    }
};

const dark_theme = {
    default: "#D4D4D4",
    background: "#1E1E1E",
    background_warning: "#1E1E1E",
    string: "#CE8453",
    number: "#B5CE9F",
    colon: "#49B8F7",
    keys: "#9CDCFE",
    keys_whiteSpace: "#AF74A5",
    primitive: "#6392C6",
};

const light_theme = {
    default: "#333333",
    background: "#FCFDFD",
    background_warning: "#FFF3CD",
    string: "#FA7921",
    number: "#70CE35",
    colon: "#49B8F7",
    keys: "#007ACC",
    keys_whiteSpace: "#835FB6",
    primitive: "#386FA4",
    error: "#D32F2F",
};

const solarized_light = {
    default: "#586e75",
    background: "#fdf6e3",
    background_warning: "#ffe4b5",
    string: "#2aa198",
    number: "#b58900",
    colon: "#859900",
    keys: "#268bd2",
    keys_whiteSpace: "#6c71c4",
    primitive: "#dc322f",
    error: "#cb4b16",
};

const github_light = {
    default: "#24292e",
    background: "#ffffff",
    background_warning: "#fff5b1",
    string: "#032f62",
    number: "#005cc5",
    colon: "#e36209",
    keys: "#6f42c1",
    keys_whiteSpace: "#d73a49",
    primitive: "#22863a",
    error: "#d73a49",
};

const atom_theme = {
    default: "#C5C8C6",
    background: "#282C34",
    background_warning: "#3E4451",
    string: "#B5BD68",
    number: "#DE935F",
    colon: "#F0C674",
    keys: "#81A2BE",
    keys_whiteSpace: "#B294BB",
    primitive: "#CC6666",
};

const themes = {
    dark: dark_theme,
    light: light_theme,
    atom: atom_theme,
    solarized_light: solarized_light,
    github_light: github_light,
};

export { themes, tokenize };
