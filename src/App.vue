<template>
  <BasePage>

    <template v-slot:sidebar>
      <SideBar :subreddit.sync="subreddit" :pins="pins" />
    </template>

    <template v-slot:heading>
      <SubTitle :subreddit="subreddit" :pins="pins" @pin="addPin"/>
      <Filters
        :subreddit.sync="subreddit"
        :time.sync="options.time"
        :order.sync="order"/>
    </template>

    <template v-slot:main>
      <RedditImages :subreddit="subreddit" :order="order" :options="options"/>
      <LoadMore :limit.sync="options.limit"/>
    </template>

  </BasePage>
</template>

<script>
import BasePage from './components/BasePage'
import SideBar from './components/SideBar'
import SubTitle from './components/SubTitle'
import Filters from './components/Filters'
import RedditImages from './components/RedditImages'
import LoadMore from './components/LoadMore'

export default {
  name: 'App',
  components: {
    BasePage,
    SideBar,
    SubTitle,
    Filters,
    RedditImages,
    LoadMore
  },

  data() {
    return {
      subreddit: "pics",
      order: "hot",
      options: {
        limit: this.defaultLimit(),
        time: 'day'
      },
      pins: []
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
    defaultLimit() { return 10; },
    addPin(sub) { this.pins.push(sub); }
  }
}

</script>


<style>
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 0;
  margin: 0;
}
</style>
