import mongoose from 'mongoose';
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';
import dotenv from 'dotenv';
import { GamePlayer, UserRoleType } from 'ambient';

if (!process.env.MONGO_URL) {
	dotenv.config();
}


const url = process.env.MONGO_URL;

if (!url) {
	throw new Error('MONGO_URL not set in .env');
}


await mongoose.connect(url);

function toLower (v: string) {
	return v.toLowerCase();
}

const userSchema =
	new mongoose.Schema(
		{
			_id: {
				type: String,
				required: true
			},
			email: {
				type: String,
				required: true,
			  set: toLower
			},
			username: {
				type: String,
				required: true,
				set: toLower
			},
			display_name: {
				type: String,
				required: true
			},
			password_hash: {
				type: String,
				required: true
			},

			// glicko-2 rating system			
			rating: {
				type: Number,
				required: true
			},
			rating_deviation: {
				type: Number,
				required: true
			},
			rating_volatility: {
				type: Number,
				required: true
			},
			games: {
				type: [String],
				required: true
			},
			role: {
				type: UserRoleType,
				required: true
			}
		} as const,
		{ _id: false }
	);

const sessionSchema =
	new mongoose.Schema(
		{
			_id: {
				type: String,
				required: true
			},
			user_id: {
				type: String,
				required: true
			},
			expires_at: {
				type: Date,
				required: true
			}
		} as const,
		{ _id: false }
	);

const gameSchema =
	new mongoose.Schema(
		{
			_id: {
				type: String,
				required: true
			},
			session_type: {
				type: Number,
				required: true
			},
			players: {
				type: [GamePlayer],
				required: true
			},
			winner: {
				type: String,
				required: false
			},
			board: {
				type: [String],
				required: true
			},
			created_at: {
				type: Number,
				required: true
			},
			ended_at: {
				type: Number,
				required: false
			},
			single_player: {
				type: Boolean,
				required: true
			}
		} as const,
		{ _id: false }
	);

export const User = mongoose.models.user || mongoose.model('user', userSchema);
export const Session = mongoose.models.session || mongoose.model('session', sessionSchema);

export const Game = mongoose.models.game || mongoose.model('game', gameSchema);

export const mongoAdapter = new MongodbAdapter(
	// @ts-expect-error - this is correct, dunno why that happens
	mongoose.connection.collection("sessions"),
	mongoose.connection.collection("users")
);