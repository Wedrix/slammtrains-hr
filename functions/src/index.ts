import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

import seedDatabaseFunction from './seedDatabase';
import signUpHrFunction from './signUpHr';
import registerCompanyFunction from './registerCompany';

export const seedDatabase = seedDatabaseFunction;
export const signUpHR = signUpHrFunction;
export const registerCompany = registerCompanyFunction;