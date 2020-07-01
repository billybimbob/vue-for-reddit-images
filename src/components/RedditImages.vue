<template>
    <div>
        <h2>Posts Should Appear Here:</h2>
        <ul v-if="posts.length!==0">
            <li v-for="post in posts" :key="post.url">
                {{ post.title }}
                <img :src="post.url"/>
            </li>
        </ul> 
    </div>
</template>


<script>
import CryptoJS from 'crypto-js';
import snoowrap from 'snoowrap';
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
            posts: [],
            cache: [],
            stream: {
                count: 0,
                after: null
            }
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
    watch: {
        $props: {
            handler() {
                this.getPosts().then(newPosts => this.posts = newPosts);
            },
            immediate: true
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

        async getPosts() {
            const { limit } = this.options;
            const subRef = this.getRequester().getSubreddit(this.subreddit);
            const orderFunct = "get"
                .concat(this.order.charAt(0).toUpperCase())
                .concat(this.order.slice(1).toLowerCase());

            const fetcher = async () => { //modifies stream data
                const fetched = await subRef[orderFunct]({ //adds after and count args
                    ...this.options, ...(this.stream.count && this.stream)
                })
                //console.log(fetched);
                this.stream.count += limit;
                this.stream.after = fetched._query.after;
                return fetched;
            }

            return await this.imagePosts(limit, fetcher);
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

    
}
</script>


<style scoped>

</style>