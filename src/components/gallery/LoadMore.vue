<template>
    <button @click="loadMore" class="load">Load More</button>
</template>

<script>
export default {
    props: {
        morePosts: {
            type: Number,
            default: 10
        }
    },
    methods: {
        loadMore() {
            this.$emit('moreposts', this.morePosts);
        }
    }
}
</script>

<style scoped>
.load {
    height: 44px;
    border: 0px solid #6f7887;
    background: #6f7887;
    color: #fff;
    font-size: 20px;
}

button {
  cursor: pointer;
}
</style>