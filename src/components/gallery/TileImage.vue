<template>
    <li :class="['small-tile', {'visible': post.show, 'active': active}]">
        <!--v-if used to start image load or not-->
        <button v-if="post.render" @click.stop="imageClick" >
            <!--must be img in button since input does not trigger load
            when v-show is false-->

            <transition name="fade">
                <img v-show="post.show"
                    :src="post.img" :alt="post.title"
                    :style="post.style" @load="imageLoad" />
            </transition>
        </button>
    </li>
</template>


<script>
export default {
    props: {
        post: {
            type: Object,
            required: true
        },
        active: {
            type: Boolean,
            required: true
        }
    },
    methods: { //forward events
        imageClick(event) {
            this.$emit('click', event)
        },
        imageLoad(event) {
            this.$emit('load', event);
        }
    }
}
</script>


<style scoped>
.small-tile {
    height: 200px;
    width: 200px;
    transition: all 200ms ease-in;
    overflow: hidden;
}

.small-tile.visible:focus-within,
.small-tile.visible:hover  {
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

.fade-enter-active, .fade-leave-active {
    transition: opacity .3s;
}

.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>