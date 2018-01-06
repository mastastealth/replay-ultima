<template>
  <img :src="pogImg" :alt="unit" class="pog" />
</template>

<script>
export default {
  name: 'Pog',
  props: ['unit'],
  computed: {
    pogImg() {
      const images = require.context('../assets/pogs/', false, /\.png$/);
      return (Array.isArray(this.unit)) ? images(`./unit_${this.unit[0]}.png`) : images(`./unit_${this.unit}.png`);
    },
  },
};
</script>

