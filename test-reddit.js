'use strict';

const CryptoJS = require("crypto-js");
const secrets = require('./secrets.json');
const snoowrap = require('snoowrap');


const getRequester = () => {
    const username = CryptoJS.AES
        .decrypt(secrets.username, secrets.clientId)
        .toString(CryptoJS.enc.Utf8);

    const password = CryptoJS.AES
        .decrypt(secrets.password, secrets.clientId)
        .toString(CryptoJS.enc.Utf8);
        
    return new snoowrap({...secrets, username, password});
}

const r = getRequester();
r.getSubreddit('AskReddit')
    .getWikiPage('bestof')
    .content_md
    .then(console.log);