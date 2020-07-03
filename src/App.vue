<template>
  <div id="app">
      <div class="searchdiv">
        <input v-model="newsubname" placeholder="Enter subreddit name">
        <button type="button" name="button" v-on:click="setSubName(newsubname)">Go to subreddit</button>
      </div>
    <SubTitle :subreddit="subreddit"/>
    <SideBar/>
    <RedditImages :subreddit="subreddit"  order="top" :options="{limit: 5}"/>
  </div>
</template>

<script>
import SubTitle from './components/SubTitle'
import SideBar from './components/SideBar'
import RedditImages from './components/RedditImages'


export default {
  name: 'App',
  components: {
    SubTitle,
    SideBar,
    RedditImages
  },

  data() {
    return {
      subreddit: "hearthstone"
    }
  },
  methods: {
    setSubName(name)
    {
      console.log("old name: " + this.subreddit, " New name: " + name);
      this.subreddit = name;

    }
  }


}



</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}



.searchdiv {
  align: left;
  font-size: 20px;
  font-family: sans-serif;
  padding: 20px 0px;
}
</style>
