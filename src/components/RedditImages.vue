<template>
    <!--
        limit redditPosts to only render
        what's on screen
    -->
    <LazyGallery :posts="posts" :isLoading="isLoading"
        :slideshow="slideshow" :autoload="autoload"
        @moreposts="morePosts" />
</template>


<script>
import CryptoJS from 'crypto-js';
import snoowrap from 'snoowrap';
import throttle from 'lodash.throttle';
import secrets from '../secrets.json';
import LazyGallery from './gallery/LazyGallery';

const imageExts = new Set(["jpeg", "jpg", "png", "gif", 'tiff', 'bmp']);

const getExtension = (filename) => (
    filename
        .split('?')[0]
        .slice(filename.lastIndexOf(".")+1)
        .toLowerCase()
)

const reddit = "//reddit.com";


export default {
    components: {
        LazyGallery
    },

    data() {
        return {
            runCount: 0,
            requester: null,
            stream: {count: 0, after: null},
            cache: [],
            redditPosts: [],
            isLoading: false
        }
    },
    props: {
        subreddit: {
            type: String,
            required: true
        },
        order: {
            type: String,
            default: 'hot'
        },
        options: {
            type: Object,
            default() {
                return this.defaultOptions();
            },
            validator(value) {
                return value.limit && value.limit>=0 &&
                    (!value.fetchmod || value.fetchmod>=0);
            }
        }
    },
    computed: {
        fetchmod () { return this.getOptionsAttr('fetchmod'); },
        slideshow() { return this.getOptionsAttr('slideshow'); },
        autoload () { return this.getOptionsAttr('autoload'); },

        settings() { //normalized options props
            const normal = {
                ...this.defaultOptions(),
                ...this.options
            };
            delete normal.fetchmod;
            delete normal.slideshow;
            delete normal.autoload;
            return normal;
        },
        // to watch multiple prop vals
        resetProps() {
            const {subreddit, order} = this;
            const {time} = this.settings;
            return {subreddit, order, time};
        },
        filterProps() {
            const {subreddit, order, settings} = this;
            return {subreddit, order, settings};
        },

        posts() {
            return this.redditPosts.map(post => ({
                id: post.id,
                title: post.title, 
                img: post.url,
                url: reddit + post.permalink
            }));
        }
    },

    watch: {
        resetProps(newProps, oldProps) {
            const sameVals = Object.keys(newProps).reduce((isSame, prop) => (
                isSame && newProps[prop]===oldProps[prop]
            ), true);

            if (!sameVals) {
                console.log('reseting')
                this.redditPosts = [];
                this.cache = [];
                this.stream = {count: 0, after: null};
            }
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
        defaultOptions: () => ({ //immutable
            limit: 10,
            time: 'any',
            fetchmod: 10,
            slideshow: false,
            autoload: false
        }),
        
        getOptionsAttr(attr) {
            return attr in this.options
                ? this.options[attr]
                : this.defaultOptions()[attr];
        },

        getRequester() {
            const username = CryptoJS.AES
                .decrypt(secrets.username, secrets.clientId)
                .toString(CryptoJS.enc.Utf8);

            const password = CryptoJS.AES
                .decrypt(secrets.password, secrets.clientId)
                .toString(CryptoJS.enc.Utf8);

            const r = new snoowrap({...secrets, username, password});
            r.config({continueAfterRatelimitError: true, }); //debug: true});
            
            return r;
        },

        morePosts(moreAmnt) {
            //increase fetch exponentially?
            if (moreAmnt) {
                this.$emit('update:limit', this.settings.limit + moreAmnt);
            } else {
                this.$emit('update:limit', this.settings.limit + this.fetchmod*2);
            }
        },

        checkedChange(changeCallback, {runId}) {
            if (runId === this.runCount)
                changeCallback();
            else
                throw new Error(`run ${runId} was not able to run callback`)
        },

        async fetchImages(fetchPosts, {target=1}) {
            const images = []; //copy cache
            const uniques = new Set();

            const addImages = (adding) => {
                images.push(...adding);
                adding.map(add => add.id)
                    .forEach(id => uniques.add(id));
            }
            const filterImages = (redditPosts) => (
                redditPosts.filter(post => post.author.name!=='[deleted]'
                    && !uniques.has(post.id)
                    && imageExts.has(getExtension(post.url)) )
            )

            addImages(this.cache);
            let tries = 0;
            const MAX_TRIES = 5;

            while(images.length < target && tries++ < MAX_TRIES) {
                const fetched = await fetchPosts();
                addImages(filterImages(fetched));
            }

            return images;
        },


        async setPosts() { //modifies data values
            const runId = this.runCount;
            const target = this.settings.limit - this.redditPosts.length;

            if (target === 0) {
                return;
            } else if (target < 0) {
                this.checkedChange(() => {
                    this.cache.unshift( ...this.redditPosts.splice(target) );
                }, {runId});
                return;
            }

            const subRef = this.requester.getSubreddit(this.subreddit);
            const orderFunct = "get"
                .concat(this.order.charAt(0).toUpperCase())
                .concat(this.order.slice(1).toLowerCase());

            const limit = target + this.fetchmod;
            let { count, after } = this.stream;

            // potential issue when api posts order changes
            const fetchPosts = async () => {
                console.log('requesting')
                const fetched = await subRef[orderFunct]({
                    ...this.settings,
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
                this.redditPosts.push(...images);

            }, {runId});
        }
    },

    beforeCreate() {
        this.updatePosts = throttle(() => { //prevent excess calls
            this.runCount++;
            this.isLoading = true;
            this.setPosts()
                .then(() => {
                    this.isLoading = false;
                })
                .catch(error => {
                    console.log(`${error.name}: ${error.message}`)
                });
        }, 0, {leading: false});
    },

    created() {
        this.requester = this.getRequester();
    }

}
</script>
