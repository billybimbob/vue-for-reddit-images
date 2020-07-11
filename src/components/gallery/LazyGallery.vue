<template>
    <div class="images">
        <h2 v-if="posts.length == 0">Loading images</h2>
        <h2 v-else>Showing {{ posts.length }} images</h2>

        <ul v-if="posts.length!==0" class="image-grid">
            <li is="TileImage" ref="grid"
                v-for="({post, info}, i) in loadPosts"
                :key="post.id" 
                :post="post" :status="info"
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
            }
        }
    },
    computed: {
        loadPosts() {
            return this.posts.map(post => ({
                post,
                info: this.loadInfo[post.id]
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
        newLoadInfo: () => ({
            style: {maxHeight: '100%', haxWidth: '100%'},
            updated: false,
            observing: true
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
            info.updated = true;

            this.loaded += 1;
        },

        imageClick(imgIdx) {
            this.lookIdx = imgIdx;
        },

        observeImages() {
            if (this.lazy.observer && this.$refs.grid) {
                this.$refs.grid
                    .map(image => image.$el) //assume el has a data-id attr
                    .map(el => ({ el, info: this.loadInfo[el.dataset.id] }))
                    .filter(({info}) => info.observing)
                    .forEach(({el}) => {
                        //const id = li.dataset.id; 
                        //const ids = this.posts.map(post => post.id)
                        //console.log(`started observing ${ids.indexOf(id)}`)
                        this.lazy.observer.observe(el);
                    });
            } else {
                Object.values(this.loadInfo).forEach(info => {
                    info.observing = false;
                });
            }   
        }
    },

    created() {
        if ('IntersectionObserver' in window) { //add lazy loading
            this.lazy.observer = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.intersectionRatio > 0) {
                        const id = entry.target.dataset.id;
                        //const ids = this.posts.map(post => post.id)
                        //console.log(`stopped observing ${ids.indexOf(id)}`)
                        this.loadInfo[id].observing = false;
                        observer.unobserve(entry.target);
                    }
                });
            }, {threshold: 0.3});
        }
    },
    mounted() {
        this.observeImages();
    },

    updated() {
        this.observeImages()
    },

    beforeDestroy() {
        if (this.lazy.observer) {
            this.lazy.observer.disconnect();
        }
    }
}
</script>


<style>
.images {
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
