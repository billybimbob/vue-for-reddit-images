<template>

  <div class="searchdiv">

    <button>Go to Subreddit</button>
    <input v-model="subname" placeholder="Enter Subreddit Name">
  </div>

</template>



<script>
export default {
  name: 'SubGoTo'
}
</script>



<style scoped>

.searchdiv {
  align: left;
  font-size: 20px;
  font-family: sans-serif;
  padding: 20px 0px;
}


</style>
