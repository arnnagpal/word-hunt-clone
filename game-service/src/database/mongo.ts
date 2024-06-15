import mongoose from "mongoose";
import dotenv from "dotenv";
import { dot } from "node:test/reporters";

if (!process.env.MONGO_URL) {
    dotenv.config();
}

const url = process.env.MONGO_URL;

if (!url) {
    throw new Error("MONGO_URL not set in .env");
}

await mongoose.connect(url);

const sessionSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        user_id: {
            type: String,
            required: true,
        },
        expires_at: {
            type: Date,
            required: true,
        },
    } as const,
    { _id: false }
);

const communicationSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        expires_at: {
            type: Date,
            required: true,
        },
    } as const,
    { _id: false }
);

export const Session =
    mongoose.models.session || mongoose.model("session", sessionSchema);

export const Communication =
    mongoose.models.private_session ||
    mongoose.model("private_session", communicationSchema);
