import fastify from "fastify";
import dotenv from "dotenv";

dotenv.config();

const port = Number.parseInt(process.env.PORT || "3000");

const server = fastify();

server.get("/", async (request, reply) => {
    reply.send({ hello: "world" });
});

server.listen({port: port, host: '0.0.0.0'}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    
    console.log(`Server listening at ${address}`);
});