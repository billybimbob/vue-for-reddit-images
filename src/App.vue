<template>
  <div id="app">
      <SubTitle :subreddit="subreddit"/>
      <div class="topDiv">
        <select v-model="order" class="sortSelect">
          <option v-for="(option, i) in sortBy" :value="option" :key="option">
            {{ sortNames[i] }}
          </option>
        </select>

        <form name="orderBy" @submit.prevent="setSubName">
          <input v-model="newsubname" placeholder="Enter subreddit name" class="searchTerm">
        </form>
        <button form="orderBy" type="submit" class="searchButton">Go</button>
      </div>
    <SideBar/>
    <RedditImages :subreddit="subreddit" :order="order" :options="options"/>
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
      newsubname: "",
      subreddit: "hearthstone",
      order: "hot",
      options: {
        limit: 10
      },
      sortBy: ['hot', 'top', 'new']
    }
  },
  computed: {
    sortNames() {
      return this.sortBy.map(order => order
          .charAt(0).toUpperCase()
          .concat(order.slice(1).toLowerCase())
      )
    }
  },
  methods: {
    setSubName() {
      console.log("old name: " + this.subreddit, " new name: " + this.newsubname);
      this.subreddit = this.newsubname;
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
  font-size: 20px;
  font-family: sans-serif;
  padding: 20px 0px;
}

.topDiv * {
  display: inline-block;
  vertical-align: top;
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
  border: 0px solid #6f7887;
  background: #6f7887;
  color: #fff;
  font-size: 20px;
}

.sortSelect {
  font-family: Arial;
  background: #6f7887;
  text-align: center;
  bottom: 2px;
  border: 0px solid #6f7887;
  width: 65px;
  height: 44px;

}

</style>
