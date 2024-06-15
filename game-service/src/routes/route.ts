export abstract class Route {
    constructor(routeType: Router, type: RouteType, data: any) {}

    abstract exec(): object;
}

export enum Router {
    Game,
    Matchmaking,
}

export class RouteType {
    static types: RouteType[] = [];

    router: Router;
    name: string;
    constructor(router: Router, name: string) {
        RouteType.types.push(this);

        this.router = router;
        this.name = name;
    }

    static getAll() {
        return this.types;
    }

    static getByRouter(router: Router) {
        return this.types.filter((type) => type.router === router);
    }

    static get(router: Router, name: string) {
        return this.types.find(
            (type) => type.router === router && type.name === name
        );
    }
}

export const GameCreate = new RouteType(Router.Game, "create");
export const GameUpdate = new RouteType(Router.Game, "update");

export const MatchmakingJoin = new RouteType(Router.Matchmaking, "join");
export const MatchmakingLeave = new RouteType(Router.Matchmaking, "leave");
