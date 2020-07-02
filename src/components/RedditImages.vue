<template>
    <div>
        <h2>Posts Should Appear Here:</h2>
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
            stream: this.streamStart(),
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
        }
    },
    computed: { //watch multiple prop vals
        filterProps() {
            const {subreddit, order, options} = this;
            return {subreddit, order, options};
        }
    },

    watch: {
        filterProps: { //not computed since async
            immediate: true,
            deep: true,
            handler(newProps, oldProps) {
                if (oldProps) { //initial render will have no old
                    const {subreddit: oldSub, order: oldOrder} = oldProps;
                    const {subreddit: newSub, order: newOrder} = newProps;

                    if ((oldSub!==newSub) || (oldOrder!==newOrder))
                        this.stream = this.streamStart();
                }

                this.setPosts();
            }
        }
    },

    methods: {
        streamStart() {
            return {count: 0, after: null}
        },

        getRequester() {
            const username = CryptoJS.AES
                .decrypt(secrets.username, secrets.clientId)
                .toString(CryptoJS.enc.Utf8);

            const password = CryptoJS.AES
                .decrypt(secrets.password, secrets.clientId)
                .toString(CryptoJS.enc.Utf8);
                
            return new snoowrap({...secrets, username, password});
        },

        async getPosts() {
            const runId = this.runCount;
            const limit = this.options.limit - this.posts.length;

            //console.log('getting request')
            const subRef = this.getRequester().getSubreddit(this.subreddit);
            const orderFunct = "get"
                .concat(this.order.charAt(0).toUpperCase())
                .concat(this.order.slice(1).toLowerCase());

            let { count, after } = this.stream;
            const fetcher = async () => {
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

            const images = await this.imagePosts(limit, fetcher);

           if (runId === this.runCount) { //race condition?
                this.stream = {count, after};
                return images;
            } else {
                return undefined;
            }
        },

        async imagePosts(limit, fetcher) {
            let fetched = await fetcher();
            const filterImages = () => fetched
                .filter(post => imageExts.has(getExtension(post.url)));

            let tries = 0;
            const maxTries = 5;
            const added = this.cache.splice(0, this.cache.length) //clear cache and add
                .concat(filterImages());

            while(added.length < limit && ++tries < maxTries) {
                fetched = await fetcher();
                added.push(...filterImages());
            }
    
            const cachePoint = limit - added.length; //negative or zero
            if (cachePoint) { //modifies added 
                this.cache.push(...added.splice(cachePoint));
            }

            return added
        }
    },

    beforeCreate() {
        this.setPosts = throttle(() => { //prevent excess calls
            //console.log('fetching')
            this.runCount++;
            this.getPosts()
                .then(newPosts => {
                    if (newPosts) //can be undefined
                        this.posts = newPosts; })
                .catch(error => console.log(error));

        }, 0, {leading: false});
    }
    
}
</script>


<style scoped>

</style>