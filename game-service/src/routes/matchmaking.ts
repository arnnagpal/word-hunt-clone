import {
    RouteType,
    Route,
    Router,
    MatchmakingJoin,
    MatchmakingLeave,
} from "./route";

export class MatchmakingRoute extends Route {
    private constructor(type: RouteType, data: any) {
        super(Router.Game, type, data);
    }

    exec() {
        console.log("Matchmaking exec");

        return {
            message: "Matchmaking exec",
        };
    }

    static join(data: any) {
        return new MatchmakingRoute(MatchmakingJoin, data);
    }

    static leave(data: any) {
        return new MatchmakingRoute(MatchmakingLeave, data);
    }

    static byType(type: RouteType, data: any) {
        return new MatchmakingRoute(type, data);
    }
}
