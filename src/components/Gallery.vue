<template>
    <div class="images" @click="clearFocus">
        <h2 v-if="posts.length == 0">Loading images</h2>
        <h2 v-else>Showing {{ posts.length }} images</h2>

        <ul class="image-grid" v-if="posts.length!==0">
            <li class="small-tile"
                v-for="(post, i) in posts" :key="post.url"
                :class="{'active': post===focused}"
            >
                <input v-if="post!==focused"
                    type="image" :src="post.url"
                    @click.stop="imageClick" :value="i"
                    :style="imageStyles[i]" />
            </li>
        </ul>

        <div v-if="focused" class="focus">
            <h2>{{ focused.title }}</h2>
            <input type="image" :src="focused.url"/>
            <div class="buttons">
                <button @click.stop="prevImage">Previous</button>
                <button @click.stop="nextImage">Next</button>
            </div>
        </div>
    </div>
</template>


<script>
export default {
    data() {
        return {
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
    transform: scale(1.5);
    overflow: visible;
}

.small-tile.active:focus-within {
    box-shadow: 0 0 0 black;
}

.small-tile input:focus,
.small-tile input:active {
    outline: none;
    box-shadow: 0 0 25px black;
}

.small-tile.active input {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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

.focus h2 {
    margin: 0;
    padding: 10px;
}

.focus input {
    max-width: 70vw;
    max-height: 80vh;
    vertical-align: top;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}

button:hover {
    cursor: pointer;
}
</style>
