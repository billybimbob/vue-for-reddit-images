<template>

<div class="SubNameDiv">
    <h1 class="SubNameTitle">{{"/r/" + subreddit}}</h1>
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

</style>
