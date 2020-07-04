<template>
  <div id="app">
      <SubTitle :subreddit="subreddit"/>
      <div class="topDiv">
        <select v-model="order" class="sortSelect">
          <option v-for="option in sortBy" v-bind:value="option.value" :key="option.value">
            {{ option.text }}
          </option>
        </select>
        <input v-model="newsubname" placeholder="Enter subreddit name" class="searchTerm">
        <button type="button" name="button" v-on:click="setSubName(newsubname)" class="searchButton">Go</button>
      </div>
    <SideBar/>
    <RedditImages :subreddit="subreddit"  :order="order" :options="{limit: 10}"/>
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
      subreddit: "hearthstone",
      order: "hot",
      sortBy: [
        { text: 'Hot', value: 'hot' },
        { text: 'Top', value: 'top' },
        { text: 'New', value: 'new' }
      ]
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


.topDiv {
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
  font-size: 18px;
  font-family: Arial;
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

.sortSelect {
  position: relative;
  font-family: Arial;
  background: #6f7887;
  text-align: center;
  bottom: 2px;
  border: 0px solid #6f7887;
  width: 65px;
  height: 44px;

}



</style>
