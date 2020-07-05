<template>
  <div id="app">
    <SubTitle  @changeSub="onSubClick" :subreddit="subreddit"/>

    <Filters
      :subreddit.sync="subreddit"
      :order.sync="order"
      :options.sync="options"/>

    <RedditImages v-bind="filters"/>
  </div>
</template>

<script>
import SubTitle from './components/SubTitle'
import Filters from './components/Filters'
import RedditImages from './components/RedditImages'

export default {
  name: 'App',
  components: {
    SubTitle,
    Filters,
    RedditImages
  },

  data() {
    return {
      subreddit: "pics",
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
  },
  methods: {
    onSubClick(sub)
        {
          console.log("sub changing on click to:" + sub);
          this.subreddit = sub;
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
