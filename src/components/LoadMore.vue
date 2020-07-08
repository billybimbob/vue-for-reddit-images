<template>
    <button @click="loadMore" class="searchButton">Load More</button>
</template>

<script>
export default {
    props: {
        limit: Number,
        morePosts: {
            type: Number,
            default: 10
        }
    },
    methods: {
        loadMore() {
            this.$emit('update:limit', this.limit+this.morePosts);
        }
    }
}
</script>

<style scoped>
.searchButton {
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