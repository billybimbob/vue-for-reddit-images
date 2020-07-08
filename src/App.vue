<template>
  <div id="app">
    <SubTitle :subreddit.sync="subreddit"/>

    <Filters
      :subreddit.sync="subreddit"
      :order.sync="order"
      :limit.sync="options.limit"
      :time.sync="options.time"/>

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
        limit: this.defaultLimit(),
        time: 'day'
      }
    }
  },
  computed: {
    filters() {
      const {subreddit, order, options} = this;
      return {subreddit, order, options};
    }
  },
  watch: {
    filters() {
      this.options.limit = this.defaultLimit();
    }
  },
  methods: {
    defaultLimit() { return 10; }
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
