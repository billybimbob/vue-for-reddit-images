<template>
    <div class="viewer">
        <h2 v-if="isLoading">Loading images</h2>
        <h2 v-else-if="posts.length===0">No images were found</h2>
        <h2 v-else>Showing {{ posts.length }} images</h2>

        <!--tight coupling between Images and Gallery-->
        <Images ref="images" 
            :posts="loadPosts" :lookIdx="lookIdx"
            @click="imageClick" @load="imageLoad"
        />

        <FocusImage :slideshow="slideshow" :posts="posts"
            :lookIdx.sync="lookIdx"/>

        <LoadingIcon v-if="isLoading"/>
        <LoadMore v-else-if="posts.length!==0" v-on="$listeners"/>
    </div>
</template>


<script>
import Images from './Images';
import FocusImage from './FocusImage';
import LoadingIcon from './LoadingIcon';
import LoadMore from './LoadMore';

export default {
    components: {
        Images,
        FocusImage,
        LoadingIcon,
        LoadMore
    },
    data() {
        return {
            loadInfo: {},
            loaded: 0,
            lookIdx: -1,
            atBottom: false
        }
    },
    props: {
        posts: {
            type: Array,
            default() { //can add custom validator
                return [];
            },
            validator(data) {
                const reqArgs = ['id', 'title', 'img', 'url']
                return data.every((val) => (
                    reqArgs.reduce((prevs, arg) => (
                        prevs && arg in val
                    ), true)
                ))
            }
        },
        slideshow: {
            type: Boolean,
            default: false
        },
        autoload: {
            type: Boolean,
            default: false
        },
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        loadPosts() {
            return this.posts.map(post => ({
                ...post,
                ...this.loadInfo[post.id]
            }));
        },
        autoProps() {
            const {loaded, autoload, atBottom} = this;
            return {loaded, autoload, atBottom};
        }
    },

    watch: {
        posts: {
            handler() {
                this.scrollBottom();
                this.lookIdx = -1;
                this.updateLoads();
            },
            immediate: true
        },
        autoProps() {
            // can emit to auto load more posts
            if (!this.isLoading
              && this.autoload
              && this.atBottom
              && this.loaded===this.posts.length) {

                console.log('loaded all')
                this.morePosts();
            }
        }
    },

    methods: {
        getImages() { return this.$refs.images.getImages(); },

        getInfo(image) {
            const id = this.$refs.images.getId(image);
            return this.loadInfo[id]; 
        },

        morePosts() { this.$emit('moreposts') },

        newLoadInfo: () => ({
            style: {maxHeight: '100%', haxWidth: '100%'},
            render: true, //by default always immediately load
            show: false
        }),

        updateLoads() {
            //removes images no longer present
            const postIds = new Set(this.posts.map(post => post.id));
            this.loadInfo = Object.entries(this.loadInfo)
                .reduce((loads, [id, info]) => {
                    return !postIds.has(id)
                        ? loads
                        : {...loads, [id]: info};
                }, {});
            
            //adds new images
            let newImages = 0;
            this.loadInfo = this.posts.reduce((loads, post) => {
                const id = post.id;
                if (id in loads) {
                    return loads;
                } else {
                    newImages += 1;
                    return {...loads, [id]: this.newLoadInfo()};
                }
            }, this.loadInfo);
            
            this.loaded = this.posts.length - newImages;
        },


        imageLoad({idx, target: img}) {
            const id = this.posts[idx].id;
            const info = this.loadInfo[id]
            const boundDim = img.width > img.height
                ? 'maxHeight' : 'maxWidth';

            // image only shown after being loaded and styled
            info.style = {[boundDim]: '100%'};
            info.show = true;
            this.loaded += 1;
        },
        imageClick({idx: imgIdx}) {
            this.lookIdx = imgIdx;
        },

        scrollBottom() {
            if ((window.innerHeight+window.scrollY) >= document.body.scrollHeight*0.95) {
                console.log('at bottom')
                this.atBottom = true;
            } else {
                this.atBottom = false;
            }
        }
    },

    mounted() {
        window.addEventListener('scroll', this.scrollBottom);
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.scrollBottom);
    }
}
</script>


<style>
.viewer {
    width: 100%;
}
</style>
