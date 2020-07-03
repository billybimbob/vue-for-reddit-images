<template>
  <div id="app">
      <div class="searchDiv">
        <input v-model="newsubname" placeholder="Enter subreddit name" class="searchTerm">
        <button type="button" name="button" v-on:click="setSubName(newsubname)" class="searchButton">Go</button>
      </div>
    <SubTitle :subreddit="subreddit"/>
    <SideBar/>
    <RedditImages :subreddit="subreddit"  order="top" :options="{limit: 10}"/>
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


.searchDiv {
  align: left;
  font-size: 20px;
  font-family: sans-serif;
  padding: 20px 0px;
}


.searchTerm {
  border: 3px solid #6f7887;
  padding: 15px;
  height: 8px;
  border-right: none;
  outline: none;
  color: #9DBFAF;
  font-size: 15px;
}

.searchButton {
  width: 45px;
  height: 44px;
  position: absolute;
  border: 0px solid #6f7887;
  background: #6f7887;
  color: #fff;
  font-size: 20px;
}




</style>
