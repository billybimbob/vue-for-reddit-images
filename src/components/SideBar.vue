<template>

<div class="sidebar">
  <div class="sidebar-fixed">
    <a href="#">Pinned subreddits</a>
    <li v-for="sub in sublist" :key="sub" class="listText" @click="emitSub(sub)">
      {{ "r/" + sub }}
    </li>
  </div>
</div>

</template>


<script>
export default {
  name: 'SideBar',
  props:
  {
    sublist: Array
  },
  methods:
  {
    emitSub(sub) {
      console.log("test");
      this.$emit('update:subreddit', sub);
    }
  }

}
</script>


<style scoped>
.sidebar {
  width: 20vw;
  max-width: 180px;
}

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

.sidebar a {
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
