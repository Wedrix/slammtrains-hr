import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { PlanData } from '../Schema/Data';
import { resolveCompany } from '../Helpers/ResolveDocuments';

export default async (planData: PlanData, companyId: string) => {
    const company = await resolveCompany(`companies/${companyId}`);

    if (planData.licensedNumberOfEmployees < company.employeesTotalCount) {
        throw new functions.https.HttpsError('failed-precondition', 'The new plan does not have enough licenses for all the company\'s employees');
    }

    const plan = { ...planData };
    
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

    // Send Email Notification
    await admin.firestore()
            .collection('mail')
            .add({
                to: company.hr.email,
                message: {
                    subject: `Plan changed to custom plan`,
                    html: `Hello ${company.hr.name},
                        <br/>Your plan has been changed to a custom plan for your business.
                        <br/>To activate the plan, kindly log in, navigate to Settings -> Billing and click on the 'Activate Plan' button.
                        <br/>Thank You.`,
                }
            })
            .catch(error => {
                throw new functions.https.HttpsError('internal', 'The mail record could not be added', error);
            });
};