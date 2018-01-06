<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
};
</script>

<style>
* { box-sizing: border-box; }

body, html { 
  height: 100%; 
  margin: 0;
  padding: 0;
}

body {
  background: url("./assets/feast.jpg") no-repeat center center;
  background-size: cover;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background: rgba(0,0,0,0.3);
  color: #FFF;
  height: 100vh;
}
</style>
