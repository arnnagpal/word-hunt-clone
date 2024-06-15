import { Communication } from "./database/mongo";

export let localAuthId: string = "";

function generateNewAuthId() {
    return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    );
}

async function validateAuthId(authId: string): Promise<boolean> {
    // validate authId
    const auth = await Communication.findOne({ _id: authId }).exec();
    return !auth || auth.expires_at.getTime() < Date.now();
}

async function getLatestAuthId() {
    let latestIds = await Communication.find()
        .sort({ expires_at: -1 })
        .limit(1)
        .exec();

    if (latestIds.length === 0) {
        return createNewAuthId();
    }

    const latestId = latestIds[0];

    // check if it's expired
    const valid = validateAuthId(latestId._id);
    if (!valid) {
        return createNewAuthId();
    } else {
        return latestId._id;
    }
}

async function createNewAuthId() {
    const newAuthId = generateNewAuthId();
    await Communication.create({
        _id: newAuthId,
        expires_at: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
    });

    return newAuthId;
}

//TODO: get rid of this, had a plan for it, no longer do. private convo between frontend and websocket service is
// unnecessary and quite frankly tedious
// god help me
export async function setupAuthId() {
    localAuthId = await getLatestAuthId();
    console.log("Updated localAuthId to " + localAuthId);

    setInterval(async () => {
        localAuthId = await getLatestAuthId();
        console.log("Updated localAuthId to " + localAuthId);
    }, 1000 * 60 * 60); // 1 hour
}
