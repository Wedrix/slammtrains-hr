import Vue from 'vue';
import Vuex from 'vuex';

import firebase from '@/firebase';
import 'firebase/firestore';

import moment from 'moment';

import { vuexfireMutations, firestoreAction } from 'vuexfire';
import { firestoreOptions } from 'vuexfire';

firestoreOptions.serialize = snapshot => {
  return Object.defineProperty(snapshot.data(), 'id', 
      { 
          value: snapshot.id, 
          enumerable: true, 
          configurable: true, 
          writable: true 
      });
};

import { cloneDeep } from 'lodash';

Vue.use(Vuex);

const init = {
  notifications: [],
  notification: {
    message: '',
    context: '',
    timeout: 3000,
    tag: '',
  },
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
      id: '',
      name: '',
      courses: [],
      licensedNumberOfEmployees: null,
      description: '',
      billing: null,
    },
    subscription: null,
  },
};

export default new Vuex.Store({
  state: cloneDeep(init),
  getters: {
    hr(state) {
      return state.company.hr;
    },
    subscriptionHasExpired(state) {
      if (state.company.plan?.billing) {
        if (state.company.subscription) {
          const subscriptionExpiresAt = moment(state.company.subscription.expiresAt);
  
          return subscriptionExpiresAt.isBefore();
        }
      }

      return false;
    },
    planNotSet(state) {
      if (!state.company.plan) {
        return true;
      }

      return false;
    },
    subscriptionShouldBeRenewed(state) {
      if (state.company.plan?.billing) {
        if (state.company.subscription) {
          const subscriptionExpiresAt = moment(state.company.subscription.expiresAt);
  
          return (subscriptionExpiresAt.diff(moment(), 'days') < 3);
        }
      }

      return false;
    },
    unsubscribed(state) {
      if (state.company.plan?.billing) {
        if (!state.company.subscription) {
          return true;
        }
      }

      return false;
    },
    employeeLicencesRemaining(state) {
        if (state.company.plan) {
          return (state.company.plan.licensedNumberOfEmployees - state.company.employeesTotalCount);
        }

        return null;
    },
  },
  mutations: {
    ...vuexfireMutations,
    push_notification({ notifications }, { notification }) {
      notifications.splice(notifications.length, 1, Object.assign({}, init.notification, notification));
    },
    pop_notification({ notifications }) {
      notifications.splice(0, 1);
    },
    set_notification(state, { notification }) {
      state.notification = notification;
    },
    clear_state(state) {
      state = Object.assign(state, cloneDeep(init));
    }
  },
  actions: {
    initialize: firestoreAction(async ({ bindFirestoreRef }, { user }) => {
      const companyId = (await firebase.firestore()
                                    .collection('companies')
                                    .where('hr.uid', '==', user.uid)
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
