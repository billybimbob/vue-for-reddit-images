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
            r: this.getRequester(),
            posts: [],
            cache: [],
            fetchStream: undefined
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
                return {};
            }
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

        async imagePosts(amount=10) {
            const filterImages = () => this.fetchStream
                .filter(post => imageExts.has(getExtension(post.url)));

            let tries = 0;
            const maxTries = 5;
            const added = this.cache.splice(0, this.cache.length) //clear cache and add
                .concat(filterImages());

            while(added.length < amount && ++tries < maxTries) {
                this.fetchStream = await this.fetchStream
                    .fetchMore({amount, skipReplies: true, append: false});
                added.push(...filterImages());
            }

            const cachePoint = amount - added.length; //negative or zero
            if (cachePoint) { //modifies added
                this.cache.push(...added.splice(cachePoint));
            }

            return added
        },

        async getPosts(subreddit, order='top', options={}) {
            const { limit=10 } = options;
            const orderFunct = `get${order.charAt(0).toUpperCase()}${order.slice(1)}`;

            this.fetchStream = await //(subreddit && !this.fetchStream
                this.r.getSubreddit(subreddit)[orderFunct](options)
                //: this.fetchStream.fetchMore({amount: limit, skipReplies: true, append: false}));

            console.log('getting stream', Object.prototype.toString.apply(this.fetchStream));

            this.fetchStream.forEach((post => {
                console.log(post.title);
            }));

            return await this.imagePosts(limit);
        }
    },

    mounted() {
        console.log('getting posts')
        this.getPosts(this.subreddit, this.order, this.options)
            .then(fetched => this.posts = fetched);

    },


}
</script>


<style scoped>

</style>
