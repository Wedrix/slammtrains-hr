import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import './plugins/vuefire';
import config from './config';

Vue.prototype.$$config = config;
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app');

Array.purify = function (array) {
  return array.filter(element => {
    return (element !== null) && (element !== undefined);
  });
};
