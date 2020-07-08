<template>
    <div class="page">
        <div class="sidebar">
            <slot name="sidebar"></slot>
        </div>
        
        <div class="content">
            <slot name="heading"></slot>
            <div class="main">
                <slot name="main"></slot>
            </div>
        </div>
  </div>
</template>


<script>

export default {
  name: "BasePage"
};
</script>


<style>
.page {
  display: flex;
  flex-direction: row;
}

.sidebar {
  width: 20vw;
  max-width: 180px;
}

.content {
  padding: 0;
  padding-right: 15px;
  margin-bottom: 30px;
  width: 100%;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
