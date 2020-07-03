<template>
    <div class="images">
        <h2>Posts Should Appear Here:</h2>
        <h3>Showing {{ posts.length }} images</h3>
        <ul class="image-grid" v-if="posts.length!==0">
            <li class="small-tile" v-for="post in posts" :key="post.url">
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
            requester: null,
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

        checkedChange(changeCallback, {runId}) {
            if (runId === this.runCount)
                changeCallback();
        },

        async fetchImages(fetchPosts, {target=1}) {
            const images = [...this.cache]; //copy cache

            const filterImages = posts =>
                posts.filter(post => imageExts.has(getExtension(post.url)));

            let tries = 0;
            const maxTries = 5;
            while(images.length < target && tries++ < maxTries) {
                const fetched = await fetchPosts();
                images.push(...filterImages(fetched));
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


<style scoped>
.images {
    width: 91%;
    float: right;
}

.image-grid {
    list-style: none;
    line-height: 0;
    -webkit-column-count: 5;
    -webkit-column-gap:   0px;
    -moz-column-count:    5;
    -moz-column-gap:      0px;
    column-count:         5;
    column-gap:           0px;
}

.small-tile img {
    max-width: 100%;
    max-height: 100%;
}

@media (max-width: 1200px) {
    .image-grid {
        -moz-column-count:    4;
        -webkit-column-count: 4;
        column-count:         4;
    }
}
@media (max-width: 1000px) {
    .image-grid {
        -moz-column-count:    3;
        -webkit-column-count: 3;
        column-count:         3;
    }
}
@media (max-width: 800px) {
    .image-grid {
        -moz-column-count:    2;
        -webkit-column-count: 2;
        column-count:         2;
    }
}
@media (max-width: 400px) {
    .image-grid {
        -moz-column-count:    1;
        -webkit-column-count: 1;
        column-count:         1;
    }
}
</style>
