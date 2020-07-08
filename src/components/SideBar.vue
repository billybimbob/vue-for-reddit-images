<template>

<div class="sidebar-fixed">
  <a href="#">Pinned subreddits</a>
  <li v-for="sub in pins" :key="sub" class="listText" @click="toSub(sub)">
    {{ "r/" + sub }}
  </li>
</div>

</template>


<script>
export default {
  name: 'SideBar',
  props:
  {
    subreddit: String,
    pins: Array
  },
  methods:
  {
    toSub(sub) {
      console.log("test");
      this.$emit('update:subreddit', sub);
    }
  }

}
</script>


<style scoped>
.sidebar-fixed {
  height: 100vh;
  width: inherit;
  max-width: inherit;
  position: fixed;
  z-index: 1;
  background-color: #424447;
  overflow-x: hidden;
  padding-top: 20px;
}

.sidebar-fixed a {
  padding: 6px 8px 6px 16px;
  text-decoration: none;
  font-size: 25px;
  color: #fff;
  display: block;
}

.listText {
  color: #99a8c2;
  font-size: 16px;
  text-align: left;
  padding-left: 8px;
}

.listText:hover {
  color: #c0d1ed;
  cursor: pointer;
}

</style>
