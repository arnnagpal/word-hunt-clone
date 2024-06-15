import fastify from "fastify";
import dotenv from "dotenv";
import fastifyWebsocket from "@fastify/websocket";
import { Session } from "./database/mongo";
import { setupAuthId } from "./privateAuth";
import { isJsonString } from "./util";
import { RouteType, Router } from "./routes/route";
import { GameRoute } from "./routes/game";
import { MatchmakingRoute } from "./routes/matchmaking";

dotenv.config();

const port = Number.parseInt(process.env.PORT || "3000");

const server = fastify();

server.register(fastifyWebsocket);

// proof of concept first

//               sessionId, socketId
let users = new Map<string, string>();

async function validateSessionId(sessionId: string): Promise<boolean> {
    // validate sessionId
    const session = await Session.findOne({ _id: sessionId }).exec();
    return !session || session.expires_at.getTime() < Date.now();
}

function validateMessage(data: any) {
    /**
        {
            "route": "game",
            "type": "create",
            "data": {
                "timer": 22,
                "singleplayer": false
            }
        }
     */

    return data.route && data.type && data.data;
}

server.addHook("preValidation", async (request, reply) => {
    const query = request.query as any;
    if (!query.sessionId) {
        reply.code(403).send("Connection rejected");
        return;
    }

    if (users.has(query.sessionId as string)) {
        reply.code(403).send("Connection rejected");
    }

    // validate sessionId
    if (!validateSessionId(query.sessionId as string)) {
        reply.code(403).send("Connection rejected");
    }
});

server.register(async function (fastify) {
    fastify.get(
        "/",
        { websocket: true },
        (socket /* WebSocket */, req /* FastifyRequest */) => {
            const query = req.query as any;
            users.set(query.sessionId as string, req.id);

            socket.on("message", (message) => {
                // needs to be handled accordingly
                // check if message is in json
                if (!isJsonString(message.toString())) {
                    return;
                }

                const data = JSON.parse(message.toString());

                if (!validateMessage(data)) {
                    return;
                }

                // convert game.route to Router

                // check if route exists
                const routes = Object.keys(Router)
                    .filter((item) => {
                        return isNaN(Number(item));
                    })
                    .map((item) => {
                        return item.toLowerCase();
                    });

                let index = routes.indexOf(data.route.toLowerCase());

                if (index === -1) {
                    return;
                }

                // check if type exists
                const type = RouteType.get(
                    index as Router,
                    data.type.toLowerCase()
                );

                if (!type) {
                    return;
                }

                // call the route
                if (type.router === Router.Game) {
                    socket.send(
                        JSON.stringify(GameRoute.byType(type, data.data).exec())
                    );
                }

                // call the route
                if (type.router === Router.Matchmaking) {
                    socket.send(
                        JSON.stringify(
                            MatchmakingRoute.byType(type, data.data).exec()
                        )
                    );
                }
            });

            socket.on("close", () => {
                // the connection has been closed
                console.log(
                    `Connection closed, removing ${query.sessionId} from map`
                );
                users.delete(query.sessionId as string);
            });
        }
    );
});

server.listen({ port: port, host: "0.0.0.0" }, async (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server listening at ${address}`);

    await setupAuthId();
});
