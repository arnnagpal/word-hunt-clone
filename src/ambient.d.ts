// eslint-disable-next-line @typescript-eslint/no-unused-vars
import mongoose from 'mongoose';

export enum UserRole {
	Admin = 'admin',
	User = 'user'
}

export class UserRoleType extends mongoose.SchemaType {
	constructor(key, options) {
		super(key, options, 'UserRole');
	}

	cast(val) {
		if (val == null) return '';
		if (typeof val !== 'string') {
			throw new Error('UserRole: val is not a string');
		}

		if (val !== UserRole.Admin && val !== UserRole.User) {
			throw new Error('UserRole: val is not a valid UserRole');
		}

		return val;
	}
}

export class GamePlayer extends mongoose.SchemaType {
	id: string;
	name: string;
	score: number;

	constructor(key, options) {
		super(key, options, 'GamePlayer');
	}

	cast(val) {
		if (val == null) return {};
		if (typeof val !== 'object') {
			throw new Error('GamePlayer: val is not an object');
		}

		// check if val is a valid GamePlayer object
		if (!val.id || !val.name || !val.score) {
			throw new Error('GamePlayer: val is not a valid GamePlayer object');
		}

		return {
			id: val.id,
			name: val.name,
			score: val.score
		};
	}
}

export class GameSession extends mongoose.SchemaType {
	id: string;
	players: GamePlayer[];
	board: Board;

	time_left?: number;

	created_at: Date;
	ended_at?: Date;

	single_player: boolean;
	session_type: SessionType;

	constructor(key, options) {
		super(key, options, 'GameSession');
	}

	cast(val) {
		if (val == null) return {};
		if (typeof val !== 'object') {
			throw new Error('GameSession: val is not an object');
		}

		// check if val is a valid GameSession object
		if (!val.id || !val.players || !val.board || !val.created_at || !val.single_player || !val.session_type) {
			throw new Error('GameSession: val is not a valid GameSession object');
		}

		const obj = {
			id: val.id,
			players: val.players,
			board: val.board,
			created_at: val.created_at,
			single_player: val.single_player,
			session_type: val.session_type
		};

		if (val.time_left) {
			obj.time_left = val.time_left;
		}

		if (val.ended_at) {
			obj.ended_at = val.ended_at;
		}

		return obj;
	}
}

mongoose.Schema.Types.GameSession = GameSession;
mongoose.Schema.Types.GamePlayer = GamePlayer;
mongoose.Schema.Types.UserRoleType = UserRoleType;


export enum SessionType {
	Active,
	Finished
}

export type Position = {
	x: number;
	y: number;
};

export type BoardSolution = {
	word: string;
	points: number;
};

export type ScoreEvent = {
	selectionStatus: WordSelectionState
	word: string;
	points: number;
};

export type TimeOverEvent = {
	words: number;
	score: number;
};

export enum Direction {
	Up,
	Down,
	Left,
	Right,
}

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
			if (word.length > 8) {
				return (400 * word.length) - 1000;
			}

			return 0;
	}
};

declare const Position: {
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

		this.board = [];
		for (let i = 0; i < size; i++) {
			this.board[i] = [];
			for (let j = 0; j < size; j++) {
				this.board[i][j] = '';
			}
		}
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
	set_from_coords = (y: number, x: number, value: string): void => {
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

declare const BoardSolution: {
	prototype: BoardSolution;
	new(): BoardSolution;
};

