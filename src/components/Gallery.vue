<template>
    <div class="images">
        <h2 v-if="posts.length == 0">Loading images</h2>
        <h2 v-else>Showing {{ posts.length }} images</h2>

        <ul v-if="posts.length!==0" class="image-grid">
            <li v-for="({post, info}, i) in loadPosts"
                :key="post.url" :id="idxToKey(i)" ref="grid"
                :class="['small-tile', {'active': post===focused}]"
                :disabled="loaded<posts.length"
            >
                <button @click.stop="imageClick(i, $event)"
                    v-if="info.observing===false" v-show="info.updated">
                    <!--must be img in button since input does not trigger load
                    when show is false-->

                    <img :src="post.img" :alt="post.title"
                        :style="info.style"
                        @load="imageSize(i, $event)" />
                </button>
            </li>
        </ul>

        <transition :name="trans">
            <div v-if="focused" class="focus" :key="focused.url">
                <div class="scroll-box">
                    <a :href="focused.url" target="_blank">
                        <h2>{{ focused.title }}</h2>
                    </a>
                    <input type="image" :src="focused.img" :alt="focused.title"/>
                    <br/>
                    <a :href="focused.img" :download="focused.title">
                      <button type="submit">Download Image</button>
                    </a>
                </div>
            </div>
        </transition>
        <transition name="appear">
            <div v-if="focused" class="buttons">
                <transition name="appear" appear>
                    <img v-if="lookIdx>0"
                        class="left" @click.stop="prevImage" :src="arrow.left"/>
                </transition>
                <transition name="appear" appear>
                    <img v-if="lookIdx<posts.length-1"
                        class="right" @click.stop="nextImage" :src="arrow.right"/>
                </transition>
            </div>
        </transition>
    </div>
</template>


<script>
import leftArrow from '../assets/left-arrow.svg'
import rightArrow from '../assets/right-arrow.svg'

export default {
    data() {
        return {
            loadInfo: {},
            loaded: 0,
            arrow: {
                left: leftArrow,
                right: rightArrow
            },
            trans: "fade",
            lookIdx: null,
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
        focused() {
            return this.lookIdx!==null
                ? this.posts[this.lookIdx]
                : null;
        },
        loadPosts() {
            return this.posts.map((post, i) => ({
                post,
                info: this.loadInfo[this.idxToKey(i)]
            }));
        }
    },

    watch: {
        posts: {
            handler() {
                this.clearFocus();
                const newImages = this.updateLoads();
                this.loaded = this.posts.length - newImages;
            },
            immediate: true
        }
        /*loaded() {
            const len = this.posts.length;
            if (len > 0 && this.loaded === len) {
                console.log('forcing update')
                this.$forceUpdate();
            }
        }*/
    },

    methods: {
        updateLoads() { //returns the amount of new iamges
            const ids = this.posts.map(post => post.img);
            let newImages = 0;

            this.loadInfo = ids.reduce((infos, id) => {
                if (id in infos)
                    return infos;
                else {
                    newImages += 1;
                    return {...infos, [id]: {
                        style: {maxHeight: '100%', maxWidth: '100%'},
                        updated: false,
                        observing: false
                    }};
                }
            }, this.loadInfo);
            
            return newImages;
        },

        idxToKey(idx) { return this.posts[idx].img; },

        clearFocus(event) {
            this.trans = "fade";
            this.$nextTick(() => { //not sure why just for this one
                this.lookIdx = null;
            })
            if (event && event.target && this.$el.contains(event.target)) {
                event.target.blur();
            }
                
        },

        imageSize(imgIdx, event) {
            const input = event.target;
            const boundDim = input.width > input.height
                ? 'maxHeight' : 'maxWidth';

            const info = this.loadInfo[this.idxToKey(imgIdx)];
            info.style = {[boundDim]: '100%'};
            info.updated = true;

            this.loaded += 1;
            //this.$forceUpdate();
        },
        imageClick(imgIdx, event) {
            if (this.focused === this.posts[imgIdx]) {
                this.clearFocus(event);
            } else {
                const prevIdx = this.lookIdx;
                const nextIdx = parseInt(imgIdx);
                if (prevIdx!==null) {
                    this.trans = prevIdx > nextIdx
                        ? "from-left" : "from-right";
                }
                this.lookIdx = nextIdx;
            }
        },

        prevImage() {
            if (this.lookIdx>0) {
                this.trans = "from-left";
                this.lookIdx -= 1;
            }
        },
        nextImage() {
            if (this.lookIdx<this.posts.length-1) {
                this.trans = "from-right";
                this.lookIdx += 1;
            }
        },


        arrowKey(event) {
            if (this.focused) {
                switch(event.key) {
                    case 'ArrowLeft':
                        this.prevImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                    case 'Escape':
                        this.clearFocus(event);
                        break;
                    default:
                        break;
                }
            }
        },

        observeImages() {
            if (this.lazy.observer && this.$refs.grid) {
                //console.log('adding observers')
                this.$refs.grid
                    .map(li => ({li, info: this.loadInfo[li.id]}))
                    .filter(({info}) => !info.updated)
                    .forEach(({li, info}) => {
                        info.observing = true;
                        this.lazy.observer.observe(li);
                    });
                //console.log(this.lazy.observer);
            }    
        }
    },

    created() {
        if ('IntersectionObserver' in window) { //add lazy loading
            this.lazy.observer = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.intersectionRatio > 0) {
                        this.loadInfo[entry.target.id].observing = false;
                        observer.unobserve(entry.target);
                    }
                });
            }, {threshold: 0.2});
        }
    },
    //add event listener for arrow keys
    mounted() {
        this.observeImages();
        window.addEventListener('keyup', this.arrowKey);
        window.addEventListener('click', this.clearFocus);
    },

    updated() {
        this.observeImages()
    },

    beforeDestroy() {
        if (this.lazy.observer) {
            this.lazy.observer.disconnect();
        }
        window.removeEventListener('keyup', this.arrowKey);
        window.removeEventListener('click', this.clearFocus);
    }
}
</script>


<style scoped>
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
    justify-content: center;
    align-items: center;
    padding-right: 25px;
}

.small-tile {
    height: 200px;
    width: 200px;
    transition: all 200ms ease-in;
    overflow: hidden;
}

.small-tile:focus-within,
.small-tile:hover  {
    box-shadow: 0 0 25px black;
    transform: scale(1.1);
}

.small-tile.active {
    transform: scale(1.25);
    opacity: 0;
}

.small-tile.active:focus-within {
    box-shadow: 0 0 0 black;
}

.small-tile button {
    height: 100%;
    width: 100%;
    padding: 0;
    outline: none;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

.small-tile button:hover {
    cursor: pointer;
}

.focus {
    position: fixed;
    top: 50%;
    left: 55%;
    transform: translate(-50%, -50%);
    background: white;
    z-index: 2;
    margin: 0;
    padding: 0;
    box-shadow: 0 0 25px black;
    border-radius: 6px;
}

.scroll-box {
    overflow-y: scroll;
    max-height: 95vh;
    display: block;
}

.focus h2 {
    margin: 0px;
    padding: 10px;
}

.focus input {
    max-width: 70vw;
    max-height: 80vh;
    vertical-align: top;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}

.focus input:focus {
    outline: none;
}

.buttons .left,
.buttons .right {
    display: flex;
    z-index: 3;
    position: fixed;
    top: 45%;
    height: 65px;
    width: 65px;
    justify-content: center;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    align-items: center;
    transition: transform ease-in 0.1s;
    box-shadow: 0 0 30px black;
}

.buttons .left {
    left: 18%;
}

.buttons .right {
    right: 8%;
}

.buttons .left:hover,
.buttons .right:hover {
    transform: scale(1.15);
    cursor: pointer;
}


.from-right-enter-active,
.from-right-leave-active,
.from-left-enter-active,
.from-left-leave-active {
    transition: all .5s;
}
.from-right-enter,
.from-left-leave-to {
    opacity: 0;
    transform: translate(100vw, -50%);
}
.from-right-leave-to,
.from-left-enter {
    opacity: 0;
    transform: translate(-100vw, -50%);
}

.fade-enter-active, .fade-leave-active,
.appear-enter-active, .appear-leave-active {
    transition: all .5s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%);
}

.appear-enter, .appear-leave-to {
    opacity: 0;
}
</style>
