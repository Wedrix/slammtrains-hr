import Vue from 'vue';
import Vuex from 'vuex';

import firebase from '@/firebase';
import 'firebase/firestore';

import { vuexfireMutations, firestoreAction } from 'vuexfire';

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
    subscription: {
      plan: {
        name: '',
      }
    },
  },
};

export default new Vuex.Store({
  state: { ...init },
  getters: {
    admin(state) {
      return state.company.admin;
    },
    subscription(state) {
      return state.company.subscription;
    },
  },
  mutations: {
    ...vuexfireMutations,
    push_notification({ notifications }, { notification }) {
      notifications.splice(notifications.length, 1, notification);
    },
    pop_notification({ notifications }) {
      notifications.splice(0, 1);
    },
    clear_state(state) {
      state = Object.assign(state, { ...init });
    }
  },
  actions: {
    initialize: firestoreAction(async ({ bindFirestoreRef }, { uid }) => {
      const companyId = (await firebase.firestore()
                                    .collection('companies')
                                    .where('admin.uid','==',uid)
                                    .get()
                                    .then(companiesSnapshot => {
                                      const companySnapshot = companiesSnapshot.docs[0];

                                      return companySnapshot.id;
                                    }));

      const companyRef = firebase.firestore()
                                .doc(`companies/${companyId}`);

      return bindFirestoreRef('company', companyRef, { wait: true });
    }),
    clear({ commit }) {
      commit('clear_state');
    }
  },
  modules: {
  }
});
