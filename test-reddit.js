'use strict';

const CryptoJS = require("crypto-js");
const secrets = require('./secrets.json');
const snoowrap = require('snoowrap');


const imageExts = new Set();
["jpeg", "jpg", "png", "gif"].forEach(ext => imageExts.add(ext));

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
const cache = []; 
let fetchStream = undefined;


const imagePosts = async (amount=10, perFetch=15) => {
    const filterImages = () => fetchStream
        .filter(post => imageExts.has(getExtension(post.url)));

    let tries = 0;
    const maxTries = 5;
    const added = cache.splice(0, cache.length)
        .concat(filterImages());

    while(added.length < amount && ++tries < maxTries) {
        fetchStream = await fetchStream
            .fetchMore({amount: perFetch, skipReplies: true, append: false});
        added.push(...filterImages());
    }
    
    const cachePoint = amount - added.length;
    if (cachePoint) {
        const newCache = added.splice(cachePoint); //modifies added    
        cache.push(...newCache);
    }

    return added;
}

const getPosts = async (subreddit, order='top', options={}) => {
    const { limit=10 } = options;
    const orderFunct = `get${order.charAt(0).toUpperCase()}${order.slice(1)}`;
    
    if (subreddit && !fetchStream) //don't fetch initially
        fetchStream = await r.getSubreddit(subreddit)[orderFunct]({...options, limit: 0});

    fetchStream = await fetchStream
        .fetchMore({amount: 15, skipReplies: true, append: false});

    return await imagePosts(limit);
}


const printPosts = async (...getArgs) => {
    const posts = await getPosts(...getArgs);

    console.log('Fetch Stream:')
    fetchStream.forEach((post, i) => {
        console.log(`${i}. ${post.title}: ${post.url}`);
    });
    
    console.log('Posts:')
    posts.forEach((post, i) => {
        console.log(`${i}. ${post.title}: ${post.url}`);
    });

    console.log('Cache:')
    cache.forEach((post, i) => {
        console.log(`${i}. ${post.title}: ${post.url}`);
    });
};

printPosts('hearthstone', 'top', {limit: 5})
    //.then(() => printPosts('pics', 'top', {limit: 10}));