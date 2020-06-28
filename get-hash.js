"use strict";

const AES = require("crypto-js/aes");
const secrets = require("./secrets.json");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const getLine = async () => {
    const lineGen = (async function* () {
        for await (const line of rl) {
            yield line;
        }
    })();
    return (await lineGen.next()).value;
}

const main = async () => {
    console.log('Enter in the word to hash: ');
    const word = await getLine();
    
    const encrypted = AES.encrypt(word, secrets.clientId);
    console.log(`Encrypted word is ${encrypted}`);
    process.exit(0);
}

main();