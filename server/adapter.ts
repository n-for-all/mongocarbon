"use strict";

import fastifyPlugin from "fastify-plugin";
import path from "path";
import url from "url";
import fastifyStatic from "@fastify/static";

import { createReadableStreamFromReadable, createRequestHandler as createRemixRequestHandler } from "@remix-run/node";
import { Readable } from "node:stream";

/**
 * Constructs a URL object from protocol, hostname, and original URL.
 * @param {string} protocol - Protocol (e.g., 'http', 'https').
 * @param {string} hostname - Hostname.
 * @param {string} originalUrl - Original URL.
 * @returns {URL} URL object.
 */
const getUrl = (protocol, hostname, originalUrl) => new URL(`${protocol}://${hostname}${originalUrl}`);

/**
 * Converts a Fastify request to a Remix-compatible request.
 * @param {import('fastify').FastifyRequest} request - Fastify request.
 * @param {import('fastify').FastifyReply} reply - Fastify reply.
 * @returns {Request} Remix request.
 */
const createFastifyRemixRequest = (request, reply) => {
    const url = getUrl(request.protocol, request.hostname, request.originalUrl);
    let abortController: AbortController | null = new AbortController();

    reply.raw.on("finish", () => (abortController = null));
    reply.raw.on("close", () => abortController?.abort());

    const init: {
        method: string;
        headers: Headers;
        body?: ReadableStream<Uint8Array>;
        signal: AbortSignal;
        duplex?: "half";
    } = {
        method: request.method,
        headers: request.headers,
        signal: abortController.signal,
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
        init.body = createReadableStreamFromReadable(request.raw);
        init.duplex = "half";
    }

    return new Request(url, init);
};

/**
 * Converts a Response object to a Readable stream.
 * @param {Response} response - Response object.
 * @returns {Readable|null} Readable stream or null if no body.
 */
const responseToReadable = (response) => {
    if (!response.body) return null;

    const reader = response.body.getReader();

    return new Readable({
        read() {
            reader.read().then(
                ({ done, value }) => {
                    if (done) {
                        this.push(null);
                        return reader.cancel();
                    }
                    this.push(Buffer.from(value));
                },
                (error) => this.destroy(error)
            );
        },
        destroy(error, callback) {
            reader
                .cancel(error)
                .then(() => {
                    callback(error);
                })
                .catch((err) => {
                    callback(err);
                });
        },
    });
};

/**
 * Sends a Remix response via Fastify.
 * @param {import('fastify').FastifyReply} reply - Fastify reply.
 * @param {Response} result - Remix response.
 * @returns {Promise<void>} Promise resolving when response is sent.
 */
const sendFastifyRemixResponse = async (reply, result) => {
    reply.status(result.status);
    reply.headers(Object.fromEntries(result.headers));
    return result.body ? reply.send(responseToReadable(result.clone())) : reply.send(await result.text());
};

/**
 * Creates a Remix request handler for Fastify.
 * @param {Object} options - Request handler options.
 * @param {Object} options.build - Build object.
 * @param {Function} [options.getLoadContext] - Function to get load context.
 * @param {string} options.mode - Mode ('development' or 'production').
 * @returns {Function} Request handler function.
 */
const createRequestHandler = ({ build, getLoadContext, mode }) => {
    const handler = createRemixRequestHandler(build, mode);

    return async (request, reply) => {
        try {
            const remixRequest = createFastifyRemixRequest(request, reply);
            const loadContext = getLoadContext ? await getLoadContext(request, reply) : undefined;
            const result = await handler(remixRequest, loadContext);
            return sendFastifyRemixResponse(reply, result);
        } catch (error) {
            return reply.status(500).send("Internal Server Error");
        }
    };
};

/**
 * Creates the Remix Fastify plugin.
 * @param {Object} [options] - Plugin options.
 * @param {string} [options.buildDirectory='build'] - Build directory.
 * @param {string} [options.clientDirectory='client'] - Client directory.
 * @param {string} [options.serverDirectory='server'] - Server directory.
 * @param {string} [options.serverBuildFile='index.js'] - Server build file.
 * @param {string} [options.mode=process.env.NODE_ENV || 'development'] - Mode.
 * @param {Object} [options.fastifyStaticOptions={}] - Fastify static options.
 * @param {Object} [options.viteOptions={}] - Vite options.
 * @returns {Function} Fastify plugin function.
 */
import { FastifyPluginAsync, FastifyPluginOptions } from "fastify";

type RemixFastifyPluginOptions = FastifyPluginOptions & {
    buildDirectory?: string;
    clientDirectory?: string;
    serverDirectory?: string;
    serverBuildFile?: string;
    mode?: "development" | "production" | "test";
    fastifyStaticOptions?: object;
    viteOptions?: object;
};

const remixFastify: FastifyPluginAsync<RemixFastifyPluginOptions> = async (fastify, options = {}) => {
    const {
        buildDirectory = "build",
        clientDirectory = "client",
        serverDirectory = "server",
        serverBuildFile = "index.js",
        mode = process.env.NODE_ENV || "development",
        fastifyStaticOptions = {},
        viteOptions = {},
    }: RemixFastifyPluginOptions = options;

    let viteDevServer;

    if (mode === "development") {
        const { createServer } = await import("vite");
        viteDevServer = await createServer({
            ...viteOptions,
            server: { middlewareMode: true, ...(viteOptions as any)?.server },
        });
    }

    const cwd = process.cwd();
    const serverBuildUrl = url.pathToFileURL(path.join(cwd, buildDirectory, serverDirectory, serverBuildFile)).href;

    const remixHandler = createRequestHandler({
        build: viteDevServer ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build") : async () => await import(serverBuildUrl),
        getLoadContext: undefined,
        mode,
    });

    if (viteDevServer) {
        await fastify.register(import("@fastify/middie"));
        (fastify as any).use(viteDevServer.middlewares);
    } else {
        const clientBuildDirectory = path.join(cwd, buildDirectory, clientDirectory);
        await fastify.register(fastifyStatic, {
            root: clientBuildDirectory,
            prefix: "/",
            wildcard: false,
            dotfiles: "allow",
            etag: true,
            serveDotFiles: true,
            lastModified: true,
            ...fastifyStaticOptions,
        });
    }

    fastify.register(async function createRemixRequestHandler(childServer) {
        childServer.removeAllContentTypeParsers();
        childServer.addContentTypeParser("*", (_request, payload, done) => {
            done(null, payload);
        });
        childServer.all("*", remixHandler);
    });
};

const remixFastifyPlugin = fastifyPlugin(remixFastify, {
    fastify: "5.x",
    name: "remix-fastify",
});

export { remixFastifyPlugin as plugin };

export default remixFastify;
