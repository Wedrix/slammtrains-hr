import Vue from 'vue';
import Vuex from 'vuex';

import firebase from '@/firebase';
import 'firebase/firestore';

import { vuexfireMutations, firestoreAction } from 'vuexfire';

import moment from 'moment';

Vue.use(Vuex);

const init = {
  notifications: [],
  company: {
    hr: {
      id: '',
      email: '',
      name: ''
    },
    logo: {
      src: '',
    },
    name: '',
    plan: {
      name: '',
      courses: [],
      licensedNumberOfEmployees: null,
    },
    billing: null,
  },
};

export default new Vuex.Store({
  state: { ...init },
  getters: {
    hr(state) {
      return state.company.hr;
    },
    subscriptionHasExpired(state) {
      if (state.company.plan.billing) {
        if (state.company.subscription) {
          const subscriptionEndsAt = moment(state.company.subscription.endsAt);
  
          return subscriptionEndsAt.isBefore();
        }
      }

      return false;
    },
    subscriptionShouldBeRenewed(state) {
      if (state.company.plan.billing) {
        if (state.company.subscription) {
          const subscriptionEndsAt = moment(state.company.subscription.endsAt);
  
          return (subscriptionEndsAt.diff(moment(), 'days') < 3);
        }
      }

      return false;
    },
    unsubscribed(state) {
      if (state.company.plan.billing) {
        if (!state.company.subscription) {
          return true;
        }
      }

      return false;
    },
    employeeLicencesRemaining(state) {
        if (state.company.plan.licensedNumberOfEmployees) {
          return (state.company.plan.licensedNumberOfEmployees - state.company.employeesTotalCount);
        }

        return null;
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
                                    .where('hr.uid','==',uid)
                                    .get()
                                    .then(companiesSnapshot => {
                                      const companySnapshot = companiesSnapshot.docs[0];

                                      return companySnapshot ? companySnapshot.id : null;
                                    }));

      if (companyId) {
        const companyRef = firebase.firestore()
                                  .doc(`companies/${companyId}`);
  
        return bindFirestoreRef('company', companyRef, { wait: true });
      }
    }),
    clear({ commit }) {
      commit('clear_state');
    }
  },
  modules: {
  }
});
