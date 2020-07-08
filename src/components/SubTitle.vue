<template>
  <div class="page">
    <SideBar v-on="$listeners" :sublist="sublist" />

    <div class="content">
      <div class="subtitle">
        <h1 class="SubNameTitle">{{"/r/" + subreddit}}</h1>
        <button v-if="!pinned" class="pinButton" type="submit" @click="pinSub">Pin Subreddit</button>
        <button v-else class="pinButton">Pinned</button>
      </div>
      <slot></slot>
    </div>
  </div>
</template>


<script>
import SideBar from './SideBar'

export default {
  name: 'SubTitle',
  data ()
  {
    return {
      sublist: []
    }
  },
  components:
  {
    SideBar
  },
  props:
  {
    subreddit:
    {
      type: String,
      default: "pics"
    }
  },
  computed:
  {
    pinned() {
      return this.sublist.includes(this.subreddit)
    }
  },
  methods:
  {
    pinSub() {
      if (!this.pinned) {
        this.sublist.push(this.subreddit);
      }
    }
  }
}

</script>


<style>
.page {
    display: flex;
    flex-direction: row;
}

.content {
    padding: 0;
    padding-right: 15px;
    width: 100%;
}

.subtitle {
  text-align: right;
}

.SubNameTitle {
    font-size: 40px;
}

.pinButton {
  background-color: #6f7887;
  font-family: Arial;
  font-size: 20px;
  color: #fff;
  border: 1px solid #6f7887;
  width: auto;
  height: 40px;
  align-self: auto;
  cursor: pointer;
}

</style>
