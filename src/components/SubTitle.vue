<template>

<div>
    <div class="SubNameDiv">
      <h1 class="SubNameTitle">{{"/r/" + subreddit}}</h1>
      <button type="submit" class="pinButton" @click="pinSub()">Pin Subreddit</button>
    </div>
    <SideBar v-on="$listeners" :sublist="sublist" />
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
  methods:
  {
    pinSub() {
      if (!this.sublist.includes(this.subreddit))
          {
            this.sublist.push(this.subreddit);
          }
    }

  }

}


</script>


<style>
.SubNameDiv {
    text-align: right;
    padding: 0px 25px;
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

}



</style>
