import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { PlanData } from '../Schema/Data';

export default async (planData: PlanData) => {
    await admin.firestore()
                .collection('plans')
                .add({
                    ...planData,
                })
                .catch(error => {
                    throw new functions.https.HttpsError('internal', 'The plan record could not be added', error);
                });
};