<template>
    <div>
        <h2>Posts Should Appear Here:</h2>
        <h3>Showing {{ posts.length }} images</h3>
        <ul class="image-grid" v-if="posts.length!==0">
            <li class="small-tile" v-for="post in posts" :key="post.url">
                {{ post.title }}
                <img :src="post.url"/>
            </li>
        </ul>
    </div>
</template>


<script>
import CryptoJS from 'crypto-js';
import snoowrap from 'snoowrap';
import throttle from 'lodash.throttle';
import secrets from '../secrets.json';

const imageExts = new Set();
["jpeg", "jpg", "png", "gif", 'tiff', 'bmp'].forEach(ext => imageExts.add(ext));

const getExtension = (filename) => (
    filename
        .split('?')[0]
        .slice(filename.lastIndexOf(".")+1)
        .toLowerCase()
)

export default {
    data() {
        return {
            runCount: 0,
            stream: {count: 0, after: null},
            posts: [],
            cache: []
        }
    },
    props: {
        subreddit: {
            type: String,
            default: 'pics'
        },
        order: {
            type: String,
            default: 'top'
        },
        options: {
            type: Object,
            default() {
                return {limit: 10};
            }
        },
        fetchmod: {
            type: Number,
            default: 5
        }
    },
    computed: { //watch multiple prop vals
        resetProps() {
            const {subreddit, order} = this;
            return {subreddit, order};
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

        async fetchImages(target, fetchPosts) {
            const added = this.cache.splice(0, this.cache.length); //clear cache and add

            const filterImages = posts =>
                posts.filter(post => imageExts.has(getExtension(post.url)));

            let tries = 0;
            const maxTries = 5;
            while(added.length < target && ++tries < maxTries) {
                const fetched = await fetchPosts();
                added.push(...filterImages(fetched));
                //console.log(`${added.length} vs ${limit}`)
            }

            const cachePoint = target - added.length; //negative or zero
            if (cachePoint) { //modifies added
                this.cache.push(...added.splice(cachePoint));
            }

            return added
        },

        async setPosts() {
            const runId = this.runCount;
            const target = this.options.limit - this.posts.length;
            const limit  = target + this.fetchmod;

            if (target < 0) //modifies posts immediately, maybe check runId?
                this.cache.shift( this.posts.splice(target) );
            if (target <= 0)
                return;

            const subRef = this.getRequester().getSubreddit(this.subreddit);
            const orderFunct = "get"
                .concat(this.order.charAt(0).toUpperCase())
                .concat(this.order.slice(1).toLowerCase());

            let { count, after } = this.stream;
            const fetchPosts = async () => {
                console.log('requesting')

                const fetched = await subRef[orderFunct]({ //adds after and count args
                    ...this.options, 
                    limit,
                    ...(count && {count, after})
                })
                //console.log(fetched);
                count += limit;
                after = fetched._query.after;
                return fetched;
            }

            const images = await this.fetchImages(target, fetchPosts);

            if (runId === this.runCount) { //race condition?
                this.stream = {count, after};
                this.posts.push(...images);
            }
        }
    },

    beforeCreate() {
        this.updatePosts = throttle(() => { //prevent excess calls
            //console.log('fetching')
            this.runCount++;
            this.setPosts()
                .catch(error => console.log(error));

        }, 0, {leading: false});
    }
    
}
</script>


<style scoped>

</style>
