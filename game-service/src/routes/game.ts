import { RouteType, Route, Router, GameCreate, GameUpdate } from "./route";

export class GameRoute extends Route {
    private constructor(type: RouteType, data: any) {
        super(Router.Game, type, data);
    }

    exec() {
        console.log("GameRoute exec");

        return {
            message: "GameRoute exec",
        };
    }

    static create(data: any) {
        return new GameRoute(GameCreate, data);
    }

    static update(data: any) {
        return new GameRoute(GameUpdate, data);
    }

    static byType(type: RouteType, data: any) {
        return new GameRoute(type, data);
    }
}
