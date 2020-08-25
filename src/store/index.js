import Vue from 'vue';
import Vuex from 'vuex';

import firebase from '@/firebase';
import 'firebase/firestore';

Vue.use(Vuex);

const init = {
  notifications: [],
  company: {
    admin: {
      id: '',
      email: '',
      name: ''
    },
    logo: {
      src: '',
    },
    name: '',
    subscription: null,
  },
};

export default new Vuex.Store({
  state: { ...init },
  getters: {
    admin(state) {
      return state.company.admin;
    }
  },
  mutations: {
    push_notification({ notifications }, { notification }) {
      notifications.splice(notifications.length, 1, notification);
    },
    pop_notification({ notifications }) {
      notifications.splice(0, 1);
    },
    set_company(state, { company }) {
      state.company = company;
    },
    clear_state(state) {
      state = Object.assign(state, { ...init });
    }
  },
  actions: {
    initialize({ commit }, { uid }) {
      firebase.firestore()
              .collection('companies')
              .where('admin.uid','==',uid)
              .onSnapshot(snapshot => {
                const document = snapshot.docs[0];
                const company = document.data();

                commit('set_company', { company });
              });
    },
    clear({ commit }) {
      commit('clear_state');
    }
  },
  modules: {
  }
});
