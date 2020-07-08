<template>
  <div class="subtitle">
    <h1 class="SubNameTitle">{{"/r/" + subreddit}}</h1>
    <button v-if="!pinned" class="pinButton" type="submit" @click="pinSub">Pin Subreddit</button>
    <button v-else class="pinButton">Pinned</button>
  </div>
</template>


<script>
export default {
  name: 'SubTitle',
  props:
  {
    subreddit:
    {
      type: String,
      default: "pics"
    },
    pins:
    {
      type: Array,
      default() { return []; }
    }
  },
  computed:
  {
    pinned() {
      return this.pins.includes(this.subreddit)
    }
  },
  methods:
  {
    pinSub() {
      if (!this.pinned) {
        this.$emit('pin', this.subreddit);
      }
    }
  }
}

</script>


<style>
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
