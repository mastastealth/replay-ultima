import Vue from 'vue';
import Router from 'vue-router';
import Analyzer from '@/components/Analyzer';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Analyzer',
      component: Analyzer,
    },
  ],
});
