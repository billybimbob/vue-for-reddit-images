"use strict";

const AES = require("crypto-js/aes");
const secrets = require("./secrets.json");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

main();


async function waitQuestion(prompt) {
    const lineGen = (async function* () {
        for await (const line of rl)
            yield line;
    })();

    rl.setPrompt(prompt);
    rl.prompt();
    return (await lineGen.next()).value;
}

function main() {
    (async () => {
        const word = await waitQuestion('Enter in the word to hash: ');
        const encrypted = AES.encrypt(word, secrets.clientId);
        console.log(`Encrypted word is ${encrypted}`);
    })()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1)
        });
}