import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { resolveCompany } from '../Helpers/ResolveDocuments';

export default async (planId: string, companyId: string) => {
    const company = await resolveCompany(`companies/${companyId}`);

    if (company.plan.licensedNumberOfEmployees < company.employeesTotalCount) {
        throw new functions.https.HttpsError('failed-precondition', 'The new plan does not have enough licenses for all the company\'s employees');
    }

    const plan = admin.firestore()
                    .doc(`plans/${planId}`);

    const subscription = null;

    await admin.firestore()
                .doc(`companies/${companyId}`)
                .update({ 
                    plan,
                    subscription,
                })
                .catch(error => {
                    throw new functions.https.HttpsError('internal', 'The company plan could not be updated.', error);
                });
};