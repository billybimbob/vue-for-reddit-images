<template>
  <BasePage>

    <template #sidebar>
      <SideBar :subreddit.sync="subreddit" :pins="pins" />
    </template>

    <template #heading>
      <SubTitle :subreddit="subreddit" :pins="pins" @pin="addPin"/>
      <Filters
        :subreddit.sync="subreddit"
        :time.sync="options.time"
        :order.sync="order"
        :load="load.auto" @update:load="loadChange"
        :slideshow.sync="options.slideshow" />
    </template>

    <template #main>
      <RedditImages :subreddit="subreddit" :order="order"
        :options="options" @update:limit="setLimit"/>

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
        time: 'day',
        slideshow: false
      },
      pins: [],
      load: {
        auto: false,
        request: 0
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
    defaultLimit() { return 10; },

    addPin(sub) { this.pins.push(sub); },

    setLimit(limit) {
      if (this.load.auto) {
        this.options.limit = limit;
      } else {
        this.load.request = limit;
      }
    },

    loadChange(checked) {
      this.load.auto = checked;
      if (this.load.request) {
        this.options.limit = this.load.request;
        this.load.request = 0;
      }
    }
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
