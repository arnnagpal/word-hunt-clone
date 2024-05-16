// eslint-disable-next-line @typescript-eslint/no-unused-vars
import mongoose from 'mongoose';

export enum UpdateType {
	LetterSelection,
	ClearSelection,
	SubmitSelection,
	TimeUpdate,
	JoinedGame
}

export enum GamePreset {
	Classic = 90,
	Unlimited = -1
}

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
	words: string[];
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
		if (!val.id || !val.words || !val.score) {
			throw new Error('GamePlayer: val is not a valid GamePlayer object');
		}

		return {
			id: val.id,
			words: val.words,
			score: val.score
		};
	}
}

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

export type SelectionEvent = {
	letter: string;
	letterRow: number;
	letterColumn: number;
	letterIndex: number;

	selectionStatus: WordSelectionState;
	wholeWord: string;
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

	is_solution = (word: string): boolean => {
		return this.possible_solutions.some((solution) => solution.word.toUpperCase() === word.toUpperCase());
	}

	get_total_possible_score = (): number => {
		return this.total_possible_score;
	};

	toJSON = (): string => {
		return JSON.stringify({
			size: this.size,
			board: this.board,
			possible_solutions: this.possible_solutions,
			total_possible_score: this.total_possible_score
		});
	}

	static fromJSON = (json: string): Board => {
		const obj = JSON.parse(json);
		const board = new Board(obj.size);
		board.board = obj.board;
		board.possible_solutions = obj.possible_solutions;
		board.total_possible_score = obj.total_possible_score;
		return board;
	}
}

declare const BoardSolution: {
	prototype: BoardSolution;
	new(): BoardSolution;
};

