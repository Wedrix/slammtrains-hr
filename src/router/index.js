import Vue from 'vue';
import VueRouter from 'vue-router';

import DashboardLayout from '@/views/layouts/Dashboard.vue';
import DefaultLayout from '@/views/layouts/Default.vue';
import PlainLayout from '@/views/layouts/Plain.vue';

import firebase from '@/firebase';
import 'firebase/auth';
import 'firebase/firestore';

Vue.use(VueRouter);

const authValidation = (to, from, next) => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      next('/');
    } else {
      next();
    }
  });
};

const registerValidation = (to, from, next) => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      next();
    } else {
      next('/');
    }
  });
};

const authRoutes = [
  {
    path: '/signin',
    name: 'SignInPage',
    component: () => import('../views/pages/SignIn.vue'),
    beforeEnter: authValidation
  },
  {
    path: '/signup',
    name: 'SignUpPage',
    component: () => import('../views/pages/SignUp.vue'),
    beforeEnter: authValidation
  },
  {
    path: '/register_company',
    name: 'CompanyRegistrationPage',
    component: () => import('../views/pages/RegisterCompany.vue'),
    beforeEnter: registerValidation
  },
  {
    path: '/confirm_email',
    name: 'ConfirmEmailPage',
    component: () => import('../views/pages/ConfirmEmail.vue'),
    beforeEnter: (to, from, next) => {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          if (user.emailVerified) {
            next('/dashboard');

            return;
          } else {
            // Poll for changed state and redirect
            const timer = setInterval(async () => {
                await firebase.auth().currentUser.reload();
  
                if (user.emailVerified) {
                  clearInterval(timer);
                  
                  next('/dashboard');
                }
            }, 5000);
  
            setTimeout(() => {
                clearInterval(timer);
            }, 900000);
          }

          next();
        } else {
          next('/');
        }
      });
    }
  }
];

const dashboardRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/pages/Dashboard/Home.vue')
  },
  {
    path: 'employees',
    name: 'Employees',
    component: () => import('../views/pages/Dashboard/Employees.vue')
  },
  {
    path: 'courses',
    name: 'Courses',
    component: () => import('../views/pages/Dashboard/Courses.vue')
  },
  {
    path: 'payments',
    name: 'Payments',
    component: () => import('../views/pages/Dashboard/Payments.vue')
  },
  {
    path: 'subscription',
    name: 'Subscription',
    component: () => import('../views/pages/Dashboard/Subscription.vue')
  }
];

const dashboardValidation = (to, from, next) => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      user.getIdTokenResult().then(async result => {
        if (result.claims.accessLevel === 'admin' || result.claims.accessLevel === 'hr') {
          if (!user.emailVerified) {
            next('/confirm_email');

            return;
          }

          const company = (await firebase.firestore()
                                        .collection('companies')
                                        .where('admin.uid','==',user.uid)
                                        .get()).docs[0];
          
          if (!company) {
            next('/register_company');

            return;
          }

          next();
        } else {
          next({path: '/signin', query: { unauthorized: true }});
        }
      });
    } else {
      next('/signin');
    }
  });
};

const defaultRoutes = [
  {
    path: '/',
    name: 'HomePage',
    component: () => import('../views/pages/Home.vue')
  }
];

const defaultValidation = (to, from, next) => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      next('/dashboard');
    } else {
      next();
    }
  });
};

const routes = [
  {
    path: '/auth',
    component: PlainLayout,
    children: authRoutes,
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: dashboardRoutes,
    beforeEnter: dashboardValidation,
  },
  {
    path: '/',
    component: DefaultLayout,
    children: defaultRoutes,
    beforeEnter: defaultValidation
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
