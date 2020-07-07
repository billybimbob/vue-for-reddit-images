<template>
    <div class="images" @click="clearFocus">
        <h2 v-if="posts.length == 0">Loading images</h2>
        <h2 v-else>Showing {{ posts.length }} images</h2>

        <ul class="image-grid" v-if="posts.length!==0">
            <li v-for="(post, i) in posts" :key="post.url"
                class="small-tile" :class="{'active': post===focused}"
                :disabled="loaded<posts.length"
            >
                <input v-if="post!==focused"
                    type="image" :src="post.img" :alt="post.title"
                    @click.stop="imageClick" :value="i"
                    :style="imageStyles[i].style"
                    @[initialLoad(i)]="imageSize" />
            </li>
        </ul>

        <transition :name="trans">
            <div v-if="focused" class="focus" :key="focused.url">
                <div class="scroll-box">
                    <a :href="focused.url" target="_blank">
                        <h2>{{ focused.title }}</h2>
                    </a>
                    <input type="image" :src="focused.img" :alt="focused.title"/>
                    <a :href="focused.img" :download="focused.title">
                      <button type="submit">Download Image</button>
                    </a>
                </div>
            </div>
        </transition>
        <transition name="appear">
            <div v-if="focused" class="buttons">
                <img class="left" @click.stop="prevImage" :src="arrow.left"/>
                <img class="right" @click.stop="nextImage" :src="arrow.right">
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
            imageStyles: [],
            loaded: 0,
            arrow: {
                left: leftArrow,
                right: rightArrow,
            },
            trans: "fade",
            lookIdx: null,
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
        }
    },

    watch: {
        loaded() {
            if (this.loaded === this.posts.length) {
                console.log('forcing update')
                this.$forceUpdate();
            }
        },
        posts: {
            handler() {
                this.clearFocus();
                this.imageStyles = this.posts.map(() => ({
                    style: {maxHeight: '100%', maxWidth: '100%'},
                    updated: false
                }));
                this.loaded = 0;
            },
            immediate: true
        }
    },

    methods: {
        clearFocus() {
            this.trans = "fade";
            this.$nextTick(() => { //not sure why just for this one
                this.lookIdx = null;
            })
        },
        initialLoad(idx) {
            return this.imageStyles[idx].updated ? null : 'load';
        },
        imageSize(event) {
            const input = event.target;
            const imgIdx = input.value;
            const boundDim = input.width > input.height
                ? 'maxHeight' : 'maxWidth';

            this.imageStyles[imgIdx] = {
                style: {[boundDim]: '100%'},
                updated: true
            };
            this.loaded += 1;
            //this.$forceUpdate();
        },
        imageClick(event) {
            if (this.focused === this.posts[event.target.value]) {
                this.clearFocus();
            } else {
                const prevIdx = this.lookIdx;
                const nextIdx = parseInt(event.target.value);
                if (prevIdx!==null) {
                    this.trans = prevIdx > nextIdx
                        ? "from-left" : "from-right";
                }
                this.lookIdx = nextIdx;
            }
        },

        prevImage() {
            const postLen = this.posts.length;
            this.trans = "from-left";
            this.lookIdx = (this.lookIdx-1 + postLen) % postLen;
        },
        nextImage() {
            this.trans = "from-right";
            this.lookIdx = (this.lookIdx+1) % this.posts.length;
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
                        this.clearFocus();
                        break;
                    default:
                        break;
                }
            }
        }
    },

    //add event listener for arrow keys
    mounted() {
        window.addEventListener('keyup', this.arrowKey);
    },
    beforeDestroy() {
        window.removeEventListener('keyup', this.arrowKey);
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
    flex: 20%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: flex-start
}

.small-tile {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    width: 200px;
    transition: all 200ms ease-in;
    overflow: hidden;
}

.small-tile:focus-within {
    box-shadow: 0 0 25px black;
}

.small-tile.active {
    transform: scale(1.25);
    opacity: 0;
}

.small-tile.active:focus-within {
    box-shadow: 0 0 0 black;
}

.small-tile input:focus,
.small-tile input:active,
.small-tile:hover {
    outline: none;
    box-shadow: 0 0 25px black;
}

.focus {
    position: fixed;
    top: 50%;
    left: 55%;
    transform: translate(-50%, -50%);
    display: block;
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
