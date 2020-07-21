<template>

<div class="pin-sidebar">
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
.pin-sidebar {
  height: 100%;
  padding-top: 20px;
  background-color: #424447;
  box-shadow: 0 0 11px rgba(0, 0, 0, 0.3);
}

.pin-sidebar a {
  padding: 0;
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
