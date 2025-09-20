export default async (app) => {
    app.get("/collections", async (request, reply) => {
        return reply.send({ collections: ["collection1", "collection2"] });
    });
    app.get("/test", async (request, reply) => {
        return reply.send({ collections: ["collection1", "collection2"] });
    });
};
