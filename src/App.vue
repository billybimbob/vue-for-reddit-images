<template>
  <div id="app">
    <SubTitle :subreddit="subreddit"/>

    <Filters
      :subreddit.sync="subreddit"
      :order.sync="order"
      :options.sync="options"/>
    <SideBar/>

    <RedditImages v-bind="filters"/>
  </div>
</template>

<script>
import SubTitle from './components/SubTitle'
import SideBar from './components/SideBar'
import Filters from './components/Filters'
import RedditImages from './components/RedditImages'

export default {
  name: 'App',
  components: {
    SubTitle,
    SideBar,
    Filters,
    RedditImages
  },

  data() {
    return {
      subreddit: "hearthstone",
      order: "hot",
      options: {
        limit: 10
      }
    }
  },
  computed: {
    filters() {
      const {subreddit, order, options} = this;
      return {subreddit, order, options};
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
</style>
