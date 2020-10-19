import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from 'moment';

import * as Paystack from '../Schema/Paystack';
import { Company } from '../Schema/Company';
import { BillingIntervals } from '../Schema/Billing';

export default async (transaction: Paystack.Transaction) => {
    const company = await admin.firestore()
                                .collection('companies')
                                .where('emailId', '==', transaction.customer.email)
                                .get()
                                .then(async documentsSnapshot => {
                                    const document = documentsSnapshot.docs[0];

                                    if (!document) {
                                        throw new functions.https.HttpsError('internal', 'The associated company for the subscription could not be resolved.');
                                    }

                                    const documentData = Object.assign(document.data(), { id: document.id });

                                    return Company.parseAsync(documentData);
                                });

    if (transaction.metadata.planId !== company.plan.id) {
        throw new functions.https.HttpsError('failed-precondition', 'The plan associated with this payment does not match the company\'s current plan.');
    }

    if (!company.plan.billing) {
        throw new functions.https.HttpsError('failed-precondition', 'The current plan for the company does not have billing.');
    }

    if ((transaction.amount / 100) !== company.plan.billing.price) {
        throw new functions.https.HttpsError('failed-precondition', 'The plan has not been paid for in full.');
    }
    
    await admin.firestore()
                .doc(`companies/${company.id}`)
                .update({ 
                    subscription: {
                        endsAt: moment().add(BillingIntervals[company.plan.billing.interval], 'days').valueOf(),
                        transaction,
                        notified: false,
                    },
                })
                .catch(error => {
                    throw new functions.https.HttpsError('internal', 'The subscription could not be updated for the company', error);
                });
};