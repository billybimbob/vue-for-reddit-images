<template>
  <div id="app">
    <SubTitle/>
    <SideBar/>
    <RedditImages subreddit="pics" order="top" :options="{limit: 10}"/>
  </div>
</template>

<script>
import SubTitle from './components/SubTitle'
import SideBar from './components/SideBar'
import RedditImages from './components/RedditImages';

export default {
  name: 'App',
  components: {
    SubTitle,
    SideBar,
    RedditImages
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
