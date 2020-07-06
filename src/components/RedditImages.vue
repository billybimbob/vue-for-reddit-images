<template>
    <!--
        could limit posts to only render
        what's on screen
    -->
    <Gallery :posts="posts"/>
</template>


<script>
import CryptoJS from 'crypto-js';
import snoowrap from 'snoowrap';
import throttle from 'lodash.throttle';
import secrets from '../secrets.json';
import Gallery from './Gallery';

const imageExts = new Set();
["jpeg", "jpg", "png", "gif", 'tiff', 'bmp'].forEach(ext => imageExts.add(ext));

const getExtension = (filename) => (
    filename
        .split('?')[0]
        .slice(filename.lastIndexOf(".")+1)
        .toLowerCase()
)

const imageDimension = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const {height, width} = img;
            resolve({height, width});
        };
        img.onerror = reject;
        img.src = url;
    });
}

const reddit = "//reddit.com";


export default {
    components: {
        Gallery
    },

    data() {
        return {
            runCount: 0,
            requester: null,
            stream: {count: 0, after: null},
            cache: [],
            posts: []
        }
    },
    props: {
        subreddit: {
            type: String,
            default: 'pics'
        },
        order: {
            type: String,
            default: 'hot'
        },
        options: {
            type: Object,
            default() {
                return {limit: 10};
            }
        },
        fetchmod: {
            type: Number,
            default: 10
        }
    },
    computed: { //watch multiple prop vals
        resetProps() {
            const {subreddit, order} = this;
            const {time} = this.options;
            return {subreddit, order, time};
        },
        filterProps() {
            const {subreddit, order, options} = this;
            return {subreddit, order, options};
        }
    },

    watch: {
        resetProps() {
            console.log('reseting')
            this.posts = [];
            this.cache = [];
            this.stream = {count: 0, after: null};
        },
        filterProps: { //should run after reset
            handler() {
                console.log('updating post')
                this.updatePosts();
            },
            immediate: true,
            deep: true
        }
    },

    methods: {
        getRequester() {
            const username = CryptoJS.AES
                .decrypt(secrets.username, secrets.clientId)
                .toString(CryptoJS.enc.Utf8);

            const password = CryptoJS.AES
                .decrypt(secrets.password, secrets.clientId)
                .toString(CryptoJS.enc.Utf8);

            return new snoowrap({...secrets, username, password});
        },

        checkedChange(changeCallback, {runId}) {
            if (runId === this.runCount)
                changeCallback();
        },

        async fetchImages(fetchPosts, {target=1}) {
            const images = [...this.cache]; //copy cache

            const filterImages = async (posts) => ( //render image twice, not great
                await Promise.all( posts
                    .filter(post => post.author.name!=='[deleted]'
                        && imageExts.has(getExtension(post.url)) )
                    .map(async (post) => {
                        const dim = await imageDimension(post.url);
                        const link = reddit + post.permalink;
                        return {...post, dim, link}; }) )
            )

            let tries = 0;
            const maxTries = 5;
            while(images.length < target && tries++ < maxTries) {
                const fetched = await fetchPosts();
                images.push(...(await filterImages(fetched)));
                //console.log(`${images.length} vs ${limit}`)
            }

            return images;
        },

        async setPosts() { //modifies data values
            const runId = this.runCount;
            const target = this.options.limit - this.posts.length;

            if (target === 0) {
                return;
            } else if (target < 0) {
                this.checkedChange(() => {
                    this.cache.unshift( ...this.posts.splice(target) );
                }, {runId});
                return;
            }

            const subRef = this.requester.getSubreddit(this.subreddit);
            const orderFunct = "get"
                .concat(this.order.charAt(0).toUpperCase())
                .concat(this.order.slice(1).toLowerCase());

            const limit = target + this.fetchmod;
            let { count, after } = this.stream;

            const fetchPosts = async () => {
                console.log('requesting')
                const fetched = await subRef[orderFunct]({
                    ...this.options,
                    ...(count && {count, after}),
                    limit
                })
                count += limit;
                after = fetched._query.after;

                return fetched;
            }

            const images = await this.fetchImages(fetchPosts, {target});

            //sync point, changes data values, race condition?
            this.checkedChange(() => {
                this.cache.splice(0); //clear cache
                const cachePoint = target - images.length; //negative or zero
                if (cachePoint) {
                    this.cache.push( ...images.splice(cachePoint) );
                }

                this.stream = {count, after};
                this.posts.push(...images);

            }, {runId});
        }
    },

    beforeCreate() {
        this.updatePosts = throttle(() => { //prevent excess calls
            //console.log('fetching')
            this.runCount++;
            this.setPosts()
                .catch(error => console.log(error));
        }, 0, {leading: false});
    },

    created() {
        this.requester = this.getRequester();
    }

}
</script>
