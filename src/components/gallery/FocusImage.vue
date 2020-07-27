<template>
    <transition name="fade">
        <div v-show="focused" :class="['focus', {'slideshow': slideshow}]">
            <transition :name="trans">
                <div v-if="focused" :key="focused.url" class="center">
                    <div v-if="slideshow">
                        <!--a :href="focused.url" target="_blank" @click.stop-->
                        <input type="image" :src="focused.img" :alt="focused.title"/>
                        <!--/a-->
                    </div>

                    <div v-else class="scroll-box">
                        <a :href="focused.url" target="_blank" @click.stop>
                            <h2>{{ focused.title }}</h2>
                        </a>

                        <input type="image" :src="focused.img" :alt="focused.title"/>
                        <!--br/>
                        <a :href="focused.img" :download="focused.title">
                            <button type="submit">Download Image</button>
                        </a-->
                    </div>
                </div>
            </transition>

            <div v-show="focused && !slideshow" class="buttons">
                <img v-if="lookIdx>0"
                    class="left" @click.stop="prevImage" :src="left"/>
                <img v-if="lookIdx<posts.length-1"
                    class="right" @click.stop="nextImage" :src="right"/>
            </div>
        </div>
    </transition>
</template>


<script>
import left from '../../assets/left-arrow.svg'
import right from '../../assets/right-arrow.svg'

export default {
    data() {
        return {
            left,
            right,
            trans: 'appear',
            timer: null
        }
    },
    props: {
        lookIdx: {
            type: Number,
            default: -1
        },
        posts: {
            type: Array,
            default: () => []
        },
        slideshow: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        focused() {
            return this.lookIdx!==-1
                ? this.posts[this.lookIdx]
                : null;
        }
    },
    watch: {
        lookIdx(currIdx, prevIdx) {
            if (currIdx!==-1 && prevIdx!==-1 && !this.slideshow) {
                this.trans = prevIdx > currIdx
                    ? "from-left" : "from-right";
            }
        },
        focused() {
            if (this.timer) {
                clearInterval(this.timer);
            }

            //start timer only when focus updated
            if (this.slideshow && this.focused!==null) {
                this.timer = setInterval(() => {
                    console.log('timer fire')
                    this.nextImage();

                     //only run once
                    clearInterval(this.timer);
                    this.timer = null;
                }, 8000);
            }
        }
    },

    methods: {
        prevImage() {
            if (this.lookIdx>0) {
                this.$emit("queue", this.lookIdx-1);
            }
        },
        nextImage() {
            this.$emit("queue", this.lookIdx+1);
        },
        clearFocus() {
            this.trans = "appear";
            //not sure why nextTick only for this one
            this.$nextTick(() => {
                this.$emit("queue", -1);
            })
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

    mounted() {
        //add event listener for arrow keys
        window.addEventListener('keyup', this.arrowKey);
        window.addEventListener('click', this.clearFocus);

    },
    beforeDestroy() {
        window.removeEventListener('keyup', this.arrowKey);
        window.removeEventListener('click', this.clearFocus);   
    }
}
</script>


<style scoped>
.focus {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 3;
    background-color: rgba(0, 0, 0, 0.5);
}

.focus.slideshow {
    background-color: black;
}

.center {
    position: fixed;
    top: 50%;
    left: 55%;
    transform: translate(-50%, -50%);
    z-index: 3;
    background: white;
    margin: 0;
    padding: 0;
    box-shadow: 0 0 25px black;
    border-radius: 6px;
    opacity: 100%;
}

.slideshow .center {
    background: transparent;
    height: 100%;
    width: 100%;
    left: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.scroll-box {
    overflow-y: scroll;
    max-width: 90vw;
    max-height: 95vh;
    display: block;
}

.center h2 {
    margin: 0px;
    padding: 10px;
}

.center a {
    text-decoration: none;
    color: black;
    cursor: pointer;
}

.center input {
    vertical-align: top;
    max-height: 80vh;
    max-width: 80vw;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}

.slideshow .center input {
    max-height: 100vh;
    max-width: 100vw;
}

.center input:focus {
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
    left: 18.5%;
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

.appear-enter-active, .appear-leave-active {
    transition: all .5s;
}
.appear-enter, .appear-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%);
}

.fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>