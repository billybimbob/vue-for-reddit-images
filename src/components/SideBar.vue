<template>

<div class="sidebar">
  <a href="#">Pinned subreddits</a>
  <li v-for="sub in sublist" :key="sub" class="listText" @click="emitSub(sub)">
    {{ "r/" + sub }}
  </li>
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
  height: 100%;
  width: 160px;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
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
