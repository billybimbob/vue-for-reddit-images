<template>
    <div class="viewer">
        <h2 v-if="posts.length == 0">Loading images</h2>
        <h2 v-else>Showing {{ posts.length }} images</h2>

        <!--tight coupling between Images and Gallery-->
        <Images ref="images" 
            :posts="loadPosts" :lookIdx="lookIdx"
            @click="imageClick" @load="imageLoad"
        />

        <FocusImage :lookIdx.sync="lookIdx" :posts="posts"/>
    </div>
</template>


<script>
import Images from './Images';
import FocusImage from './FocusImage';

export default {
    components: {
        Images,
        FocusImage
    },
    data() {
        return {
            loadInfo: {},
            loaded: 0,
            lookIdx: -1,
            lazy: {
                observer: null,
                watchAmnt: 5
            }
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
        }
    },
    computed: {
        loadPosts() {
            return this.posts.map(post => ({
                ...post,
                ...this.loadInfo[post.id]
            }));
        }
    },

    watch: {
        posts: {
            handler() {
                this.lookIdx = -1;
                this.updateLoads();
            },
            immediate: true
        },
        loaded() {
            // can emit to auto load more posts
            if (this.loaded === this.posts.length) {
                console.log('loaded all')
                this.$emit('moreposts');
            }
        }
    },

    methods: {
        getImages() { return this.$refs.images.getImages(); },

        newLoadInfo: () => ({
            style: {maxHeight: '100%', haxWidth: '100%'},
            render: true,
            show: false
        }),

        updateLoads() {
            //removes images no longer present
            const postIds = new Set(this.posts.map(post => post.id));
            this.loadInfo = Object.entries(this.loadInfo).reduce((loads, [id, info]) => {
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

            info.style = {[boundDim]: '100%'};
            info.show = true;
            this.loaded += 1;
        },

        imageClick({idx: imgIdx}) {
            this.lookIdx = imgIdx;
        }
    }
}
</script>


<style>
.viewer {
    width: 100%;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>
