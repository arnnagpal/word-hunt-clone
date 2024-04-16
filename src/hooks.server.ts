import { read } from "$app/server";
import { dictionary, letterFrequency } from "$lib/server/dictionary";

console.log("hooks.server - starting sveltekit server");
console.log("hooks.server - reading dictionary file");

const dictionaryFile = read("\\dictionary/csw21.json");
const text = await dictionaryFile.json(); // json array

text.forEach((word: string) => {
    dictionary.addWord(word);
});

console.log("hooks.server - dictionary loaded");
console.log("hooks.server - imported dictionary length: ", text.length);
console.log("hooks.server - loaded dictionary length: ", dictionary.length);

console.log("hooks.server - loading letter frequency file");
const letterFrequencyFile = read("\\dictionary/letter_distribution.json");
const letterFrequencyJson = await letterFrequencyFile.json();

Object.keys(letterFrequencyJson).forEach((key) => {
    letterFrequency[key] = letterFrequencyJson[key];
});

console.log("hooks.server - letter frequency loaded");
console.log("hooks.server - letter frequency: ", letterFrequency);

console.log("hooks.server - sveltekit server started");
