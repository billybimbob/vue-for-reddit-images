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
  z-index: 2;
  margin-left: 180px;
  width: calc(100% - 180px);
  box-shadow: 0 0 11px rgba(0, 0, 0, 0.3);
}

.sidebar {
  top: 0;
  left: 0;
  width: 180px;
  position: fixed;
  z-index: 1;
  height: 100%;
  transition: transform 0.2s;
}

.sidebar.scrolled {
  transform: translateY(-10%);
}

main {
  margin-left: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 15px 30px 15px;
  height: 100%;
}
</style>
