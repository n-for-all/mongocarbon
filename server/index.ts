import chalk from "chalk";
import remixFastify from "./adapter.js";
import { fastify } from "fastify";
import sourceMapSupport from "source-map-support";
import getPort, { portNumbers } from "get-port";
import collectionRoutes from "./routes/collection.js";

sourceMapSupport.install();

let app = fastify();

await app.register(remixFastify);

async function start() {

    app.register(collectionRoutes, { prefix: "/api/collections" });

    let host = process.env.HOST || "127.0.0.1";
    let desiredPort = Number(process.env.PORT) || 3000;
    let portToUse = await getPort({
        port: portNumbers(desiredPort, desiredPort + 100),
    });

    let address = await app.listen({ port: portToUse, host });

    if (portToUse !== desiredPort) {
        console.warn(chalk.yellow(`⚠️ Port ${desiredPort} is not available, using ${portToUse} instead.`));
    }

    console.log(chalk.green(`✅ app ready: ${address}`));
}

start();
