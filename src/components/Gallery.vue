<template>
    <div class="images" @click="clearFocus">
        <h2 v-if="posts.length == 0">Loading images</h2>
        <h2 v-else>Showing {{ posts.length }} images</h2>

        <ul class="image-grid" v-if="posts.length!==0">
            <li v-for="(post, i) in posts" :key="post.url"
                class="small-tile" :class="{'active': post===focused}"
            >
                <input v-if="post!==focused"
                    type="image" :src="post.url" :alt="post.title"
                    @click.stop="imageClick" :value="i"
                    :style="imageStyles[i]" />
            </li>
        </ul>

        <transition name="zoom">
            <div v-if="focused" class="focus" :key="focused.url">
                <div class="scroll-box">
                    <h2>{{ focused.title }}</h2>
                    <input type="image" :src="focused.url" :alt="focused.title"/>
                    <div class="buttons">
                        <img class="left" @click.stop="prevImage" :src="leftArrow"/>
                        <img class="right" @click.stop="nextImage" :src="rightArrow">
                    </div>
                </div>
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
            leftArrow,
            rightArrow,
            lookIdx: null
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
        imageStyles() {
            return this.posts.map(post =>
                post.dim.width > post.dim.height
                    ? {height: '100%'}
                    : {width: '100%'}
            );
        }
    },

    methods: {
        clearFocus() {
            this.lookIdx = null;
        },
        imageClick(event) {
            if (this.focused === this.posts[event.target.value]) {
                this.clearFocus();
            } else {
                this.lookIdx = parseInt(event.target.value);
            }
        },
        prevImage() {
            const postLen = this.posts.length;
            this.lookIdx = (this.lookIdx-1 + postLen) % postLen;
        },
        nextImage() {
            this.lookIdx = (this.lookIdx+1) % this.posts.length;
        },
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
    position: absolute;
    top: 50%;
    height: 50px;
    width: 50px;
    justify-content: center;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    align-items: center;
    transition: transform ease-in 0.1s;
    box-shadow: 0 0 15px black;
}

.buttons .left {
    left: -25px;
}

.buttons .right {
    right: -25px;
}

.buttons .left:hover,
.buttons .right:hover {
    transform: scale(1.1);
    cursor: pointer;
}


.from-right-enter-active,
.from-right-leave-active {
    transition: all .5s;
}
.from-right-enter {
    transform: translate(100vw, -50%);
}
.from-right-leave-to {
    transform: translate(-100vw, -50%);
}

.zoom-enter-active, .zoom-leave-active {
    transition: all .5s;
}
.zoom-enter, .zoom-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%);
}
</style>
