<template>
    <div class="page">
      <header>
        <slot name="header"></slot>
      </header>
      
      <div :class="['sidebar']">
          <slot name="sidebar"></slot>
      </div>

      <main>
          <slot name="main"></slot>
      </main>
  </div>
</template>


<script>
export default {
  name: "BasePage",

  data() {
    return {
      scrolled: false
    }
  },
  methods: {
    scrollCheck() {
      const distanceY = window.pageYOffset || document.documentElement.scrollTop;
      const shrinkOn = window.innerHeight * 0.02; 
      this.scrolled = distanceY > shrinkOn;
    }
  },
  mounted() {
    window.addEventListener('scroll', this.scrollCheck);
  },
  beforeDestroy() {
    window.removeEventlistener('scroll', this.scrollcheck);
  }
};
</script>


<style>
header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  padding: 0;
  padding-left: 180px;
  width: calc(100% - 180px);
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 180px;
  z-index: 1;
  height: 100%;
  transition: transform 0.2s;
}

.sidebar.scrolled {
  transform: translateY(-10%);
}

main {
  margin-top: 70px;
  margin-left: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 15px 30px 15px;
  height: 100%;
}
</style>
