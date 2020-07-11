<template>
    <div class="viewer">
        <h2 v-if="posts.length == 0">Loading images</h2>
        <h2 v-else>Showing {{ posts.length }} images</h2>

        <ul v-if="posts.length!==0" class="image-grid">
            <li is="TileImage" ref="list"
                v-for="(post, i) in loadPosts"
                :key="post.id" 
                :dataId.prop="post.id" 
                :post="post"
                :active="i===lookIdx"
                @click="imageClick(i)" @load="imageLoad(i, $event)"
            />
        </ul>

        <FocusImage :lookIdx.sync="lookIdx" :posts="posts"/>
    </div>
</template>


<script>
import TileImage from './TileImage';
import FocusImage from './FocusImage';

export default {
    components: {
        TileImage,
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
        getImages() { return this.$refs.list; },

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

        imageLoad(idx, event) {
            const input = event.target;
            const boundDim = input.width > input.height
                ? 'maxHeight' : 'maxWidth';

            const id = this.posts[idx].id;
            const info = this.loadInfo[id];
            //console.log(`loaded ${idx}`)

            info.style = {[boundDim]: '100%'};
            info.show = true;

            this.loaded += 1;
        },

        imageClick(imgIdx) {
            this.lookIdx = imgIdx;
        }
    }
}
</script>


<style>
.viewer {
    width: 100%;
}

.image-grid {
    list-style: none;
    line-height: 0;
    flex: 20%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-left: 7%
}

.fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>
