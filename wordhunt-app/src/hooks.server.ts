import { read } from '$app/server';
import { dictionary, letterFrequency } from '$lib/server/dictionary';
import type { Handle } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import { redis } from '$lib/server/redis';

console.log('hooks.server - starting sveltekit server');
console.log('hooks.server - reading dictionary file');

const dictionaryFile = read('\\dictionary/csw21.json');
const text = await dictionaryFile.json(); // json array

text.forEach((word: string) => {
	dictionary.addWord(word);
});

console.log('hooks.server - dictionary loaded');
console.log('hooks.server - imported dictionary length: ', text.length);
console.log('hooks.server - loaded dictionary length: ', dictionary.length);

console.log('hooks.server - loading letter frequency file');
const letterFrequencyFile = read('\\dictionary/letter_distribution.json');
const letterFrequencyJson = await letterFrequencyFile.json();

Object.keys(letterFrequencyJson).forEach((key) => {
	letterFrequency[key] = letterFrequencyJson[key];
});

console.log('hooks.server - letter frequency loaded');
console.log('hooks.server - letter frequency: ', letterFrequency);
console.log('hooks.server - sveltekit server started');

console.log(`Redis ping: ${await redis.ping()}`);

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		// sveltekit types deviates from the de-facto standard
		// you can use 'as any' too
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};
