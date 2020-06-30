'use strict';

const CryptoJS = require("crypto-js");
const secrets = require('./secrets.json');
const snoowrap = require('snoowrap');


const imageExts = ["jpeg", "jpg", "png", "gif"];
const getExtension = (filename) => (
    filename
        .slice(filename.lastIndexOf(".")+1)
        .toLowerCase()
)

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

const printTopPosts = async (subreddit) => {
    const posts = await r.getSubreddit(subreddit)
        .getTop({limit: 10})
        .fetchMore({amount: 10, skipReplies: true, append: true});

    posts.filter(post => imageExts.includes( getExtension(post.url) ))
        .forEach((post, i) => {
            //console.log(getExtension(post.url));
            console.log(`${i}. ${post.title}: ${post.url}`);
        });
};

printTopPosts('pics');