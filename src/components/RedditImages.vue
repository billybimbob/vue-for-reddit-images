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
            fetchmod: 20,
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
            if (!moreAmnt) {
                moreAmnt = this.fetchmod;
            }
            this.$emit('update:limit', this.settings.limit + moreAmnt);
        },

        checkedChange(changeCallback, {runId}) {
            if (runId === this.runCount)
                changeCallback();
            else
                throw new Error(`run ${runId} was not able to run callback`)
        },

        async fetchImages(postGen, {target=1}) {
            const images = [];
            const uniques = new Set();

            const addImages = (adding) => {
                images.push(...adding);
                adding.map(add => add.id)
                    .forEach(id => uniques.add(id));
            }

            addImages(this.cache); //copy cache
            if (images.length > target) {
                return images;
            }
            
            const filterImages = (redditPosts) => (
                redditPosts.filter(post => post.author.name!=='[deleted]'
                    && !uniques.has(post.id)
                    && imageExts.has(getExtension(post.url)) )
            )

            for await (const redditPosts of postGen) {
                addImages( filterImages(redditPosts) );
                if (images.length > target)
                    break;
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

            const settings = this.settings;
            const limit = target + this.fetchmod;
            let {count, after} = this.stream;

            /**
             * potential issue when api posts order changes
             */
            const postGen = (async function*() {
                const MAX_TRIES = 3;

                for (let i=0; i<MAX_TRIES; ++i) {
                    console.log('requesting')
                    const fetched = await subRef[orderFunct]({
                        ...settings,
                        ...(count && {count, after}),
                        limit
                    });
                    count += limit;
                    after = fetched._query.after;

                    yield fetched;
                }
            })();

            const images = await this.fetchImages(postGen, {target});

            //sync point, changes data values, race condition?
            this.checkedChange(() => {
                this.cache.splice(0); //clear cache
                const cachePoint = target - images.length; //negative or zero
                if (cachePoint < 0) {
                    this.cache.push( ...images.splice(cachePoint) );
                }

                this.stream = {...this.stream, count, after};
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
                    console.log('finished setting')
                    this.isLoading = false;
                })
                .catch(error => {
                    if (error.name) //duck type
                        console.error(`${error.name}: ${error.message}`)
                    else
                        console.error(`error: ${error}`);

                    this.isLoading = false;
                });
        }, 0, {leading: false});
    },

    created() {
        this.requester = this.getRequester();
    }

}
</script>
