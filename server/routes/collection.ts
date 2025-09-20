import { FastifyInstance } from "fastify";

export default async (app: FastifyInstance) => {
    app.get("/collections", async (request, reply) => {
        return reply.send({ collections: ["collection1", "collection2"] });
    });
    app.get("/test", async (request, reply) => {
        return reply.send({ collections: ["collection1", "collection2"] });
    });
};
