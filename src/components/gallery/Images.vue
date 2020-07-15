<template>
    <ul v-if="posts.length!==0" class="image-grid">
        <!--want to pass to data-id, but auto camelcase-->
        <TileImage ref="list"
            v-for="(post, i) in posts"
            :key="post.id" 
            :dataId.prop="post.id"
            :post="post"
            :active="i===lookIdx"
            @click.stop="imageClick(i, $event)"
            @load.stop="imageLoad(i, $event)"
        />
    </ul>
</template>


<script>
import TileImage from './TileImage';

export default {
    components: {
        TileImage
    },
    props: {
        posts: {
            type: Array,
            default: () => []
        },
        lookIdx: {
            type: Number,
            default: -1
        }
    },
    methods: {
        getImages() { return this.$refs.list; },
        getId: (image) => image.dataId,

        //repackage events
        imageClick(idx, {target}) {
            this.$emit('click', {idx, target});
        },
        imageLoad(idx, {target}) {
            this.$emit('load', {idx, target});
        }
    }
}
</script>


<style>
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
</style>