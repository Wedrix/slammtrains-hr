import Vue from 'vue';
import VueRouter from 'vue-router';

import DashboardLayout from '@/views/layouts/Dashboard.vue';
import DefaultLayout from '@/views/layouts/Default.vue';
import PlainLayout from '@/views/layouts/Plain.vue';

import firebase from '@/firebase';
import 'firebase/auth';

Vue.use(VueRouter);

const makeGuard = (guardType) => {
  return (to, from, next) => {
    firebase.auth().onAuthStateChanged(async user => {
      if (guardType === 'guest') {
        if (user) {
          next('/dashboard');
        }
        else {
          next();
        }
      }

      if (guardType === 'authenticated') {
        if (user) {
          next();
        }
        else {
          next('/');
        }
      }

      if (guardType === 'registered') {
        if (user) {
          const idToken = await user.getIdTokenResult();

          const accessLevel = idToken.claims.accessLevel;

          if (accessLevel === 'hr') {
            next();
          } 
          else if (accessLevel === undefined) {
            next('/auth/register');
          }
          else {
            next('/auth/unauthorized');
          }
        } 
        else {
          next('/');
        }
      }

      if (guardType === 'unregistered') {
        if (user) {
          const idToken = await user.getIdTokenResult();

          if (idToken.claims.accessLevel === undefined) {
            next();
          }
          else {
            next('/dashboard');
          }
        } 
        else {
          next('/');
        }
      }
    });
  };
};

const dashboardRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/pages/Dashboard/Home.vue'),
  },
  {
    path: 'employees',
    component: () => import('@/views/pages/Dashboard/Employees.vue'),
    children: [
      {
        path: '/',
        name: 'EmployeesIndex',
        component: () => import('@/views/pages/Dashboard/Employees/Index.vue'),
      },
      {
        path: 'import',
        name: 'EmployeesImport',
        component: () => import('@/views/pages/Dashboard/Employees/Import.vue'),
      },
      {
        path: 'add',
        name: 'AddEmployee',
        component: () => import('@/views/pages/Dashboard/Employees/Add.vue'),
      },
    ]
  },
  {
    path: 'courses',
    component: () => import('@/views/pages/Dashboard/Courses.vue'),
    children: [
      {
        path: '/',
        name: 'CoursesIndex',
        component: () => import('@/views/pages/Dashboard/Courses/Index.vue'),
      },
      {
        path: 'plan-courses',
        name: 'PlanCourses',
        component: () => import('@/views/pages/Dashboard/Courses/IndexPlanCourses.vue'),
      },
      {
        path: 'request',
        name: 'RequestCourse',
        component: () => import('@/views/pages/Dashboard/Courses/Request.vue'),
      },
    ],
  },
  {
    path: 'settings/billing',
    component: () => import('@/views/pages/Dashboard/Billing.vue'),
    children: [
      {
        path: '/',
        name: 'BillingPlans',
        component: () => import('@/views/pages/Dashboard/Billing/Plans.vue'),
      },
      {
        path: 'transactions',
        name: 'BillingTransactions',
        component: () => import('@/views/pages/Dashboard/Billing/Transactions.vue'),
      },
    ],
  }
];

const authRoutes = [
  {
    path: 'register',
    name: 'RegistrationPage',
    component: () => import('@/views/pages/Auth/RegisterCompany.vue'),
    beforeEnter: makeGuard('unregistered'),
  },
  {
    path: 'unauthorized',
    name: 'UnauthorizedPage',
    component: () => import('@/views/pages/Auth/Unauthorized.vue'),
    beforeEnter: makeGuard('authenticated'),
  },
];

const guestRoutes = [
  {
    path: '/',
    name: 'HomePage',
    component: () => import('@/views/pages/Home.vue')
  }
];

const routes = [
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: dashboardRoutes,
    beforeEnter: makeGuard('registered'),
  },
  {
    path: '/auth',
    component: PlainLayout,
    children: authRoutes,
  },
  {
    path: '/',
    component: DefaultLayout,
    children: guestRoutes,
    beforeEnter: makeGuard('guest'),
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
