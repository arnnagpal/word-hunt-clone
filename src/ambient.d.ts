type Position = {
    x: number;
    y: number;
};

type BoardSolution = {
    word: string;
    points: number;
};

export enum WordSelectionState {
    NewWord,
    OldWord,
    NoWord
}

export const getPoints = (word: string): number => {
    switch (word.length) {
        case 3:
            return 100;
        case 4:
            return 400;
        case 5:
            return 800;
        case 6:
            return 1400;
        case 7:
            return 1800;
        case 8:
            return 2200;
        default:
            return 0;
    }
}

declare var Position: {
    prototype: Position;
    new(): Position;
};

export class Board {
    size: number;
    board: string[][];

    possible_solutions: BoardSolution[] = [];
    total_possible_score: number = 0;

    constructor(size: number) {
        this.size = size;
        this.board = Array(size).fill('').map(() => Array(size).fill(''));
    }

    get_from_pos = (pos: Position): string => {
        return this.get_from_coords(pos.x, pos.y);
    };
    get_from_coords = (x: number, y: number): string => {
        return this.board[x][y];
    };
    set_from_pos = (pos: Position, value: string): void => {
        this.set_from_coords(pos.x, pos.y, value);
    };
    set_from_coords = (x: number, y: number, value: string): void => {
        this.board[x][y] = value;
    };

    get_adjacent_positions = (pos: Position): Position[] => {
        const positions: Position[] = [];
        for (let x = pos.x - 1; x <= pos.x + 1; x++) {
            for (let y = pos.y - 1; y <= pos.y + 1; y++) {
                if (x >= 0 && x < this.size && y >= 0 && y < this.size && (x !== pos.x || y !== pos.y)) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    };

    get_adjacent_values = (pos: Position): string[] => {
        return this.get_adjacent_positions(pos).map((pos) => this.get_from_pos(pos));
    };

    get_possible_solutions = (): BoardSolution[] => {
        return this.possible_solutions;
    };

    get_total_possible_score = (): number => {
        return this.total_possible_score;
    };
}

declare var BoardSolution: {
    prototype: BoardSolution;
    new(): BoardSolution;
};

